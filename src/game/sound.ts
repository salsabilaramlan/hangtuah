// Audio synthesizer using Web Audio API for zero external dependencies
class SoundFXController {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private bgmTimer: number | null = null;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playTone(freq: number, type: OscillatorType, duration: number, gainStart = 0.2, gainEnd = 0.001) {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainStart, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(gainEnd, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Ignore audio context errors
    }
  }

  public playSilatSlash() {
    this.playTone(320, 'sawtooth', 0.18, 0.35, 0.01);
  }

  public playJump() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(360, this.ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch {}
  }

  public playDash() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch {}
  }

  public playFinisher() {
    if (!this.enabled || !this.ctx) return;
    this.playTone(160, 'sawtooth', 0.35, 0.45, 0.01);
    setTimeout(() => {
      this.playTone(90, 'triangle', 0.5, 0.5, 0.01);
    }, 60);
  }

  public playHit() {
    this.playTone(110, 'triangle', 0.25, 0.4, 0.01);
  }

  public playPickup() {
    if (!this.enabled || !this.ctx) return;
    [523.25, 659.25, 783.99, 1046.50].forEach((f, idx) => {
      setTimeout(() => {
        this.playTone(f, 'sine', 0.25, 0.2, 0.01);
      }, idx * 60);
    });
  }

  public playHeal() {
    if (!this.enabled || !this.ctx) return;
    [440, 554.37, 659.25, 880].forEach((f, idx) => {
      setTimeout(() => {
        this.playTone(f, 'triangle', 0.3, 0.2, 0.01);
      }, idx * 60);
    });
  }

  public playCorrect() {
    if (!this.enabled || !this.ctx) return;
    [587.33, 739.99, 880.00].forEach((f, idx) => {
      setTimeout(() => {
        this.playTone(f, 'triangle', 0.35, 0.25, 0.01);
      }, idx * 90);
    });
  }

  public playWrong() {
    this.playTone(180, 'sawtooth', 0.35, 0.3, 0.01);
  }

  public playVictory() {
    if (!this.enabled || !this.ctx) return;
    const notes = [392, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((f, idx) => {
      setTimeout(() => {
        this.playTone(f, 'sine', 0.5, 0.3, 0.01);
      }, idx * 130);
    });
  }

  public startBGM() {
    if (this.bgmTimer) return;
    // Gamelan slendro pentatonic scale (C, D, E, G, A, C)
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
    let step = 0;
    this.bgmTimer = window.setInterval(() => {
      if (!this.enabled || !this.ctx) return;
      const note = scale[Math.floor(Math.random() * scale.length)];
      if (step % 2 === 0) {
        this.playTone(note, 'sine', 0.6, 0.05, 0.001);
      }
      if (step % 4 === 0) {
        // Deep gong undertone
        this.playTone(130.81, 'triangle', 0.9, 0.07, 0.001);
      }
      step++;
    }, 450);
  }

  public stopBGM() {
    if (this.bgmTimer !== null) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const SoundFX = new SoundFXController();
