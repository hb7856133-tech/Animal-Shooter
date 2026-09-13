import React from 'react';
import { Volume2, VolumeX, Pause, HelpCircle, Layers } from 'lucide-react';
import { LevelConfig } from '../types';

interface HeaderProps {
  level: LevelConfig;
  score: number;
  shotsRemaining: number;
  comboCount: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenLevelSelect: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  level,
  score,
  shotsRemaining,
  comboCount,
  isMuted,
  onToggleMute,
  onPause,
  onOpenLevelSelect,
  onOpenHelp,
}) => {
  const isLowShots = shotsRemaining <= 5;

  return (
    <header className="w-full max-w-[440px] px-3 pt-2 pb-1 flex flex-col gap-1.5 select-none">
      {/* Top action row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            id="open-level-select-btn"
            onClick={onOpenLevelSelect}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-800/90 hover:bg-stone-700/90 border border-stone-700 text-stone-200 text-xs font-bold shadow-sm transition-colors cursor-pointer active:scale-95"
            title="Select Level"
          >
            <Layers size={14} className="text-emerald-400" />
            <span>Lvl {level.id}</span>
          </button>

          <button
            id="open-help-modal-btn"
            onClick={onOpenHelp}
            className="p-1.5 rounded-xl bg-stone-800/90 hover:bg-stone-700/90 border border-stone-700 text-stone-300 transition-colors cursor-pointer active:scale-95"
            title="How to Play"
          >
            <HelpCircle size={15} />
          </button>
        </div>

        {/* Brand title */}
        <div className="flex items-center gap-1">
          <span className="text-sm font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-emerald-300 to-teal-400 font-['Fredoka']">
            Animal Shooter
          </span>
        </div>

        {/* Right controls: Mute & Pause */}
        <div className="flex items-center gap-1.5">
          <button
            id="toggle-audio-mute-btn"
            onClick={onToggleMute}
            className="p-1.5 rounded-xl bg-stone-800/90 hover:bg-stone-700/90 border border-stone-700 text-stone-300 transition-colors cursor-pointer active:scale-95"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX size={15} className="text-rose-400" /> : <Volume2 size={15} className="text-emerald-400" />}
          </button>

          <button
            id="pause-game-btn"
            onClick={onPause}
            className="p-1.5 rounded-xl bg-stone-800/90 hover:bg-stone-700/90 border border-stone-700 text-stone-300 transition-colors cursor-pointer active:scale-95"
            title="Pause Game"
          >
            <Pause size={15} />
          </button>
        </div>
      </div>

      {/* Main Stats Bar: Score, Level Name, Shots Left */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-2xl bg-stone-900/90 border border-emerald-900/60 shadow-lg">
        {/* Score Counter */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Score</span>
          <span className="text-base font-black text-amber-300 tracking-tight font-['Nunito']">
            {score.toLocaleString()}
          </span>
        </div>

        {/* Combo / Level Title */}
        <div className="flex flex-col items-center">
          {comboCount > 1 ? (
            <span className="text-xs font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40 animate-pulse">
              ⚡ {comboCount}x COMBO!
            </span>
          ) : (
            <span className="text-xs font-bold text-stone-300 max-w-[130px] truncate text-center">
              {level.title}
            </span>
          )}
        </div>

        {/* Shots Counter */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Shots</span>
          <div className="flex items-center gap-1">
            <span
              className={`text-base font-black font-['Nunito'] ${
                isLowShots ? 'text-rose-400 animate-bounce' : 'text-emerald-400'
              }`}
            >
              {shotsRemaining}
            </span>
            <span className="text-stone-500 text-xs">/ {level.maxShots}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
