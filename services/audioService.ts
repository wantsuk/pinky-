
class AudioService {
  private ctx: AudioContext | null = null;
  private tickInterval: number | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Sharp, mechanical gear-like click
  playTick() {
    this.init();
    if (!this.ctx) return;
    
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    // Noise-like component for mechanical grit
    osc.type = 'square';
    osc.frequency.setValueAtTime(1500, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.03);
    
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, t);
    
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.03);
  }

  startMechanicalSpin() {
    this.init();
    if (this.tickInterval) return;
    this.tickInterval = window.setInterval(() => {
      this.playTick();
    }, 90); // Rhythmic clicking
  }

  stopMechanicalSpin() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  playWinFanfare() {
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Bouncy, cheerful electronic sequence
    const melody = [
      { freq: 523.25, start: 0, dur: 0.08 }, // C5
      { freq: 523.25, start: 0.1, dur: 0.08 },
      { freq: 659.25, start: 0.2, dur: 0.08 }, // E5
      { freq: 783.99, start: 0.3, dur: 0.08 }, // G5
      { freq: 1046.50, start: 0.45, dur: 0.5 } // C6
    ];

    melody.forEach((note) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'sawtooth'; // Electronic feel
      osc.frequency.setValueAtTime(note.freq, t + note.start);
      
      gain.gain.setValueAtTime(0, t + note.start);
      gain.gain.linearRampToValueAtTime(0.1, t + note.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.start + note.dur);
      
      // Low pass filter to make the sawtooth less harsh
      const lp = this.ctx!.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 2000;

      osc.connect(lp);
      lp.connect(gain);
      gain.connect(this.ctx!.destination);
      
      osc.start(t + note.start);
      osc.stop(t + note.start + note.dur);
    });
  }
}

export const audioService = new AudioService();
