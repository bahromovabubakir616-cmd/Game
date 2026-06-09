import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import Redis from 'ioredis';
import mongoose from 'mongoose';
import Evaluation from './models/Evaluation';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// For a real production app, you'd use a real Redis URL from env
// const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
// For this MVP without requiring a Redis server locally, we'll use an in-memory queue simulation.
const waitingUsers: { socketId: string, tags: string[] }[] = [];

// Leaderboard API
app.get('/api/leaderboard', async (req, res) => {
  try {
    // Get top users based on totalScore from past evaluations
    // Since evaluations store participants as an array, we unwind it to sort
    const topUsers = await Evaluation.aggregate([
      { $unwind: '$participants' },
      {
        $group: {
          _id: '$participants.username',
          totalScore: { $max: '$participants.totalScore' },
          matches: { $sum: 1 },
          wins: {
            $sum: {
              $cond: [{ $eq: ['$winnerSocketId', '$participants.socketId'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { totalScore: -1, wins: -1 } },
      { $limit: 10 }
    ]);
    
    res.json(topUsers);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

io.on('connection', (socket: Socket) => {
  console.log('User connected:', socket.id);

  socket.on('find_match', (data: { tags?: string[] }) => {
    console.log(`User ${socket.id} looking for match with tags:`, data.tags);
    
    // Simple matchmaking logic
    if (waitingUsers.length > 0) {
      const partner = waitingUsers.shift();
      if (partner) {
        // Match found!
        const roomId = `room_${socket.id}_${partner.socketId}`;
        
        socket.join(roomId);
        const partnerSocket = io.sockets.sockets.get(partner.socketId);
        if (partnerSocket) {
          partnerSocket.join(roomId);
          
          // Notify both users
          io.to(roomId).emit('match_found', { roomId, initiator: socket.id });
          console.log(`Matched ${socket.id} with ${partner.socketId}`);
        }
      }
    } else {
      // Add to waiting queue
      waitingUsers.push({ socketId: socket.id, tags: data.tags || [] });
      socket.emit('waiting_for_match');
    }
  });

  // WebRTC Signaling
  socket.on('offer', (data: { offer: any, roomId: string }) => {
    socket.to(data.roomId).emit('offer', data.offer);
  });

  socket.on('answer', (data: { answer: any, roomId: string }) => {
    socket.to(data.roomId).emit('answer', data.answer);
  });

  socket.on('ice_candidate', (data: { candidate: any, roomId: string }) => {
    socket.to(data.roomId).emit('ice_candidate', data.candidate);
  });

  // Chat
  socket.on('send_message', (data: { text: string, roomId: string }) => {
    socket.to(data.roomId).emit('receive_message', { sender: socket.id, text: data.text });
  });

  socket.on('typing', (data: { roomId: string, isTyping: boolean }) => {
    socket.to(data.roomId).emit('peer_typing', data.isTyping);
  });

  // Disconnect / Next
  socket.on('leave_room', (data: { roomId: string }) => {
    socket.leave(data.roomId);
    socket.to(data.roomId).emit('peer_disconnected');
  });

  // Evaluation
  socket.on('start_evaluation', (data: { roomId: string }) => {
    // Notify both users in the room that evaluation has started
    io.to(data.roomId).emit('evaluation_started');
    
    console.log(`Evaluation started in room ${data.roomId}`);

    // Wait 10 seconds, then generate simulated evaluation result
    setTimeout(async () => {
      // Find the two socket IDs in the room
      const room = io.sockets.adapter.rooms.get(data.roomId);
      if (!room) return; // Room closed before evaluation finished
      
      const socketsInRoom = Array.from(room);
      if (socketsInRoom.length < 2) return; // Someone left

      const socket1 = socketsInRoom[0];
      const socket2 = socketsInRoom[1];

      // Simulated scoring helper (1 to 10)
      const generateScores = () => ({
        communicationActivity: Math.floor(Math.random() * 5) + 6, // 6-10
        speechFluency: Math.floor(Math.random() * 5) + 6,
        politeness: Math.floor(Math.random() * 4) + 7, // 7-10
        engagement: Math.floor(Math.random() * 5) + 6,
        overallImpression: Math.floor(Math.random() * 4) + 7,
      });

      const calcTotal = (scores: any) => Object.values(scores).reduce((a: any, b: any) => a + b, 0) as number;

      const scores1 = generateScores();
      const scores2 = generateScores();
      const total1 = calcTotal(scores1);
      const total2 = calcTotal(scores2);

      const winnerSocketId = total1 >= total2 ? socket1 : socket2;

      // Generate random anonymous usernames for the demo
      const user1Name = `User_${socket1.substring(0, 4)}`;
      const user2Name = `User_${socket2.substring(0, 4)}`;

      const evaluationData = {
        participants: [
          { socketId: socket1, username: user1Name, scores: scores1, totalScore: total1 },
          { socketId: socket2, username: user2Name, scores: scores2, totalScore: total2 }
        ],
        winnerSocketId,
        roomId: data.roomId
      };

      try {
        // Save to DB
        const evalDoc = new Evaluation(evaluationData);
        await evalDoc.save();
      } catch (err) {
        console.error('Failed to save evaluation:', err);
      }

      // Emit results back to the room
      io.to(data.roomId).emit('evaluation_result', evaluationData);
    }, 10000); // 10 seconds
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove from waiting queue if they were in it
    const index = waitingUsers.findIndex(u => u.socketId === socket.id);
    if (index !== -1) {
      waitingUsers.splice(index, 1);
    }
  });
});

const PORT = process.env.PORT || 5001;

// Connect to MongoDB before starting server
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/omegle_clone';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    // Still start the server even if DB fails, for demo purposes
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (without DB)`);
    });
  });
