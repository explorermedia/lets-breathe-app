// Procedural Audio Engine for Breathing App using Web Audio API
class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private currentAmbientType: 'none' | 'drone' | 'waves' | 'rain' = 'none';
  private ambientNodes: AudioNode[] = [];
  private noiseBuffer: AudioBuffer | null = null;
  private isMuted: boolean = false;

  constructor() {
    // AudioContext is initialized on first user interaction
  }

  private initContext() {
    if (this.ctx) return;
    
    // @ts-ignore - vendor prefix
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.8;
    this.masterGain.connect(this.ctx.destination);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = 0.5;
    this.ambientGain.connect(this.masterGain);

    this.createNoiseBuffer();
  }

  private createNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    
    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  public async resume() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public setMasterVolume(vol: number) {
    this.initContext();
    if (!this.masterGain) return;
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : vol, this.ctx!.currentTime);
  }

  public setAmbientVolume(vol: number) {
    this.initContext();
    if (!this.ambientGain) return;
    this.ambientGain.gain.setValueAtTime(vol, this.ctx!.currentTime);
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public playCue(type: 'bell' | 'chime' | 'bowl' | 'click' = 'bell') {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    
    if (type === 'bell' || type === 'bowl') {
      // Harmonic bell synthesis
      const fund = type === 'bell' ? 440 : 180; // Fundamental freq
      const ratios = [1, 2, 2.5, 3, 4.2, 5.4]; // Harmonic & inharmonic ratios for metallic sound
      const gains = [0.5, 0.2, 0.15, 0.1, 0.05, 0.02];
      const decay = type === 'bell' ? 1.5 : 3.0;

      const bellGain = this.ctx.createGain();
      bellGain.gain.setValueAtTime(0, now);
      bellGain.gain.linearRampToValueAtTime(0.3, now + 0.05);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);
      bellGain.connect(this.masterGain!);

      ratios.forEach((ratio, idx) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = fund * ratio;
        g.gain.value = gains[idx];
        
        osc.connect(g);
        g.connect(bellGain);
        
        osc.start(now);
        osc.stop(now + decay + 0.1);
      });
    } else if (type === 'chime') {
      // Sweet chime sound
      const freqs = [880, 1046.5, 1318.5]; // A5, C6, E6
      
      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        const noteDelay = idx * 0.12; // Arpeggio
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + noteDelay);
        
        g.gain.setValueAtTime(0, now + noteDelay);
        g.gain.linearRampToValueAtTime(0.1, now + noteDelay + 0.02);
        g.gain.exponentialRampToValueAtTime(0.00001, now + noteDelay + 0.8);
        
        osc.connect(g);
        g.connect(this.masterGain!);
        
        osc.start(now + noteDelay);
        osc.stop(now + noteDelay + 0.9);
      });
    } else if (type === 'click') {
      // Soft woodblock click
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);
      
      g.gain.setValueAtTime(0.2, now);
      g.gain.exponentialRampToValueAtTime(0.00001, now + 0.04);
      
      osc.connect(g);
      g.connect(this.masterGain!);
      
      osc.start(now);
      osc.stop(now + 0.05);
    }
  }

  public startAmbient(type: 'none' | 'drone' | 'waves' | 'rain') {
    this.resume();
    if (!this.ctx) return;
    if (this.currentAmbientType === type) return;
    
    this.stopAmbient();
    this.currentAmbientType = type;
    
    if (type === 'none') return;

    const now = this.ctx.currentTime;

    if (type === 'drone') {
      // Synthesize deep meditation drone
      const baseFreq = 65.41; // C2
      const freqs = [baseFreq, baseFreq * 1.5, baseFreq * 2, baseFreq * 0.75]; // C2, G2, C3, G1
      
      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const oscGain = this.ctx!.createGain();
        const lfo = this.ctx!.createOscillator();
        const lfoGain = this.ctx!.createGain();

        // Slightly detune to create a lush texture
        osc.type = 'sine';
        osc.frequency.value = freq + (Math.random() * 0.5 - 0.25);
        
        oscGain.gain.value = 0.15 / freqs.length;
        
        // LFO for slow volume swells
        lfo.type = 'sine';
        lfo.frequency.value = 0.05 + idx * 0.02; // Very slow: 15 to 20 second periods
        lfoGain.gain.value = 0.05; // Modulate gain by +/- 5%
        
        lfo.connect(lfoGain);
        lfoGain.connect(oscGain.gain);
        
        osc.connect(oscGain);
        oscGain.connect(this.ambientGain!);
        
        osc.start(now);
        lfo.start(now);
        
        this.ambientNodes.push(osc, lfo, oscGain, lfoGain);
      });

      // Add a higher harmonic for airiness
      const airOsc = this.ctx.createOscillator();
      const airGain = this.ctx.createGain();
      airOsc.type = 'sine';
      airOsc.frequency.value = baseFreq * 4; // C4
      airGain.gain.value = 0.01;
      airOsc.connect(airGain);
      airGain.connect(this.ambientGain!);
      airOsc.start(now);
      this.ambientNodes.push(airOsc, airGain);

    } else if (type === 'waves' || type === 'rain') {
      if (!this.noiseBuffer) this.createNoiseBuffer();
      
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = this.noiseBuffer;
      noiseSource.loop = true;
      
      // Filter the noise
      const filter = this.ctx.createBiquadFilter();
      filter.type = type === 'waves' ? 'bandpass' : 'lowpass';
      filter.frequency.value = type === 'waves' ? 400 : 800;
      filter.Q.value = type === 'waves' ? 1.0 : 0.5;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.value = 0.2;

      // Connect noise graph
      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ambientGain!);
      
      noiseSource.start(now);
      this.ambientNodes.push(noiseSource, filter, noiseGain);

      if (type === 'waves') {
        // Slow LFO to simulate waves washing in and out (12-second cycle)
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        
        lfo.type = 'sine';
        lfo.frequency.value = 0.08; // 12.5 second period
        
        lfoGain.gain.value = 0.15; // Swell amount
        
        lfo.connect(lfoGain);
        lfoGain.connect(noiseGain.gain); // Modulate gain
        
        // Modulate filter frequency too for a real sweeping water effect
        const filterLfoGain = this.ctx.createGain();
        filterLfoGain.gain.value = 250; // Sweeps filter frequency between 150Hz and 650Hz
        lfo.connect(filterLfoGain);
        filterLfoGain.connect(filter.frequency);

        lfo.start(now);
        this.ambientNodes.push(lfo, lfoGain, filterLfoGain);
      } else {
        // Rain - subtle random frequency modulations for pitter-patter
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.type = 'triangle';
        lfo.frequency.value = 1.5; // faster modulation
        lfoGain.gain.value = 0.03;
        
        lfo.connect(lfoGain);
        lfoGain.connect(noiseGain.gain);
        
        lfo.start(now);
        this.ambientNodes.push(lfo, lfoGain);
      }
    }
  }

  public stopAmbient() {
    if (!this.ctx) return;
    
    // Stop all active nodes
    this.ambientNodes.forEach(node => {
      try {
        if ('stop' in node) {
          (node as AudioScheduledSourceNode).stop();
        }
      } catch (e) {
        // Node might not be stoppable or already stopped
      }
    });
    
    this.ambientNodes = [];
    this.currentAmbientType = 'none';
  }
}

export const soundEngine = new SoundEngine();
