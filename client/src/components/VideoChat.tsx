'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import SimplePeer from 'simple-peer';
import { Camera, CameraOff, Mic, MicOff, Send, SkipForward, Users, MessageSquare } from 'lucide-react';

const SOCKET_SERVER_URL = 'http://localhost:5001'; // Match with your backend port

export default function VideoChat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [peer, setPeer] = useState<SimplePeer.Instance | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const [status, setStatus] = useState<'idle' | 'waiting' | 'connected'>('idle');
  const [roomId, setRoomId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<{ sender: 'me' | 'peer', text: string }[]>([]);
  const [inputText, setInputText] = useState('');
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Initialize Socket
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    // Get Media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = currentStream;
        }
      })
      .catch((err) => console.error('Failed to get local stream', err));

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('waiting_for_match', () => {
      setStatus('waiting');
    });

    socket.on('match_found', (data: { roomId: string, initiator: string }) => {
      setStatus('connected');
      setRoomId(data.roomId);
      setMessages([]);
      
      const isInitiator = data.initiator === socket.id;
      
      // Initialize Peer
      const newPeer = new SimplePeer({
        initiator: isInitiator,
        trickle: false,
        stream: stream || undefined,
      });

      newPeer.on('signal', (signalData) => {
        if (isInitiator) {
          socket.emit('offer', { offer: signalData, roomId: data.roomId });
        } else {
          socket.emit('answer', { answer: signalData, roomId: data.roomId });
        }
      });

      newPeer.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      setPeer(newPeer);
    });

    socket.on('offer', (offer) => {
      peer?.signal(offer);
    });

    socket.on('answer', (answer) => {
      peer?.signal(answer);
    });

    socket.on('receive_message', (data: { sender: string, text: string }) => {
      setMessages((prev) => [...prev, { sender: 'peer', text: data.text }]);
    });

    socket.on('peer_disconnected', () => {
      handleNext();
    });

    return () => {
      socket.off('waiting_for_match');
      socket.off('match_found');
      socket.off('offer');
      socket.off('answer');
      socket.off('receive_message');
      socket.off('peer_disconnected');
    };
  }, [socket, peer, stream]);

  const findMatch = () => {
    if (socket) {
      socket.emit('find_match', { tags: [] });
      setStatus('waiting');
    }
  };

  const handleNext = () => {
    if (socket && roomId) {
      socket.emit('leave_room', { roomId });
    }
    if (peer) {
      peer.destroy();
      setPeer(null);
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    setRoomId(null);
    findMatch();
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && socket && roomId) {
      socket.emit('send_message', { text: inputText, roomId });
      setMessages((prev) => [...prev, { sender: 'me', text: inputText }]);
      setInputText('');
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !isVideoEnabled;
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !isAudioEnabled;
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] w-full gap-4">
      {/* Video Area */}
      <div className="flex-1 flex flex-col gap-4 relative">
        <div className="flex-1 bg-black rounded-2xl overflow-hidden relative border border-white/10 shadow-2xl">
          {/* Remote Video (Main) */}
          <video 
            playsInline 
            autoPlay 
            ref={remoteVideoRef} 
            className="w-full h-full object-cover"
          />
          
          {/* Status Overlay */}
          {status !== 'connected' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
              <div className="text-center">
                {status === 'idle' ? (
                  <button onClick={findMatch} className="btn-primary text-xl px-8 py-4">
                    Start Matching
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xl font-medium text-white/80">Looking for a stranger...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Local Video (PiP) */}
          <div className="absolute bottom-4 right-4 w-32 h-48 sm:w-48 sm:h-64 bg-slate-900 rounded-xl overflow-hidden border-2 border-white/20 shadow-xl z-20">
            <video 
              playsInline 
              autoPlay 
              muted 
              ref={localVideoRef} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-md p-3 rounded-2xl border border-white/10 z-20">
            <button onClick={toggleAudio} className={`p-3 rounded-xl transition-colors ${isAudioEnabled ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}>
              {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button onClick={toggleVideo} className={`p-3 rounded-xl transition-colors ${isVideoEnabled ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}>
              {isVideoEnabled ? <Camera size={20} /> : <CameraOff size={20} />}
            </button>
            <button onClick={handleNext} className="btn-secondary flex items-center gap-2">
              <SkipForward size={20} />
              <span className="hidden sm:inline">Next</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="w-full lg:w-96 glass-panel rounded-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-3">
          <Users className="text-indigo-400" />
          <h2 className="font-semibold text-lg">Stranger</h2>
          {status === 'connected' && (
            <span className="ml-auto flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          )}
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 space-y-2">
          {messages.length === 0 && status === 'connected' ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              <p>You're now chatting with a random stranger.</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'me' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 rounded-tl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={sendMessage} className="p-4 bg-black/40 border-t border-white/10 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={status !== 'connected'}
            placeholder={status === 'connected' ? "Type a message..." : "Waiting for connection..."}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={status !== 'connected' || !inputText.trim()}
            className="bg-indigo-500 text-white p-3 rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:hover:bg-indigo-500"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
