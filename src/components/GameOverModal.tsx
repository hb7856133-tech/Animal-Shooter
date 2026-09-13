import React from 'react';
import { RotateCcw, Layers } from 'lucide-react';
import { LevelConfig } from '../types';

interface GameOverModalProps {
  level: LevelConfig;
  score: number;
  onRetry: () => void;
  onOpenLevelSelect: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  level,
  score,
  onRetry,
  onOpenLevelSelect,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-stone-900 via-rose-950/70 to-stone-950 border-2 border-rose-600/50 p-6 shadow-2xl shadow-rose-950/60 flex flex-col items-center gap-5 text-center">
        {/* Header */}
        <div>
          <div className="inline-block px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 font-extrabold text-xs uppercase tracking-wider mb-2 border border-rose-500/30">
            Out of Shots!
          </div>
          <h2 className="text-3xl font-black text-white font-['Fredoka']">
            Game Over
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Don't give up! Look for bank shots to trigger bigger drops.
          </p>
        </div>

        {/* Score Card */}
        <div className="w-full bg-stone-950/80 rounded-2xl p-4 border border-rose-900/40 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-stone-400">Score Achieved</span>
          <div className="text-2xl font-black text-amber-300 font-['Nunito']">
            {score.toLocaleString()}
          </div>
          <span className="text-[11px] text-stone-400 mt-1">
            Level {level.id}: {level.title}
          </span>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            id="gameover-retry-btn"
            onClick={onRetry}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-stone-950 font-black text-base shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw size={18} />
            <span>Try Again</span>
          </button>

          <button
            id="gameover-levels-btn"
            onClick={onOpenLevelSelect}
            className="w-full py-2.5 px-4 rounded-2xl bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-300 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <Layers size={16} className="text-amber-400" />
            <span>Select Another Level</span>
          </button>
        </div>
      </div>
    </div>
  );
};
