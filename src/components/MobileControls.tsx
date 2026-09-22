import React, { useRef, useEffect, useState } from 'react';
import type { GameEngine } from '../game/GameEngine.ts';
import { Swords, MessageCircle, ChevronsUp, Wind, Zap } from 'lucide-react';

interface MobileControlsProps {
  engine: GameEngine | null;
  isVisible: boolean;
  onAttack: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ engine, isVisible, onAttack }) => {
  const zoneRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [isSprinting, setIsSprinting] = useState(false);

  useEffect(() => {
    if (!isVisible || !engine || !zoneRef.current || !knobRef.current) return;

    const zone = zoneRef.current;
    const knob = knobRef.current;
    let touchId: number | null = null;

    const handleJoystickMove = (clientX: number, clientY: number) => {
      const rect = zone.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);
      const maxR = 38;
      if (dist > maxR) {
        dx = (dx / dist) * maxR;
        dy = (dy / dist) * maxR;
      }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      // Normalize values between -1 and 1
      engine.joystick.x = dx / maxR;
      engine.joystick.y = dy / maxR;
      engine.joystick.active = true;
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      touchId = touch.identifier;
      handleJoystickMove(touch.clientX, touch.clientY);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(10); } catch {}
      }
    };

    const onTouchMoveWindow = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === touchId) {
          handleJoystickMove(t.clientX, t.clientY);
        }
      }
    };

    const resetJoystick = () => {
      touchId = null;
      knob.style.transform = 'translate(0px, 0px)';
      engine.joystick.x = 0;
      engine.joystick.y = 0;
      engine.joystick.active = false;
    };

    const onTouchEndWindow = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          resetJoystick();
        }
      }
    };

    zone.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMoveWindow, { passive: true });
    window.addEventListener('touchend', onTouchEndWindow);
    window.addEventListener('touchcancel', resetJoystick);
    resetJoystick();

    return () => {
      zone.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMoveWindow);
      window.removeEventListener('touchend', onTouchEndWindow);
      window.removeEventListener('touchcancel', resetJoystick);
      resetJoystick();
    };
  }, [isVisible, engine]);

  if (!isVisible) return null;

  const toggleSprint = () => {
    const next = !isSprinting;
    setIsSprinting(next);
    if (engine) {
      engine.setSprinting(next);
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(15); } catch {}
    }
  };

  return (
    <div
      id="mobile-controls-container"
      className="absolute bottom-3 left-0 right-0 pointer-events-none z-30 flex justify-between px-3 md:px-8 items-end pb-[env(safe-area-inset-bottom,8px)]"
    >
      {/* Virtual Joystick Zone */}
      <div className="flex flex-col items-center gap-1 pointer-events-auto">
        <div
          id="joystick-zone"
          ref={zoneRef}
          className="w-28 h-28 md:w-32 md:h-32 rounded-full border-2 border-[#ffd32a]/40 bg-slate-900/70 backdrop-blur-md relative touch-none shadow-2xl flex items-center justify-center"
        >
          {/* Subtle directional indicators */}
          <div className="absolute top-1.5 text-[9px] text-[#ffd32a]/60 font-bold tracking-widest">W</div>
          <div className="absolute bottom-1.5 text-[9px] text-[#ffd32a]/60 font-bold tracking-widest">S</div>
          <div className="absolute left-2 text-[9px] text-[#ffd32a]/60 font-bold tracking-widest">A</div>
          <div className="absolute right-2 text-[9px] text-[#ffd32a]/60 font-bold tracking-widest">D</div>

          {/* Inner ring */}
          <div className="w-14 h-14 rounded-full border border-[#d4af37]/20 pointer-events-none" />

          {/* Draggable Knob */}
          <div
            id="joystick-knob"
            ref={knobRef}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 shadow-xl pointer-events-none border-2 border-white/80 absolute flex items-center justify-center transition-transform duration-75"
          >
            <div className="w-3 h-3 rounded-full bg-amber-700/60" />
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-300/90 tracking-wide bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-700">
          Gerak Tuah
        </span>
      </div>

      {/* Action Pad: Jump, Dash, Sprint, Interact, Silat Attack */}
      <div className="flex flex-col items-end gap-2 pointer-events-auto select-none">
        {/* Secondary Action Row: Sprint, Dash, Jump */}
        <div className="flex items-center gap-2">
          {/* Sprint Toggle */}
          <button
            id="btn-touch-sprint"
            type="button"
            onClick={toggleSprint}
            className={`w-11 h-11 rounded-full border-2 text-white flex flex-col items-center justify-center shadow-lg active:scale-90 transition-all ${
              isSprinting
                ? 'bg-gradient-to-b from-amber-500 to-orange-600 border-amber-300 shadow-orange-500/40 ring-2 ring-amber-400'
                : 'bg-slate-800/80 border-slate-600 hover:bg-slate-700'
            }`}
            title="Pecut / Sprint"
          >
            <Zap size={16} className={isSprinting ? "text-white" : "text-amber-400"} />
            <span className="text-[8px] font-bold leading-none mt-0.5">Pecut</span>
          </button>

          {/* Dash / Elak */}
          <button
            id="btn-touch-dash"
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                try { navigator.vibrate(15); } catch {}
              }
              engine?.handleDash();
            }}
            className="w-11 h-11 rounded-full border-2 border-purple-400/80 bg-gradient-to-b from-purple-600 to-indigo-800 text-white flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform"
            title="Elak / Dash"
          >
            <Wind size={16} className="text-purple-200" />
            <span className="text-[8px] font-bold leading-none mt-0.5">Elak</span>
          </button>

          {/* Jump / Lompat */}
          <button
            id="btn-touch-jump"
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                try { navigator.vibrate(20); } catch {}
              }
              engine?.handleJump();
            }}
            className="w-12 h-12 rounded-full border-2 border-cyan-300 bg-gradient-to-b from-cyan-500 to-blue-700 text-white flex flex-col items-center justify-center shadow-xl active:scale-90 transition-transform"
            title="Lompat"
          >
            <ChevronsUp size={18} className="text-cyan-100" />
            <span className="text-[8px] font-bold leading-none mt-0.5">Lompat</span>
          </button>
        </div>

        {/* Primary Action Row: Interact (A) & Silat Attack (B) */}
        <div className="flex items-center gap-3">
          {/* Button A: Interaksi / Ambil / Bicara */}
          <button
            id="btn-touch-action"
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                try { navigator.vibrate(15); } catch {}
              }
              engine?.handleInteract();
            }}
            className="w-14 h-14 rounded-full border-2 border-emerald-300 bg-gradient-to-b from-emerald-500 to-emerald-800 text-white font-black flex flex-col items-center justify-center shadow-xl active:scale-90 transition-transform"
            title="Bicara / Ambil"
          >
            <span className="text-base leading-none font-black flex items-center gap-0.5">
              A
            </span>
            <MessageCircle size={13} className="text-emerald-200 mt-0.5" />
          </button>

          {/* Button B: Silat Combo Attack */}
          <button
            id="btn-touch-attack"
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                try { navigator.vibrate(25); } catch {}
              }
              onAttack();
              engine?.handleAttack();
            }}
            className="w-18 h-18 rounded-full border-3 border-amber-400 bg-gradient-to-b from-red-500 via-red-600 to-red-900 text-white font-black flex flex-col items-center justify-center shadow-2xl active:scale-90 transition-transform relative overflow-hidden group"
            title="Pukulan Silat Combo"
          >
            <div className="absolute inset-0 bg-radial from-amber-400/20 to-transparent pointer-events-none" />
            <span className="text-xl leading-none font-black flex items-center gap-0.5 drop-shadow">
              B
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <Swords size={16} className="text-amber-300 animate-pulse" />
              <span className="text-[9px] font-extrabold text-amber-200">KOMBO</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
