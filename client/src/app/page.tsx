import Link from 'next/link';
import { Video, MessageSquare, Shield, Globe, Trophy } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="z-10 max-w-5xl w-full text-center space-y-12">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Meet the world, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">instantly.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            The modern, premium way to meet new people. Experience high-quality random video and text chat with users from around the globe.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link href="/chat?mode=video" className="btn-primary flex items-center gap-2 text-lg px-8 py-4 w-full sm:w-auto justify-center">
            <Video size={24} />
            Video Chat
          </Link>
          <Link href="/chat?mode=text" className="btn-secondary flex items-center gap-2 text-lg px-8 py-4 w-full sm:w-auto justify-center">
            <MessageSquare size={24} />
            Text Chat
          </Link>
        </div>

        <div className="flex justify-center mt-6">
          <Link href="/leaderboard" className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 px-6 py-3 rounded-xl transition-all font-medium border border-yellow-500/20">
            <Trophy size={20} />
            Reytingni Ko'rish
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 mt-8 border-t border-white/10 text-left">
          <div className="glass-panel p-6 rounded-2xl">
            <div className="bg-indigo-500/20 p-3 rounded-xl w-fit mb-4 text-indigo-400">
              <Globe size={28} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Global Community</h3>
            <p className="text-slate-400 text-sm">Connect with millions of users worldwide and discover new cultures.</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl">
            <div className="bg-cyan-500/20 p-3 rounded-xl w-fit mb-4 text-cyan-400">
              <Video size={28} />
            </div>
            <h3 className="text-xl font-semibold mb-2">HD Video</h3>
            <p className="text-slate-400 text-sm">Crystal clear peer-to-peer video streaming powered by modern WebRTC.</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl">
            <div className="bg-rose-500/20 p-3 rounded-xl w-fit mb-4 text-rose-400">
              <Shield size={28} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
            <p className="text-slate-400 text-sm">Anonymous by default. We employ active moderation and simple reporting.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
