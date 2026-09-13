import React from 'react';
import { X, Target, GitCommit, Zap, HelpCircle } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-stone-900 via-stone-850 to-stone-950 border-2 border-emerald-600/50 p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-['Fredoka']">
                How to Play
              </h2>
              <p className="text-xs text-stone-400">Animal Shooter Guide & Rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content list */}
        <div className="flex flex-col gap-3.5 overflow-y-auto pr-1 text-xs text-stone-300 max-h-[60vh]">
          {/* Rule 1: Monkey Cannon Aim & Launch */}
          <div className="p-3 rounded-2xl bg-stone-900/80 border border-stone-800 flex gap-3 items-start">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <Target size={18} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white mb-0.5">Monkey Cannon & Aiming</h4>
              <p className="text-stone-400 leading-relaxed">
                Touch and drag on screen to aim the animated Monkey Cannon, or press the dedicated <span className="text-amber-400 font-bold">FIRE! 🐵</span> button. The projectile launches right out of the monkey's open mouth with recoil and muzzle sparks!
              </p>
            </div>
          </div>

          {/* Rule 2: Animal Groups */}
          <div className="p-3 rounded-2xl bg-stone-900/80 border border-stone-800 flex gap-3 items-start">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <GitCommit size={18} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white mb-0.5">Connect 3+ Matching Animals</h4>
              <p className="text-stone-400 leading-relaxed">
                Each round piece represents a cute animal (Panda, Tiger, Lion, Frog, Fox, Monkey, Rabbit, Elephant). Connect 3 or more of the same animal type to burst the entire group!
              </p>
            </div>
          </div>

          {/* Rule 3: Cascading Drops */}
          <div className="p-3 rounded-2xl bg-stone-900/80 border border-stone-800 flex gap-3 items-start">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 shrink-0">
              <Zap size={18} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white mb-0.5">Trigger Drop Cascades</h4>
              <p className="text-stone-400 leading-relaxed">
                Animal pieces must remain connected to the top ceiling canopy. When you burst their supporting roots, disconnected pieces physically tumble down with gravity for massive combo bonuses!
              </p>
            </div>
          </div>

          {/* Rule 4: Special Pieces */}
          <div className="p-3 rounded-2xl bg-stone-900/80 border border-stone-800 flex flex-col gap-2">
            <h4 className="font-extrabold text-sm text-white">Special Pieces & Hazards</h4>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="p-2 rounded-xl bg-stone-800/80 border border-stone-700 flex flex-col items-center gap-1">
                <span className="text-lg">🪨</span>
                <span className="font-bold text-stone-200">Ancient Rock</span>
                <span className="text-[10px] text-stone-400">Cannot match. Drop by clearing anchors!</span>
              </div>
              <div className="p-2 rounded-xl bg-stone-800/80 border border-stone-700 flex flex-col items-center gap-1">
                <span className="text-lg">⭐</span>
                <span className="font-bold text-amber-300">Rainbow Star</span>
                <span className="text-[10px] text-stone-400">Wildcard! Matches any animal team.</span>
              </div>
              <div className="p-2 rounded-xl bg-stone-800/80 border border-stone-700 flex flex-col items-center gap-1">
                <span className="text-lg">💣</span>
                <span className="font-bold text-rose-400">Bomb Coconut</span>
                <span className="text-[10px] text-stone-400">Detonates in a huge circular blast radius!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Got it button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-sm transition active:scale-95 cursor-pointer shadow-lg"
        >
          Got It, Let's Play!
        </button>
      </div>
    </div>
  );
};
