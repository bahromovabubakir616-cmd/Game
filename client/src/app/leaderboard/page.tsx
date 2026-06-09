'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, ChevronLeft, Star, Medal, Users } from 'lucide-react';

interface LeaderboardUser {
  _id: string; // username
  totalScore: number;
  matches: number;
  wins: number;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5001/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch leaderboard:', err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen p-6 md:p-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto z-10 relative">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
          <ChevronLeft size={20} />
          Bosh sahifaga qaytish
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-yellow-500/10 text-yellow-500 rounded-full mb-6 ring-1 ring-yellow-500/20">
            <Trophy size={48} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
            Top Foydalanuvchilar
          </h1>
          <p className="text-slate-400 text-lg">Eng yuqori ball to'plagan va faol foydalanuvchilar reytingi</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/5 font-semibold text-sm text-slate-400 uppercase tracking-wider">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-5">Foydalanuvchi</div>
              <div className="col-span-2 text-center" title="Umumiy Ball">Umumiy Ball</div>
              <div className="col-span-2 text-center" title="Suhbatlar">Suhbatlar</div>
              <div className="col-span-2 text-center" title="G'alabalar">G'alabalar</div>
            </div>

            <div className="divide-y divide-white/5">
              {users.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Star className="mx-auto mb-4 opacity-50" size={32} />
                  Hali natijalar yo'q. Birinchi bo'lib baholashdan o'ting!
                </div>
              ) : (
                users.map((user, index) => (
                  <div key={user._id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors">
                    <div className="col-span-1 text-center font-mono text-lg font-bold">
                      {index === 0 ? <Medal className="mx-auto text-yellow-400" size={24} /> : 
                       index === 1 ? <Medal className="mx-auto text-slate-300" size={24} /> : 
                       index === 2 ? <Medal className="mx-auto text-amber-700" size={24} /> : 
                       <span className="text-slate-500">{index + 1}</span>}
                    </div>
                    <div className="col-span-5 font-semibold flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                        {user._id.charAt(0).toUpperCase()}
                      </div>
                      <span className={index < 3 ? "text-white" : "text-slate-300"}>{user._id}</span>
                    </div>
                    <div className="col-span-2 text-center font-mono text-lg text-indigo-400 font-semibold">
                      {user.totalScore}
                    </div>
                    <div className="col-span-2 text-center text-slate-300 flex items-center justify-center gap-1">
                      <Users size={14} className="text-slate-500" />
                      {user.matches}
                    </div>
                    <div className="col-span-2 text-center text-green-400 flex items-center justify-center gap-1">
                      <Trophy size={14} className="text-green-500/70" />
                      {user.wins}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
