import React, { useState } from 'react';
import { Star, Lock, X, Play, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { LevelConfig } from '../types';
import { getLevelConfig, TOTAL_LEVELS } from '../game/levels';

interface LevelSelectModalProps {
  currentLevelId: number;
  unlockedLevel: number;
  starsEarned: Record<number, number>;
  highScores: Record<number, number>;
  onSelectLevel: (level: LevelConfig) => void;
  onClose: () => void;
}

const LEVELS_PER_PAGE = 20;

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  currentLevelId,
  unlockedLevel,
  starsEarned,
  highScores,
  onSelectLevel,
  onClose,
}) => {
  // Initialize page to show current level
  const initialPage = Math.floor((currentLevelId - 1) / LEVELS_PER_PAGE);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [jumpInput, setJumpInput] = useState<string>('');

  const totalPages = Math.ceil(TOTAL_LEVELS / LEVELS_PER_PAGE);
  const startLevelId = currentPage * LEVELS_PER_PAGE + 1;
  const endLevelId = Math.min(TOTAL_LEVELS, (currentPage + 1) * LEVELS_PER_PAGE);

  // Generate levels for current page
  const pageLevels: LevelConfig[] = [];
  for (let id = startLevelId; id <= endLevelId; id++) {
    pageLevels.push(getLevelConfig(id));
  }

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = parseInt(jumpInput.trim(), 10);
    if (!isNaN(targetId) && targetId >= 1 && targetId <= TOTAL_LEVELS) {
      if (targetId <= unlockedLevel) {
        onSelectLevel(getLevelConfig(targetId));
        onClose();
      } else {
        // Move to the page where this level is located
        const targetPage = Math.floor((targetId - 1) / LEVELS_PER_PAGE);
        setCurrentPage(targetPage);
      }
      setJumpInput('');
    }
  };

  const handleJumpToCurrent = () => {
    const page = Math.floor((currentLevelId - 1) / LEVELS_PER_PAGE);
    setCurrentPage(page);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-stone-900 via-stone-850 to-stone-950 border-2 border-emerald-600/50 p-5 shadow-2xl flex flex-col gap-3.5 max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white font-['Fredoka']">
                Select Level
              </h2>
              <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                1 - 1000
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Highest Unlocked: Level {unlockedLevel} / {TOTAL_LEVELS}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Jump & Search Form */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleJumpSubmit} className="flex-1 flex items-center bg-stone-950/80 rounded-xl border border-stone-700/80 px-2.5 py-1">
            <Search size={14} className="text-stone-400 mr-1.5 shrink-0" />
            <input
              type="number"
              min={1}
              max={TOTAL_LEVELS}
              placeholder="Jump to Level (1-1000)..."
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder:text-stone-500 focus:outline-none"
            />
            <button
              type="submit"
              className="ml-1 text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-stone-950 rounded-md cursor-pointer"
            >
              Go
            </button>
          </form>

          <button
            onClick={handleJumpToCurrent}
            className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-300 text-xs font-bold shrink-0 transition active:scale-95 cursor-pointer"
            title="Jump to current level"
          >
            Current
          </button>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-2 py-1 rounded-xl bg-stone-900/90 border border-stone-800 text-xs">
          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            className="flex items-center gap-1 font-bold text-stone-300 hover:text-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>

          <span className="font-extrabold text-stone-200">
            Levels {startLevelId} – {endLevelId} <span className="text-stone-500">({currentPage + 1}/{totalPages})</span>
          </span>

          <button
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            className="flex items-center gap-1 font-bold text-stone-300 hover:text-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Level Cards Grid */}
        <div className="grid grid-cols-2 gap-2.5 overflow-y-auto pr-1 py-1 max-h-[52vh]">
          {pageLevels.map((lvl) => {
            const isUnlocked = lvl.id <= unlockedLevel;
            const isCurrent = lvl.id === currentLevelId;
            const stars = starsEarned[lvl.id] || 0;
            const highScore = highScores[lvl.id] || 0;

            return (
              <button
                key={lvl.id}
                id={`level-card-${lvl.id}`}
                disabled={!isUnlocked}
                onClick={() => {
                  onSelectLevel(lvl);
                  onClose();
                }}
                className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between gap-1.5 transition cursor-pointer ${
                  !isUnlocked
                    ? 'bg-stone-900/40 border-stone-800/80 opacity-40 cursor-not-allowed'
                    : isCurrent
                    ? 'bg-gradient-to-br from-emerald-900/60 to-stone-900 border-emerald-500 shadow-md shadow-emerald-950/50 scale-[1.02]'
                    : 'bg-stone-850/90 hover:bg-stone-800 border-stone-700/90 hover:border-emerald-500/60'
                }`}
              >
                {/* Level Title & Status */}
                <div className="flex items-start justify-between gap-1">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wide">
                      Level {lvl.id}
                    </span>
                    <span className="font-bold text-xs text-white truncate">
                      {lvl.title.replace(/^Level \d+: /, '')}
                    </span>
                  </div>
                  {!isUnlocked ? (
                    <Lock size={14} className="text-stone-500 shrink-0 mt-0.5" />
                  ) : isCurrent ? (
                    <span className="text-[9px] font-black bg-emerald-500 text-stone-950 px-1 py-0.5 rounded shrink-0">
                      PLAYING
                    </span>
                  ) : (
                    <Play size={12} className="text-stone-400 shrink-0 mt-0.5" />
                  )}
                </div>

                {/* Stars & High Score */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-800/80">
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        size={11}
                        className={
                          s <= stars
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-700 fill-stone-800'
                        }
                      />
                    ))}
                  </div>

                  {highScore > 0 && (
                    <span className="text-[10px] font-bold text-amber-300 font-['Nunito']">
                      {highScore.toLocaleString()}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
