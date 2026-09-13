import React, { useEffect, useState } from 'react';
import { Star, ArrowRight, RotateCcw, Layers } from 'lucide-react';
import { LevelConfig } from '../types';

interface VictoryModalProps {
  level: LevelConfig;
  score: number;
  shotsLeft: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenLevelSelect: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  score,
  shotsLeft,
  onNextLevel,
  onReplay,
  onOpenLevelSelect,
}) => {
  const [stars, setStars] = useState<number>(1);
  const [visibleStars, setVisibleStars] = useState<number>(0);

  // Calculate stars earned
  useEffect(() => {
    let earned = 1;
    if (score >= level.starScores[2] || shotsLeft >= 8) {
      earned = 3;
    } else if (score >= level.starScores[1] || shotsLeft >= 4) {
      earned = 2;
    }
    setStars(earned);

    // Star pop-in sequence
    const t1 = setTimeout(() => setVisibleStars(1), 250);
    const t2 = setTimeout(() => setVisibleStars(2), 550);
    const t3 = setTimeout(() => setVisibleStars(3), 850);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [score, shotsLeft, level]);

  const shotsBonus = shotsLeft * 300;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-stone-900 via-emerald-950 to-stone-950 border-2 border-emerald-500/60 p-6 shadow-2xl shadow-emerald-900/50 flex flex-col items-center gap-5 text-center">
        {/* Victory Header */}
        <div>
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-xs uppercase tracking-wider mb-2 border border-emerald-500/30">
            Level Complete!
          </div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-['Fredoka']">
            {level.title}
          </h2>
        </div>

        {/* 3 Stars Award Container */}
        <div className="flex justify-center items-center gap-2 py-2">
          {[1, 2, 3].map((starNum) => {
            const isAwarded = starNum <= stars;
            const isVisible = starNum <= visibleStars;
            return (
              <div
                key={starNum}
                className={`transition-all duration-300 transform ${
                  starNum === 2 ? '-translate-y-2' : ''
                } ${
                  isVisible
                    ? 'scale-100 opacity-100'
                    : 'scale-50 opacity-0'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${
                    isAwarded
                      ? 'bg-gradient-to-br from-amber-400 to-yellow-500 border-amber-300 shadow-lg shadow-amber-500/40 text-stone-950'
                      : 'bg-stone-800/80 border-stone-700 text-stone-600'
                  }`}
                >
                  <Star
                    size={28}
                    className={isAwarded ? 'fill-stone-950 text-stone-950' : 'text-stone-600'}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Score Breakdown Card */}
        <div className="w-full bg-stone-900/90 rounded-2xl p-4 border border-emerald-900/40 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs text-stone-300">
            <span>Remaining Shots ({shotsLeft})</span>
            <span className="font-bold text-emerald-400">+{shotsBonus.toLocaleString()}</span>
          </div>
          <div className="h-px bg-stone-800 my-0.5" />
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase font-bold text-stone-400">Final Score</span>
            <span className="text-2xl font-black text-amber-300 font-['Nunito']">
              {score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            id="victory-next-level-btn"
            onClick={onNextLevel}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 active:scale-95 text-stone-950 font-black text-base shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <span>Next Level</span>
            <ArrowRight size={20} />
          </button>

          <div className="flex gap-2 w-full">
            <button
              id="victory-replay-btn"
              onClick={onReplay}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-stone-800 hover:bg-stone-750 border border-stone-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <RotateCcw size={15} />
              <span>Replay</span>
            </button>

            <button
              id="victory-levels-btn"
              onClick={onOpenLevelSelect}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-300 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Layers size={15} className="text-emerald-400" />
              <span>All Levels</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
