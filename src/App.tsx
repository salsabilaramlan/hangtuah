import { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine.ts';
import { SoundFX } from './game/sound.ts';
import { GameHUD } from './components/GameHUD.tsx';
import { BackgroundSettingsModal } from './components/BackgroundSettingsModal.tsx';
import {
  MenuModal,
  PauseModal,
  GuideModal,
  VictoryModal,
  GameOverModal
} from './components/GameModals.tsx';
import { MobileControls } from './components/MobileControls.tsx';
import type { BackgroundSettings, QuizQuestion, TimeOfDay } from './types.ts';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // HUD & Game States
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [missionText, setMissionText] = useState('');
  const [nearInteract, setNearInteract] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);

  // Dialog State
  const [currentDialog, setCurrentDialog] = useState<{
    speaker: string;
    avatar: string;
    type: 'fact' | 'lore';
    text: string;
  } | null>(null);

  // Quiz State (Chapter 3)
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [totalQuiz, setTotalQuiz] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<{ correct: boolean; text: string } | null>(null);

  const [quizCorrect, setQuizCorrect] = useState(0);
  const quizAnsweredRef = useRef(false);

  // Modals
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isPauseOpen, setIsPauseOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);
  const [isVictoryOpen, setIsVictoryOpen] = useState(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState(false);
  const [isMobileControlsVisible, setIsMobileControlsVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 840;
    }
    return false;
  });

  // Background Settings
  const [bgSettings, setBgSettings] = useState<BackgroundSettings>({
    timeOfDay: 'pagi',
    particlesEnabled: true,
    cloudsEnabled: true,
    waterWavesEnabled: true,
    fogDensity: 1.0,
    bloomGlow: true
  });

  // Slash attack flash effect
  const [isSlashFlashing, setIsSlashFlashing] = useState(false);

  // Chapter notification banner toast
  const [stageToast, setStageToast] = useState<{ title: string; subtitle: string } | null>(null);

  // Trigger slash visual flash
  const triggerSlashFlash = useCallback(() => {
    setIsSlashFlashing(true);
    setTimeout(() => setIsSlashFlashing(false), 120);
  }, []);

  // Initialize Game Engine on Canvas Mount
  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      const engine = new GameEngine(canvasRef.current);
      engineRef.current = engine;

      // Stage change hook: fires dynamically on every chapter change
      engine.onStageChange = (stageIdx: number, stageName: string, bannerText: string) => {
        setMissionText(bannerText);
        setStageToast({
          title: stageName,
          subtitle: bannerText
        });
        setTimeout(() => {
          setStageToast(null);
        }, 4200);
      };

      // Sync callbacks
      engine.onHUDUpdate = () => {
        setHearts(engine.hearts);
        setScore(engine.score);
        setStars(engine.stars);
        // Ensure missionText ALWAYS matches the current stage
        if (engine.stages[engine.currentStageIdx]) {
          setMissionText(engine.stages[engine.currentStageIdx].banner);
        }
      };

      engine.onDialogShow = (d) => {
        setCurrentDialog(d);
      };

      engine.onDialogClose = () => {
        setCurrentDialog(null);
      };

      engine.onNearInteractChange = (near) => {
        setNearInteract(near);
      };

      engine.onGameOver = () => {
        setIsGameOverOpen(true);
      };

      engine.onVictory = (finalScore, finalStars) => {
        setScore(finalScore);
        setStars(finalStars);
        setIsVictoryOpen(true);
      };

      engine.onQuizStart = () => {
        const qList = engine.stages[2].quizQuestions || [];
        setTotalQuiz(qList.length);
        setQuizCorrect(0);
        quizAnsweredRef.current = false;
        setQuizIndex(0);
        setQuizQuestion(qList[0] || null);
        setSelectedOptionIndex(null);
        setQuizFeedback(null);
        engine.isQuizActive = true;
      };

      // Load initial stage 0
      engine.loadStage(0);
      setBgSettings(engine.bgSettings);

      // Start loop
      engine.startLoop();

      return () => {
        engine.stopLoop();
      };
    } catch (err) {
      console.error("Failed to initialize GameEngine:", err);
    }
  }, []);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      if (target instanceof HTMLElement && target.closest('input, textarea, select, button, a, [contenteditable="true"]')) return;
      if (engineRef.current?.isVictory) return;
      SoundFX.init();
      const engine = engineRef.current;
      if (!engine) return;

      engine.keys[e.code] = true;

      if (engine.isDialogActive && (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        engine.showNextDialog();
        return;
      }

      if (e.code === 'KeyE' || e.code === 'Enter') {
        engine.handleInteract();
      }

      if (e.code === 'Space') {
        e.preventDefault();
        engine.handleJump();
      }

      if (e.code === 'KeyJ' || e.code === 'KeyF') {
        e.preventDefault();
        triggerSlashFlash();
        engine.handleAttack();
      }

      if (e.code === 'KeyQ' || e.code === 'KeyK') {
        e.preventDefault();
        engine.handleDash();
      }

      if (e.code === 'KeyP' || e.code === 'Escape') {
        setIsPauseOpen((prev) => {
          const next = !prev;
          engine.isPaused = next;
          return next;
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;
      engine.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [triggerSlashFlash]);

  // Handle Background Settings Update
  const handleUpdateBgSettings = (partial: Partial<BackgroundSettings>) => {
    setBgSettings((prev) => {
      const next = { ...prev, ...partial };
      if (engineRef.current) {
        engineRef.current.bgSettings = next;
      }
      return next;
    });
  };

  const handleSelectTimeOfDay = (tod: TimeOfDay) => {
    handleUpdateBgSettings({ timeOfDay: tod });
    if (engineRef.current) {
      engineRef.current.setTimeOfDay(tod);
    }
  };

  // Audio Toggle
  const handleToggleAudio = () => {
    SoundFX.init();
    SoundFX.enabled = !SoundFX.enabled;
    setIsAudioOn(SoundFX.enabled);
    if (SoundFX.enabled) {
      SoundFX.startBGM();
    } else {
      SoundFX.stopBGM();
    }
  };

  // Start game from main menu (can choose stage 0, 1, or 2)
  const handleStartGame = (stageIdx: number = 0) => {
    SoundFX.init();
    if (isAudioOn) SoundFX.startBGM();
    setIsMenuOpen(false);
    if (engineRef.current) {
      engineRef.current.isPaused = false;
      engineRef.current.loadStage(stageIdx);
    }
  };

  // Quiz Answer Handler
  const handleAnswerQuiz = (index: number) => {
    if (!quizQuestion || !engineRef.current || quizAnsweredRef.current) return;
    quizAnsweredRef.current = true;
    setSelectedOptionIndex(index);

    if (index === quizQuestion.correct) {
      setQuizCorrect(value => value + 1);
      SoundFX.playCorrect();
      setQuizFeedback({
        correct: true,
        text: quizQuestion.explanation
      });
      engineRef.current.score += 200;
      setScore(engineRef.current.score);
    } else {
      SoundFX.playWrong();
      setQuizFeedback({
        correct: false,
        text: quizQuestion.explanation
      });
    }
  };

  const handleNextQuizQuestion = () => {
    if (!engineRef.current) return;
    if (!quizAnsweredRef.current) return;
    quizAnsweredRef.current = false;
    const nextIdx = quizIndex + 1;
    const qList = engineRef.current.stages[2].quizQuestions || [];

    if (nextIdx >= qList.length) {
      // Freeze the game while the pupil enters their name and saves the badge.
      engineRef.current.isVictory = true;
      engineRef.current.isPaused = true;
      engineRef.current.keys = {};
      engineRef.current.joystick = { x: 0, y: 0, active: false };
      // Quiz Finished, Victory!
      engineRef.current.isQuizActive = false;
      engineRef.current.stars = 3;
      engineRef.current.score += 500;
      setStars(3);
      setScore(engineRef.current.score);
      setQuizQuestion(null);
      SoundFX.playVictory();
      setIsVictoryOpen(true);
    } else {
      setQuizIndex(nextIdx);
      setQuizQuestion(qList[nextIdx]);
      setSelectedOptionIndex(null);
      setQuizFeedback(null);
    }
  };

  return (
    <div id="game-viewport" className="relative w-screen h-screen overflow-hidden select-none bg-slate-950 font-sans">
      {/* 3D WebGL Canvas */}
      <canvas id="glcanvas" ref={canvasRef} className="w-full h-full block" />

      {/* Silat Attack Slash Radial Flash */}
      <div
        id="slash-flash-overlay"
        className={`absolute inset-0 pointer-events-none transition-opacity duration-100 z-10 ${
          isSlashFlashing
            ? 'opacity-100 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.35),transparent_70%)]'
            : 'opacity-0'
        }`}
      />

      {/* Top HUD & Interactive Overlays */}
      <GameHUD
        hearts={hearts}
        score={score}
        stars={stars}
        missionText={missionText}
        isAudioOn={isAudioOn}
        onToggleAudio={handleToggleAudio}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenBgSettings={() => setIsBgModalOpen(true)}
        onToggleTouch={() => setIsMobileControlsVisible((prev) => !prev)}
        onPause={() => {
          setIsPauseOpen(true);
          if (engineRef.current) engineRef.current.isPaused = true;
        }}
        nearInteract={nearInteract}
        dialog={currentDialog}
        onNextDialog={() => {
          if (engineRef.current) engineRef.current.showNextDialog();
        }}
        quizQuestion={quizQuestion}
        quizIndex={quizIndex}
        totalQuiz={totalQuiz}
        onAnswerQuiz={handleAnswerQuiz}
        quizFeedback={quizFeedback}
        onNextQuizQuestion={handleNextQuizQuestion}
        selectedOptionIndex={selectedOptionIndex}
      />

      {/* Mobile Touch Joystick and Action Buttons */}
      <MobileControls
        engine={engineRef.current}
        isVisible={isMobileControlsVisible}
        onAttack={triggerSlashFlash}
      />

      {/* Dynamic Chapter Announcement Banner Toast */}
      {stageToast && (
        <div
          id="toast-stage-banner"
          className="absolute top-28 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-300 animate-in fade-in zoom-in"
        >
          <div className="bg-slate-900/95 border-2 border-[#ffd32a] text-center px-6 py-3 rounded-2xl shadow-[0_8px_30px_rgba(212,175,55,0.4)] backdrop-blur-md max-w-[90vw]">
            <div className="text-[10px] md:text-xs uppercase tracking-widest text-[#ffd32a] font-extrabold mb-0.5">
              ⭐ Objektif Bab Baharu Dimulakan ⭐
            </div>
            <div className="text-sm md:text-base font-black text-amber-200">
              {stageToast.title}
            </div>
            <div className="text-xs text-slate-300 mt-1 max-w-md mx-auto line-clamp-2">
              {stageToast.subtitle}
            </div>
          </div>
        </div>
      )}

      {/* Background Customization Settings Modal */}
      <BackgroundSettingsModal
        isOpen={isBgModalOpen}
        onClose={() => setIsBgModalOpen(false)}
        settings={bgSettings}
        onUpdateSettings={handleUpdateBgSettings}
        onSelectTimeOfDay={handleSelectTimeOfDay}
      />

      {/* Main Menu Modal */}
      <MenuModal
        isOpen={isMenuOpen}
        onStartGame={handleStartGame}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenBgSettings={() => setIsBgModalOpen(true)}
      />

      {/* Pause Modal */}
      <PauseModal
        isOpen={isPauseOpen}
        onResume={() => {
          setIsPauseOpen(false);
          if (engineRef.current) engineRef.current.isPaused = false;
        }}
        onRestartStage={() => {
          setIsPauseOpen(false);
          if (engineRef.current) {
            engineRef.current.isPaused = false;
            engineRef.current.loadStage(engineRef.current.currentStageIdx);
          }
        }}
        onSelectStage={(idx) => {
          setIsPauseOpen(false);
          if (engineRef.current) {
            engineRef.current.isPaused = false;
            engineRef.current.loadStage(idx);
          }
        }}
        onOpenBgSettings={() => setIsBgModalOpen(true)}
        onMainMenu={() => {
          setIsPauseOpen(false);
          setIsMenuOpen(true);
        }}
      />

      {/* Guide / Curriculum Notes Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Victory Modal */}
      <VictoryModal
        isOpen={isVictoryOpen}
        quizCorrect={quizCorrect}
        totalQuiz={totalQuiz}
        score={score}
        stars={stars}
        onPlayAgain={() => {
          setIsVictoryOpen(false);
          setQuizCorrect(0);
          quizAnsweredRef.current = false;
          setScore(0);
          setStars(0);
          if (engineRef.current) {
            engineRef.current.isPaused = false;
            engineRef.current.isVictory = false;
            engineRef.current.score = 0;
            engineRef.current.stars = 0;
            engineRef.current.loadStage(0);
          }
        }}
      />

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={isGameOverOpen}
        onRetry={() => {
          setIsGameOverOpen(false);
          if (engineRef.current) {
            engineRef.current.isGameOver = false;
            engineRef.current.loadStage(engineRef.current.currentStageIdx);
          }
        }}
      />
    </div>
  );
}
