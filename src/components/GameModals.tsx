import React from 'react';

interface MenuModalProps {
  isOpen: boolean;
  onStartGame: (stageIdx?: number) => void;
  onOpenGuide: () => void;
  onOpenBgSettings: () => void;
}

export const MenuModal: React.FC<MenuModalProps> = ({
  isOpen,
  onStartGame,
  onOpenGuide,
  onOpenBgSettings
}) => {
  if (!isOpen) return null;

  return (
    <div id="modal-menu" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 text-center">
      <div className="w-full max-w-xl rounded-3xl border-3 border-[#d4af37] bg-gradient-to-b from-[#1e293b] to-[#0f172a] p-6 md:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="text-4xl md:text-5xl mb-2">🗡️ ⛵ 🏛️</div>
        <h1 className="text-2xl md:text-3xl font-black text-[#ffd32a] tracking-wide mb-1">
          PENGEMBARAAN HANG TUAH 3D
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mb-4">
          Wira Kesultanan Melayu Melaka (Sejarah KSSR Tahun 4)
        </p>

        <div className="text-left bg-slate-900 border border-slate-700/80 rounded-2xl p-4 mb-4 text-xs md:text-sm leading-relaxed text-slate-300 max-h-52 overflow-y-auto space-y-3">
          <div>
            <h4 className="font-extrabold text-[#ffd32a] mb-1">📜 Sinopsis Pengembaraan:</h4>
            <p>
              Ikuti riwayat kepahlawanan <strong>Hang Tuah</strong> bersama empat sahabatnya (Hang Jebat, Hang Kasturi, Hang Lekir, Hang Lekiu) dalam mengharungi cabaran dari pekan Melaka, menghapuskan lanun di Selat Melaka di atas dermaga kayu, hingga ke Balairung Seri!
            </p>
          </div>

          <div>
            <h4 className="font-extrabold text-[#ffd32a] mb-1">🌄 Pemandangan & Latar Belakang Baharu:</h4>
            <p>
              Dilengkapi pemandangan 3D berlatarkan <strong>Gunung Ledang</strong>, perarakan awan lembut, sinaran suria keemasan, alunan ombak Selat Melaka, dan kemegahan ukiran kayu istana Melayu tradisi.
            </p>
          </div>

          <div>
            <h4 className="font-extrabold text-[#ffd32a] mb-1">🎮 Kawalan Permainan:</h4>
            <p>
              • <strong>Papan Kekunci:</strong> [W][A][S][D] / [Anak Panah] bergerak, [Space] / [J] pukulan Silat, [E] / [Enter] bercakap & kutip barang, [P] jeda.<br/>
              • <strong>Skrin Sentuh:</strong> Virtual Joystick di sebelah kiri, Butang [A] (Interaksi) dan [B] (Silat) di kanan.
            </p>
          </div>
        </div>

        {/* Quick Chapter Selector */}
        <div className="mb-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pilih Bab Permainan:</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              id="btn-select-bab1"
              onClick={() => onStartGame(0)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-200 font-bold transition-all active:scale-95"
            >
              <div className="text-base mb-0.5">🏘️</div>
              Bab 1: Pekan
            </button>
            <button
              id="btn-select-bab2"
              onClick={() => onStartGame(1)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-200 font-bold transition-all active:scale-95"
            >
              <div className="text-base mb-0.5">⛵</div>
              Bab 2: Laut
            </button>
            <button
              id="btn-select-bab3"
              onClick={() => onStartGame(2)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-200 font-bold transition-all active:scale-95"
            >
              <div className="text-base mb-0.5">👑</div>
              Bab 3: Istana
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            id="btn-start-game"
            onClick={() => onStartGame(0)}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/25 active:scale-98 transition-all"
          >
            Mula Dari Awal ⚔️
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              id="btn-menu-bg"
              onClick={onOpenBgSettings}
              className="py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold text-xs md:text-sm active:scale-98 transition-all"
            >
              🎨 Cantikkan Latar
            </button>
            <button
              id="btn-open-guide"
              onClick={onOpenGuide}
              className="py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-xs md:text-sm active:scale-98 transition-all"
            >
              📖 Panduan KSSR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestartStage: () => void;
  onSelectStage: (stageIdx: number) => void;
  onOpenBgSettings: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestartStage,
  onSelectStage,
  onOpenBgSettings,
  onMainMenu
}) => {
  if (!isOpen) return null;

  return (
    <div id="modal-pause" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 text-center">
      <div className="w-full max-w-md rounded-3xl border-3 border-[#d4af37] bg-gradient-to-b from-[#1e293b] to-[#0f172a] p-6 shadow-2xl">
        <h2 className="text-2xl font-black text-[#ffd32a] mb-1">
          PERMAINAN DIJEDA ⏸️
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          Rehat sebentar wahai pahlawan perkasa!
        </p>

        {/* Quick Chapter Switcher in Pause */}
        <div className="mb-4 text-left bg-slate-900/80 p-3 rounded-2xl border border-slate-700">
          <div className="text-[11px] font-bold text-slate-400 uppercase mb-2">Tukar Bab Terus:</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => onSelectStage(0)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-amber-600 hover:text-slate-950 text-amber-200 font-bold text-center transition-colors"
            >
              Bab 1: Pekan
            </button>
            <button
              onClick={() => onSelectStage(1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-amber-600 hover:text-slate-950 text-amber-200 font-bold text-center transition-colors"
            >
              Bab 2: Laut
            </button>
            <button
              onClick={() => onSelectStage(2)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-amber-600 hover:text-slate-950 text-amber-200 font-bold text-center transition-colors"
            >
              Bab 3: Istana
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            id="btn-resume-game"
            onClick={onResume}
            className="py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-sm active:scale-98 transition-all shadow-md"
          >
            Sambung Bermain ▶
          </button>
          <button
            id="btn-pause-bg"
            onClick={onOpenBgSettings}
            className="py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold text-xs active:scale-98 transition-all"
          >
            🎨 Ubah Suasana & Latar Belakang
          </button>
          <button
            id="btn-restart-stage"
            onClick={onRestartStage}
            className="py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-xs active:scale-98 transition-all"
          >
            Main Semula Bab Ini 🔄
          </button>
          <button
            id="btn-menu-exit"
            onClick={onMainMenu}
            className="py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 font-bold text-xs active:scale-98 transition-all"
          >
            Kembali ke Menu Utama 🏠
          </button>
        </div>
      </div>
    </div>
  );
};

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div id="modal-guide" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 text-center">
      <div className="w-full max-w-xl rounded-3xl border-3 border-[#d4af37] bg-gradient-to-b from-[#1e293b] to-[#0f172a] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl md:text-2xl font-black text-[#ffd32a] mb-1">
          PANDUAN & NOTA SEJARAH TAHUN 4
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Rujukan Kurikulum Standard Sekolah Rendah (KSSR)
        </p>

        <div className="text-left bg-slate-900 border border-slate-700 rounded-2xl p-4 mb-5 text-xs md:text-sm leading-relaxed text-slate-300 max-h-72 overflow-y-auto space-y-3">
          <div>
            <h4 className="font-extrabold text-[#ffd32a] mb-1">1. Riwayat Hidup Hang Tuah:</h4>
            <ul className="list-disc ml-5 space-y-0.5">
              <li>Berasal dari <strong>Kampung Sungai Duyong, Melaka</strong>.</li>
              <li>Bapa bernama <strong>Hang Mahmud</strong>, ibu bernama <strong>Dang Merdu Wati</strong>.</li>
              <li>Empat sahabat karib: <em>Hang Jebat, Hang Kasturi, Hang Lekir, Hang Lekiu</em>.</li>
              <li>Berguru ilmu persilatan di Gunung Ledang dengan <strong>Aria Putera</strong>.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-[#ffd32a] mb-1">2. Peristiwa & Peranan Laksamana:</h4>
            <ul className="list-disc ml-5 space-y-0.5">
              <li>Menyelamatkan <strong>Bendahara Tun Perak</strong> daripada orang mengamuk.</li>
              <li>Dilantik sebagai <strong>Laksamana Melaka</strong> (Ketua Angkatan Laut & Pengawal Sultan).</li>
              <li>Menewaskan <strong>Taming Sari</strong> di Majapahit & dianugerahkan <strong>Keris Taming Sari</strong>.</li>
              <li>Menguasai <strong>12 bahasa asing</strong> untuk menjalankan tugas duta/diplomat Melaka.</li>
              <li>Sifat terpuji: Taat setia, berani, amanah, dan berpengetahuan luas.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-[#ffd32a] mb-1">3. Label Fakta vs Dialog Rekaan:</h4>
            <p>
              Label hijau <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[11px] font-bold">FAKTA SEJARAH</span> berpandukan silibus KSSR rasmi, manakala label biru <span className="bg-sky-600 text-white px-2 py-0.5 rounded text-[11px] font-bold">DIALOG REKAAN</span> adalah lakonan watak untuk menghidupkan suasana.
            </p>
          </div>

          <div>
            <h4 className="font-extrabold text-[#ffd32a] mb-1">4. Kawalan Aksi & Pergerakan (Gaya Roblox):</h4>
            <ul className="list-disc ml-5 space-y-1">
              <li><strong>Gerak Lancar (WASD / Joystick):</strong> Karakter berayun tangan dan kaki secara artikulasi 3D.</li>
              <li><strong>Pusingan Kamera 360° (Seret Skrin / Tetikus):</strong> Kawalan bebas sudut pandangan sekeliling.</li>
              <li><strong>Lompat (Space / Butang Lompat):</strong> Melompat ke udara dengan fizik graviti dan bayang dinamik.</li>
              <li><strong>3-Hit Kombo Silat (J, F, Klik / Butang B):</strong> Tebasan kilat, tikaman menyilang, dan pukulan pemusnah dengan impak gegaran skrin.</li>
              <li><strong>Elak / Dash (Q, K / Butang Elak):</strong> Gerakan tangkas mengelak serangan musuh.</li>
              <li><strong>Lari Pecut (Shift / Butang Pecut):</strong> Kelajuan berganda dengan ayunan langkah laju.</li>
            </ul>
          </div>
        </div>

        <button
          id="btn-close-guide"
          onClick={onClose}
          className="w-full py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-sm active:scale-98 transition-all"
        >
          Faham & Tutup Panduan ✔️
        </button>
      </div>
    </div>
  );
};

interface VictoryModalProps {
  isOpen: boolean;
  score: number;
  stars: number;
  quizCorrect?: number;
  totalQuiz?: number;
  onPlayAgain: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen, score, stars, quizCorrect = 0, totalQuiz = 0, onPlayAgain
}) => {
  const [name, setName] = React.useState('');
  const [badge, setBadge] = React.useState('');
  const [badgeName, setBadgeName] = React.useState('');
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    setName(''); setBadge(''); setBadgeName(''); setError('');
  }, [isOpen]);
  if (!isOpen) return null;

  const createBadge = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanName = name.trim().replace(/\s+/g, ' ');
    if (!cleanName) { setError('Sila masukkan nama anda dahulu.'); return; }
    const canvas = document.createElement('canvas');
    canvas.width = 1200; canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) { setError('Badge tidak dapat dijana. Sila cuba semula.'); return; }
    const bg = ctx.createLinearGradient(0, 0, 1200, 1200);
    bg.addColorStop(0, '#102f38'); bg.addColorStop(1, '#0f172a');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 1200, 1200);
    ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 5; ctx.strokeRect(38, 38, 1124, 1124);
    ctx.lineWidth = 1; ctx.strokeRect(54, 54, 1092, 1092);
    ctx.textAlign = 'center';
    const text = (value: string, y: number, size: number, color = '#f8fafc', weight = 'bold') => {
      ctx.fillStyle = color; ctx.font = weight + ' ' + size + 'px sans-serif';
      while (ctx.measureText(value).width > 1000 && size > 16) {
        size -= 1; ctx.font = weight + ' ' + size + 'px sans-serif';
      }
      ctx.fillText(value, 600, y);
    };
    text('PENGEMBARAAN HANG TUAH', 132, 34, '#e9cb74');
    text('SEJARAH TAHUN 4', 182, 23, '#a7c8c9');
    // Gold shield and star drawn locally, so the PNG needs no external images.
    ctx.beginPath(); ctx.moveTo(600, 238); ctx.lineTo(760, 298);
    ctx.lineTo(742, 440); ctx.quadraticCurveTo(720, 522, 600, 568);
    ctx.quadraticCurveTo(480, 522, 458, 440); ctx.lineTo(440, 298); ctx.closePath();
    const gold = ctx.createLinearGradient(440, 240, 760, 568);
    gold.addColorStop(0, '#ffedb0'); gold.addColorStop(1, '#b98524');
    ctx.fillStyle = gold; ctx.fill();
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = -Math.PI / 2 + i * Math.PI / 5;
      const radius = i % 2 === 0 ? 88 : 39;
      const x = 600 + Math.cos(angle) * radius, y = 389 + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fillStyle = '#173a40'; ctx.fill();
    text('BADGE WIRA ILMU', 646, 48, '#ffe49c');
    text('Dianugerahkan kepada', 710, 25, '#a7c8c9', 'normal');
    text(cleanName, 782, 48);
    text('Telah menyelesaikan kuiz Hang Tuah', 842, 26, '#cbd5e1', 'normal');
    text('Jawapan betul: ' + quizCorrect + ' / ' + totalQuiz, 913, 34, '#ffe49c');
    text('Markah permainan: ' + score + '  |  Bintang: ' + stars + ' / 3', 966, 27, '#cbd5e1');
    text('Berani belajar. Bijak berusaha.', 1060, 25, '#a7c8c9', 'normal');
    setBadge(canvas.toDataURL('image/png')); setBadgeName(cleanName); setError('');
  };

  const buttonClass = 'w-full block py-3 px-4 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300';
  return (
    <div id="modal-victory" role="dialog" aria-modal="true" aria-labelledby="victory-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 text-center">
      <div className="w-full max-w-lg rounded-3xl border-2 border-amber-400 bg-slate-900 p-5 md:p-7 shadow-2xl max-h-[92dvh] overflow-y-auto">
        <h2 id="victory-title" className="text-2xl font-black text-amber-300 mb-2">{badge ? 'BADGE ANDA SUDAH SIAP!' : 'SYABAS, KUIZ SELESAI!'}</h2>
        {!badge ? (
          <form onSubmit={createBadge} className="space-y-4 text-left">
            <p className="text-slate-300 text-sm text-center">Jawapan betul: <strong>{quizCorrect} / {totalQuiz}</strong> · Markah permainan: <strong>{score}</strong></p>
            <p className="text-slate-300 text-sm text-center">Masukkan nama untuk menerima badge Wira Ilmu anda.</p>
            <div>
              <label htmlFor="student-badge-name" className="block text-amber-100 font-bold text-sm mb-2">Nama murid</label>
              <input id="student-badge-name" value={name} onChange={e => { setName(e.target.value); setError(''); }} maxLength={60} autoFocus autoComplete="off" placeholder="Nama anda" aria-describedby="badge-name-help" aria-invalid={!!error} className="w-full rounded-xl bg-slate-950 border border-slate-500 text-white px-4 py-3 text-base select-text focus:outline-2 focus:outline-amber-300" />
              <p id="badge-name-help" className="text-xs text-slate-400 mt-2">Nama ini hanya digunakan pada badge di peranti anda.</p>
            </div>
            {error && <p role="alert" className="text-red-300 text-sm">{error}</p>}
            <button type="submit" className={buttonClass}>Paparkan Badge Saya</button>
          </form>
        ) : (
          <div className="space-y-3">
            <img src={badge} alt={'Badge Wira Ilmu untuk ' + badgeName + '. Jawapan betul: ' + quizCorrect + ' daripada ' + totalQuiz + '. Markah permainan: ' + score} className="w-full rounded-xl" />
            <a href={badge} download="badge-hang-tuah.png" className={buttonClass}>Muat Turun Badge (PNG)</a>
            <button onClick={() => setBadge('')} className="text-amber-200 underline text-sm py-2">Betulkan Nama</button>
          </div>
        )}
        <button id="btn-play-again" onClick={onPlayAgain} className="mt-4 w-full py-3 rounded-full border border-slate-600 text-slate-200 hover:bg-slate-800 font-bold text-sm">Main Semula Dari Mula</button>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  isOpen: boolean;
  onRetry: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ isOpen, onRetry }) => {
  if (!isOpen) return null;

  return (
    <div id="modal-gameover" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 text-center">
      <div className="w-full max-w-md rounded-3xl border-3 border-red-500 bg-gradient-to-b from-[#1e293b] to-[#0f172a] p-6 shadow-2xl">
        <div className="text-5xl mb-2">💔 🥀</div>
        <h2 className="text-2xl font-black text-red-500 mb-1">
          PENDEKAR TERKECUALI
        </h2>
        <p className="text-xs md:text-sm text-slate-300 mb-6">
          Hang Tuah telah kehabisan tenaga. Jangan berputus asa, pendekar sejati sentiasa bangkit berjuang!
        </p>

        <button
          id="btn-retry-stage"
          onClick={onRetry}
          className="w-full py-3.5 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white font-extrabold text-sm active:scale-98 transition-all shadow-xl shadow-red-600/30"
        >
          Cuba Semula Bab Ini 🔄
        </button>
      </div>
    </div>
  );
};
