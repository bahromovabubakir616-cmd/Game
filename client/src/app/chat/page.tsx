import VideoChat from '@/components/VideoChat';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="min-h-screen p-4 flex flex-col">
      <header className="flex justify-between items-center mb-6 px-2">
        <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
          OmegleClone
        </Link>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <ShieldAlert size={16} />
            Community Guidelines
          </button>
        </div>
      </header>
      
      <main className="flex-1">
        <VideoChat />
      </main>
    </div>
  );
}
