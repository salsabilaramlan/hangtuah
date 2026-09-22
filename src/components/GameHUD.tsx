import React from 'react';
import type { QuizQuestion } from '../types.ts';
import { Volume2, VolumeX, BookOpen, Pause, Palette, Gamepad2 } from 'lucide-react';

interface GameHUDProps {
  hearts: number;
  score: number;
  stars: number;
  missionText: string;
  isAudioOn: boolean;
  onToggleAudio: () => void;
  onOpenGuide: () => void;
  onOpenBgSettings: () => void;
  onToggleTouch: () => void;
  onPause: () => void;
  nearInteract: boolean;
  // Dialogue
  dialog: {
    speaker: string;
    avatar: string;
    type: 'fact' | 'lore';
    text: string;
  } | null;
  onNextDialog: () => void;
  // Quiz
  quizQuestion: QuizQuestion | null;
  quizIndex: number;
  totalQuiz: number;
  onAnswerQuiz: (index: number) => void;
  quizFeedback: { correct: boolean; text: string } | null;
  onNextQuizQuestion: () => void;
  selectedOptionIndex: number | null;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  hearts,
  score,
  stars,
  missionText,
  isAudioOn,
  onToggleAudio,
  onOpenGuide,
  onOpenBgSettings,
  onToggleTouch,
  onPause,
  nearInteract,
  dialog,
  onNextDialog,
  quizQuestion,
  quizIndex,
  totalQuiz,
  onAnswerQuiz,
  quizFeedback,
  onNextQuizQuestion,
  selectedOptionIndex
}) => {
  const heartEmojis = Array.from({ length: Math.max(0, hearts) }, () => '❤️').join('') || '💔';

  return (
    <>
      {/* Top HUD Bar */}
      <div id="hud-top-bar" className="absolute top-3.5 left-3.5 right-3.5 flex justify-between items-start pointer-events-none z-20">
        <div className="flex items-center gap-4 bg-slate-900/90 border-2 border-[#d4af37] rounded-2xl px-4 py-2 shadow-2xl backdrop-blur-md pointer-events-auto">
          <div className="flex items-center gap-1.5 text-sm font-bold">
            <span className="text-base">❤️</span>
            <span id="hud-hearts" className="text-red-500 tracking-wider text-base">{heartEmojis}</span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-1.5 text-sm font-bold">
            <span className="text-base">🪙</span>
            <span id="hud-score" className="text-[#ffd32a] min-w-[45px] font-mono">{score}</span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-1.5 text-sm font-bold">
            <span className="text-base">⭐</span>
            <span id="hud-stars" className="text-amber-400">{stars}/3</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Beautify Background Button */}
          <button
            id="btn-hud-bg-settings"
            onClick={onOpenBgSettings}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-xs border border-[#ffd32a] shadow-lg shadow-amber-600/30 transition-all active:scale-95"
            title="Cantikkan Latar Belakang & Waktu"
          >
            <Palette size={16} className="text-slate-950" />
            <span className="hidden sm:inline">Latar Belakang</span>
          </button>

          <button
            id="btn-hud-audio"
            onClick={onToggleAudio}
            className="w-10 h-10 rounded-full border-2 border-[#d4af37] bg-slate-900/90 hover:bg-slate-800 text-[#ffd32a] flex items-center justify-center shadow-lg transition-transform active:scale-95"
            title="Muzik & Kesan Bunyi"
          >
            {isAudioOn ? <Volume2 size={18} /> : <VolumeX size={18} className="text-slate-500" />}
          </button>

          <button
            id="btn-hud-guide"
            onClick={onOpenGuide}
            className="w-10 h-10 rounded-full border-2 border-[#d4af37] bg-slate-900/90 hover:bg-slate-800 text-[#ffd32a] flex items-center justify-center shadow-lg transition-transform active:scale-95"
            title="Panduan & Fakta KSSR"
          >
            <BookOpen size={18} />
          </button>

          <button
            id="btn-hud-touch"
            onClick={onToggleTouch}
            className="w-10 h-10 rounded-full border-2 border-[#d4af37] bg-slate-900/90 hover:bg-slate-800 text-[#ffd32a] flex items-center justify-center shadow-lg transition-transform active:scale-95 sm:hidden"
            title="Kawalan Sentuh Skrin"
          >
            <Gamepad2 size={18} />
          </button>

          <button
            id="btn-hud-pause"
            onClick={onPause}
            className="w-10 h-10 rounded-full border-2 border-[#d4af37] bg-slate-900/90 hover:bg-slate-800 text-[#ffd32a] flex items-center justify-center shadow-lg transition-transform active:scale-95"
            title="Jeda Permainan"
          >
            <Pause size={18} />
          </button>
        </div>
      </div>

      {/* Mission Banner */}
      <div id="banner-mission" className="absolute top-[72px] left-1/2 -translate-x-1/2 bg-slate-900/95 border-2 border-[#d4af37] rounded-full px-5 py-2 text-slate-100 text-xs md:text-sm font-bold flex items-center gap-2.5 shadow-2xl pointer-events-none z-10 max-w-[92vw] text-center backdrop-blur-sm">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#2ed573] animate-pulse shrink-0" />
        <span className="truncate">{missionText}</span>
      </div>

      {/* Desktop Quick Action Controls Strip (Roblox Style) */}
      <div className="hidden lg:flex absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/85 backdrop-blur-md border border-amber-500/40 rounded-full px-5 py-2 items-center gap-3.5 text-[11px] text-slate-300 font-semibold z-10 pointer-events-none shadow-2xl">
        <span className="flex items-center gap-1.5"><kbd className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded border border-slate-600 font-mono text-[10px]">WASD</kbd> Gerak</span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1.5"><kbd className="bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded border border-slate-600 font-mono text-[10px]">SPACE</kbd> Lompat</span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1.5"><kbd className="bg-slate-800 text-red-300 px-1.5 py-0.5 rounded border border-slate-600 font-mono text-[10px]">J / KLIK</kbd> Kombo Silat</span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1.5"><kbd className="bg-slate-800 text-purple-300 px-1.5 py-0.5 rounded border border-slate-600 font-mono text-[10px]">Q</kbd> Elak</span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1.5"><kbd className="bg-slate-800 text-orange-300 px-1.5 py-0.5 rounded border border-slate-600 font-mono text-[10px]">SHIFT</kbd> Pecut</span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1.5 text-slate-400">🖱️ Seret: Pusingan Kamera 360°</span>
      </div>

      {/* Interact Prompt */}
      {nearInteract && !dialog && !quizQuestion && (
        <div id="prompt-interact" className="absolute bottom-36 sm:bottom-28 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-5 py-2 rounded-full font-extrabold text-xs sm:text-sm shadow-[0_4px_20px_rgba(245,158,11,0.5)] z-20 pointer-events-none animate-bounce whitespace-nowrap border-2 border-white">
          Tekan [E] atau Butang [A] untuk Berinteraksi
        </div>
      )}

      {/* Dialogue Overlay */}
      {dialog && (
        <div
          id="overlay-dialog"
          onClick={onNextDialog}
          className="absolute bottom-36 sm:bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-3xl bg-gradient-to-b from-slate-900/98 to-slate-950/98 border-2 border-[#d4af37] rounded-2xl p-4 md:p-5 shadow-2xl z-30 backdrop-blur-md cursor-pointer select-none"
        >
          <div className="flex items-center justify-between mb-2.5 border-b border-[#d4af37]/35 pb-2">
            <div className="text-base font-extrabold text-[#ffd32a] flex items-center gap-2">
              <span>{dialog.speaker}</span>
            </div>
            {dialog.type === 'fact' ? (
              <span className="bg-emerald-600 text-white text-[11px] px-2.5 py-0.5 rounded-md font-extrabold tracking-wide shadow-sm">
                FAKTA SEJARAH KSSR
              </span>
            ) : (
              <span className="bg-sky-600 text-white text-[11px] px-2.5 py-0.5 rounded-md font-extrabold tracking-wide shadow-sm">
                DIALOG REKAAN
              </span>
            )}
          </div>

          <div className="flex gap-4 items-center">
            <div className="w-14 h-14 rounded-full border-2 border-[#d4af37] bg-slate-800 flex items-center justify-center text-3xl shrink-0 shadow-lg">
              {dialog.avatar}
            </div>
            <div className="flex-1 text-slate-100 text-sm md:text-base leading-relaxed">
              {dialog.text}
            </div>
          </div>

          <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800">
            <span className="text-xs text-slate-400 hidden sm:inline">
              Tekan [E] / [Enter] / [Space] untuk teruskan
            </span>
            <button
              id="btn-dialog-continue"
              onClick={onNextDialog}
              className="ml-auto px-5 py-1.5 rounded-full bg-gradient-to-r from-[#d4af37] to-amber-600 text-slate-950 font-extrabold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md"
            >
              Teruskan ▶
            </button>
          </div>
        </div>
      )}

      {/* History Quiz Modal in Chapter 3 */}
      {quizQuestion && (
        <div id="overlay-quiz" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-2xl bg-gradient-to-b from-slate-800 to-slate-950 border-3 border-[#ffd32a] rounded-3xl p-6 z-40 shadow-2xl">
          <div className="text-center pb-3 mb-4 border-b border-[#ffd32a]/30">
            <h3 className="text-lg font-extrabold text-[#ffd32a]">
              🏛️ Ujian Kebijaksanaan Sejarah KSSR (Soalan {quizIndex + 1}/{totalQuiz})
            </h3>
          </div>

          <p className="text-base md:text-lg font-bold text-white mb-4 leading-snug">
            {quizQuestion.q}
          </p>

          <div className="space-y-2.5 mb-4">
            {quizQuestion.options.map((opt, idx) => {
              const isSelected = selectedOptionIndex === idx;
              const isCorrect = idx === quizQuestion.correct;
              const answered = selectedOptionIndex !== null;

              let btnStyle = 'bg-slate-800/90 border-slate-700 text-slate-100 hover:border-amber-400';
              if (answered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-600/30 border-emerald-500 text-emerald-200';
                } else if (isSelected) {
                  btnStyle = 'bg-red-600/30 border-red-500 text-red-200';
                } else {
                  btnStyle = 'bg-slate-800/50 border-slate-800 text-slate-500';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={answered}
                  onClick={() => onAnswerQuiz(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border-2 text-sm font-semibold transition-all ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {quizFeedback && (
            <div
              className={`p-3.5 rounded-xl text-xs md:text-sm mb-4 border ${
                quizFeedback.correct
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                  : 'bg-red-950/70 border-red-500 text-red-200'
              }`}
            >
              <div className="font-extrabold mb-1">
                {quizFeedback.correct ? '✔️ Jawapan Tepat Sekali!' : '❌ Jawapan Kurang Tepat!'}
              </div>
              <div>{quizFeedback.text}</div>
            </div>
          )}

          {quizFeedback && (
            <div className="text-right">
              <button
                id="btn-quiz-next"
                onClick={onNextQuizQuestion}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-600 text-slate-950 font-extrabold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg"
              >
                Seterusnya ▶
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
