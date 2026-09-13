import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Layers, X } from 'lucide-react';
import { LevelConfig } from '../types';

interface PauseModalProps {
  level: LevelConfig;
  score: number;
  isMuted: boolean;
  onResume: () => void;
  onRestart: () => void;
  onToggleMute: () => void;
  onOpenLevelSelect: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  level,
  score,
  isMuted,
  onResume,
  onRestart,
  onToggleMute,
  onOpenLevelSelect,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-stone-850 to-stone-900 border-2 border-emerald-600/50 p-6 shadow-2xl flex flex-col items-center gap-5 text-center">
        {/* Close Button */}
        <button
          onClick={onResume}
          className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-full hover:bg-stone-800 transition cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-black text-white font-['Fredoka'] tracking-wide">
            Game Paused
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Level {level.id}: {level.title}
          </p>
        </div>

        {/* Current Score */}
        <div className="w-full bg-stone-950/80 rounded-2xl p-3 border border-stone-800 flex justify-around items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400">Current Score</span>
            <div className="text-xl font-black text-amber-300 font-['Nunito']">
              {score.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Menu Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            id="pause-resume-btn"
            onClick={onResume}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-black text-base shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <Play size={18} fill="currentColor" />
            <span>Resume</span>
          </button>

          <button
            id="pause-restart-btn"
            onClick={onRestart}
            className="w-full py-3 px-4 rounded-2xl bg-stone-800 hover:bg-stone-750 border border-stone-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>Restart Level</span>
          </button>

          <div className="flex gap-2 w-full">
            <button
              id="pause-mute-toggle-btn"
              onClick={onToggleMute}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-300 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              {isMuted ? <VolumeX size={16} className="text-rose-400" /> : <Volume2 size={16} className="text-emerald-400" />}
              <span>{isMuted ? 'Unmute' : 'Sound On'}</span>
            </button>

            <button
              id="pause-level-select-btn"
              onClick={onOpenLevelSelect}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-300 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Layers size={16} className="text-amber-400" />
              <span>All Levels</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
