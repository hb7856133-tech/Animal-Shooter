import React, { useState, useEffect, useCallback } from 'react';
import { LevelConfig } from './types';
import { getLevelConfig, TOTAL_LEVELS } from './game/levels';
import { Header } from './components/Header';
import { GameCanvas } from './components/GameCanvas';
import { PauseModal } from './components/PauseModal';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { sounds } from './game/audio';

export default function App() {
  // Current Level
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(() => getLevelConfig(1));
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);
  const [starsEarned, setStarsEarned] = useState<Record<number, number>>({});
  const [highScores, setHighScores] = useState<Record<number, number>>({});

  // Dynamic Level Play State
  const [score, setScore] = useState<number>(0);
  const [shotsRemaining, setShotsRemaining] = useState<number>(() => getLevelConfig(1).maxShots);
  const [comboCount, setComboCount] = useState<number>(0);

  // Modals & UI Controls
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isDefeat, setIsDefeat] = useState<boolean>(false);
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getMuted());

  // Canvas key to force re-render/reset when restarting level
  const [gameKey, setGameKey] = useState<number>(0);

  // Load saved progression from localStorage
  useEffect(() => {
    try {
      const savedUnlocked = localStorage.getItem('animal_shooter_unlocked');
      if (savedUnlocked) {
        setUnlockedLevel(Math.max(1, parseInt(savedUnlocked, 10)));
      }

      const savedStars = localStorage.getItem('animal_shooter_stars');
      if (savedStars) {
        setStarsEarned(JSON.parse(savedStars));
      }

      const savedScores = localStorage.getItem('animal_shooter_highscores');
      if (savedScores) {
        setHighScores(JSON.parse(savedScores));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save progress helper
  const saveProgress = (levelId: number, levelStars: number, levelScore: number) => {
    try {
      const nextUnlocked = Math.max(unlockedLevel, Math.min(levelId + 1, TOTAL_LEVELS));
      setUnlockedLevel(nextUnlocked);
      localStorage.setItem('animal_shooter_unlocked', String(nextUnlocked));

      const updatedStars = {
        ...starsEarned,
        [levelId]: Math.max(starsEarned[levelId] || 0, levelStars),
      };
      setStarsEarned(updatedStars);
      localStorage.setItem('animal_shooter_stars', JSON.stringify(updatedStars));

      const updatedScores = {
        ...highScores,
        [levelId]: Math.max(highScores[levelId] || 0, levelScore),
      };
      setHighScores(updatedScores);
      localStorage.setItem('animal_shooter_highscores', JSON.stringify(updatedScores));
    } catch {
      // Ignore storage errors
    }
  };

  // Start / Reset Level
  const startLevel = useCallback((lvl: LevelConfig) => {
    setCurrentLevel(lvl);
    setScore(0);
    setShotsRemaining(lvl.maxShots);
    setComboCount(0);
    setIsPaused(false);
    setIsVictory(false);
    setIsDefeat(false);
    setGameKey((prev) => prev + 1);
  }, []);

  // Handlers
  const handleVictory = (finalScore: number, shotsLeft: number) => {
    let earnedStars = 1;
    if (finalScore >= currentLevel.starScores[2] || shotsLeft >= 8) {
      earnedStars = 3;
    } else if (finalScore >= currentLevel.starScores[1] || shotsLeft >= 4) {
      earnedStars = 2;
    }

    saveProgress(currentLevel.id, earnedStars, finalScore);
    setIsVictory(true);
  };

  const handleDefeat = (finalScore: number) => {
    if (finalScore > (highScores[currentLevel.id] || 0)) {
      const updatedScores = { ...highScores, [currentLevel.id]: finalScore };
      setHighScores(updatedScores);
      try {
        localStorage.setItem('animal_shooter_highscores', JSON.stringify(updatedScores));
      } catch {}
    }
    setIsDefeat(true);
  };

  const handleNextLevel = () => {
    const nextLevelId = currentLevel.id + 1;
    if (nextLevelId <= TOTAL_LEVELS) {
      startLevel(getLevelConfig(nextLevelId));
    } else {
      // Loop back or open level select
      setShowLevelSelect(true);
    }
  };

  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="w-full h-screen h-dvh bg-stone-950 text-white flex flex-col items-center justify-between overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/40 via-stone-950 to-stone-950 pointer-events-none" />

      {/* Game Header HUD */}
      <Header
        level={currentLevel}
        score={score}
        shotsRemaining={shotsRemaining}
        comboCount={comboCount}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onPause={() => setIsPaused(true)}
        onOpenLevelSelect={() => setShowLevelSelect(true)}
        onOpenHelp={() => setShowHelp(true)}
      />

      {/* Main Canvas Container */}
      <main className="flex-1 w-full max-w-[440px] flex items-center justify-center p-2 relative">
        <GameCanvas
          key={gameKey}
          level={currentLevel}
          score={score}
          shotsRemaining={shotsRemaining}
          onScoreChange={setScore}
          onShotsChange={setShotsRemaining}
          onComboChange={setComboCount}
          onVictory={handleVictory}
          onDefeat={handleDefeat}
          isPaused={isPaused || isVictory || isDefeat || showLevelSelect || showHelp}
        />
      </main>

      {/* Modals */}
      {isPaused && (
        <PauseModal
          level={currentLevel}
          score={score}
          isMuted={isMuted}
          onResume={() => setIsPaused(false)}
          onRestart={() => startLevel(currentLevel)}
          onToggleMute={handleToggleMute}
          onOpenLevelSelect={() => {
            setIsPaused(false);
            setShowLevelSelect(true);
          }}
        />
      )}

      {isVictory && (
        <VictoryModal
          level={currentLevel}
          score={score}
          shotsLeft={shotsRemaining}
          onNextLevel={handleNextLevel}
          onReplay={() => startLevel(currentLevel)}
          onOpenLevelSelect={() => {
            setIsVictory(false);
            setShowLevelSelect(true);
          }}
        />
      )}

      {isDefeat && (
        <GameOverModal
          level={currentLevel}
          score={score}
          onRetry={() => startLevel(currentLevel)}
          onOpenLevelSelect={() => {
            setIsDefeat(false);
            setShowLevelSelect(true);
          }}
        />
      )}

      {showLevelSelect && (
        <LevelSelectModal
          currentLevelId={currentLevel.id}
          unlockedLevel={unlockedLevel}
          starsEarned={starsEarned}
          highScores={highScores}
          onSelectLevel={(lvl) => startLevel(lvl)}
          onClose={() => setShowLevelSelect(false)}
        />
      )}

      {showHelp && <HowToPlayModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}
