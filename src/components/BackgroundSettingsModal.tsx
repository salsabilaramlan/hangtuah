import React from 'react';
import type { BackgroundSettings, TimeOfDay } from '../types.ts';
import { Sun, Sunset, Moon, Wind, Waves, Sparkles, Sliders, X } from 'lucide-react';

interface BackgroundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BackgroundSettings;
  onUpdateSettings: (newSettings: Partial<BackgroundSettings>) => void;
  onSelectTimeOfDay: (tod: TimeOfDay) => void;
}

export const BackgroundSettingsModal: React.FC<BackgroundSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onSelectTimeOfDay
}) => {
  if (!isOpen) return null;

  return (
    <div id="modal-bg-settings" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg rounded-2xl border-2 border-[#d4af37] bg-gradient-to-b from-[#1e293b] to-[#0f172a] p-6 text-white shadow-2xl">
        <button
          id="btn-close-bg-modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-slate-700/50 transition-colors"
          title="Tutup"
        >
          <X size={22} />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-amber-500/20 text-[#ffd32a] border border-[#d4af37]/40">
            <Sliders size={24} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#ffd32a] tracking-wide">
              Tetapan & Kecantikan Latar Belakang
            </h2>
            <p className="text-xs text-slate-300">
              Sesuaikan suasana panorama, cahaya alam, awan, dan ombak 3D
            </p>
          </div>
        </div>

        <div className="my-4 h-px bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />

        {/* 1. Suasana Waktu & Langit */}
        <div className="mb-5">
          <label className="block text-sm font-bold text-slate-200 mb-2">
            Pilihan Suasana Waktu (Langit & Cahaya):
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              id="btn-tod-pagi"
              onClick={() => onSelectTimeOfDay('pagi')}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                settings.timeOfDay === 'pagi'
                  ? 'bg-amber-500/25 border-[#ffd32a] text-[#ffd32a] shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              <Sun size={20} className={settings.timeOfDay === 'pagi' ? 'text-amber-400 animate-spin-slow' : 'text-slate-400'} />
              <span>Pagi Cerah</span>
              <small className="text-[10px] opacity-75">Cahaya Tropika</small>
            </button>

            <button
              id="btn-tod-senja"
              onClick={() => onSelectTimeOfDay('senja')}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                settings.timeOfDay === 'senja'
                  ? 'bg-orange-600/25 border-orange-400 text-orange-300 shadow-lg shadow-orange-500/20'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              <Sunset size={20} className={settings.timeOfDay === 'senja' ? 'text-orange-400' : 'text-slate-400'} />
              <span>Senja Emas</span>
              <small className="text-[10px] opacity-75">Selat Melaka</small>
            </button>

            <button
              id="btn-tod-malam"
              onClick={() => onSelectTimeOfDay('malam')}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                settings.timeOfDay === 'malam'
                  ? 'bg-indigo-600/25 border-indigo-400 text-indigo-300 shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              <Moon size={20} className={settings.timeOfDay === 'malam' ? 'text-indigo-300' : 'text-slate-400'} />
              <span>Malam Purnama</span>
              <small className="text-[10px] opacity-75">Bintang & Pelita</small>
            </button>
          </div>
        </div>

        {/* 2. Toggles Kesan Visual Latar */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/80">
            <div className="flex items-center gap-2.5">
              <Wind size={18} className="text-sky-400" />
              <div>
                <div className="text-sm font-semibold">Awan 3D Beredar</div>
                <div className="text-[11px] text-slate-400">Kelompok awan berarak lembut di ufuk langit</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="toggle-clouds"
                type="checkbox"
                checked={settings.cloudsEnabled}
                onChange={(e) => onUpdateSettings({ cloudsEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/80">
            <div className="flex items-center gap-2.5">
              <Sparkles size={18} className="text-amber-400" />
              <div>
                <div className="text-sm font-semibold">Zarah Alam Dinamik</div>
                <div className="text-[11px] text-slate-400">Kilauan habuk emas, bunga api & bayu tropika</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="toggle-particles"
                type="checkbox"
                checked={settings.particlesEnabled}
                onChange={(e) => onUpdateSettings({ particlesEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/80">
            <div className="flex items-center gap-2.5">
              <Waves size={18} className="text-cyan-400" />
              <div>
                <div className="text-sm font-semibold">Ombak Laut Selat Melaka</div>
                <div className="text-[11px] text-slate-400">Alunan permukaan air laut pelabuhan berkilau</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="toggle-waves"
                type="checkbox"
                checked={settings.waterWavesEnabled}
                onChange={(e) => onUpdateSettings({ waterWavesEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>

        {/* 3. Kabus Panorama Slider */}
        <div className="mb-5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/80">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-bold text-slate-300">Jarak Pandang & Kepekatan Kabus Banjaran:</span>
            <span className="text-xs font-extrabold text-[#ffd32a]">
              {Math.round(settings.fogDensity * 100)}%
            </span>
          </div>
          <input
            id="slider-fog-density"
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={settings.fogDensity}
            onChange={(e) => onUpdateSettings({ fogDensity: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Ufuk Sangat Jauh</span>
            <span>Sederhana Nyata</span>
            <span>Kabus Tebal Pagi</span>
          </div>
        </div>

        {/* Footer info & Done button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
          <span className="text-[11px] text-slate-400 italic">
            *Latar belakang disesuaikan serta-merta
          </span>
          <button
            id="btn-apply-bg-settings"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-amber-500/20"
          >
            Selesai & Nikmati Pemandangan ✔️
          </button>
        </div>
      </div>
    </div>
  );
};
