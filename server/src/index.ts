import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import Redis from 'ioredis';
import mongoose from 'mongoose';

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
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
