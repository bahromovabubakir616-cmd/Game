import { X, Trophy, Star } from 'lucide-react';
import React from 'react';

interface IEvaluationScore {
  communicationActivity: number;
  speechFluency: number;
  politeness: number;
  engagement: number;
  overallImpression: number;
}

interface IParticipant {
  socketId: string;
  username: string;
  scores: IEvaluationScore;
  totalScore: number;
}

interface EvaluationData {
  participants: IParticipant[];
  winnerSocketId: string;
}

interface Props {
  data: EvaluationData;
  mySocketId: string;
  onClose: () => void;
}

export default function EvaluationModal({ data, mySocketId, onClose }: Props) {
  const me = data.participants.find(p => p.socketId === mySocketId);
  const peer = data.participants.find(p => p.socketId !== mySocketId);
  
  if (!me || !peer) return null;

  const isWinner = data.winnerSocketId === mySocketId;

  const renderScores = (title: string, scores: IEvaluationScore, total: number, isWinner: boolean) => (
    <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10 relative overflow-hidden">
      {isWinner && (
        <div className="absolute top-0 right-0 bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-bl-xl font-medium text-xs border-l border-b border-yellow-500/30 flex items-center gap-1">
          <Trophy size={12} />
          WINNER
        </div>
      )}
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        {title}
        <span className="text-sm font-normal text-slate-400">({total}/50)</span>
      </h3>
      
      <div className="space-y-3">
        <ScoreRow label="Muloqot faolligi" score={scores.communicationActivity} />
        <ScoreRow label="Nutq ravonligi" score={scores.speechFluency} />
        <ScoreRow label="Hurmat va odob" score={scores.politeness} />
        <ScoreRow label="Qiziqarlilik" score={scores.engagement} />
        <ScoreRow label="Umumiy taassurot" score={scores.overallImpression} />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <Star size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Baholash Natijalari</h2>
              <p className="text-slate-400 text-sm">Sun'iy intellekt xulosasi</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {isWinner ? (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center gap-2">
                  <Trophy className="text-yellow-500" />
                  Siz G'olib Bo'ldingiz!
                </span>
              ) : (
                <span className="text-slate-300">Runner Up</span>
              )}
            </h1>
            <p className="text-slate-400">Umumiy natijalar asosida aniqlandi.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {renderScores("Sizning Natijangiz", me.scores, me.totalScore, data.winnerSocketId === me.socketId)}
            {renderScores("Suhbatdosh Natijasi", peer.scores, peer.totalScore, data.winnerSocketId === peer.socketId)}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreRow({ label, score }: { label: string, score: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="font-semibold">{score}/10</span>
      </div>
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
          style={{ width: `${(score / 10) * 100}%` }}
        />
      </div>
    </div>
  );
}
