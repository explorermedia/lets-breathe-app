import React, { useState, useEffect } from 'react';
import { Play, Pause, X, CheckCircle, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { BreathingPattern, BreathingPhase, SessionHistory } from '../types/breathing';
import { AppTheme } from '../data/themes';
import { soundEngine } from '../services/soundEngine';
import { AmbientBackground } from './AmbientBackground';

interface BreathingSessionProps {
  pattern: BreathingPattern;
  duration: number; // in seconds
  theme: AppTheme;
  ambientSound: 'none' | 'drone' | 'waves' | 'rain';
  cueSound: 'bell' | 'chime' | 'bowl' | 'click';
  onClose: () => void;
  onSaveSession: (session: Omit<SessionHistory, 'id' | 'date'>) => void;
}

export const BreathingSession: React.FC<BreathingSessionProps> = ({
  pattern,
  duration,
  theme,
  ambientSound,
  cueSound,
  onClose,
  onSaveSession
}) => {
  // Session states: 'checkin' | 'prepare' | 'breathing' | 'checkout' | 'summary'
  const [sessionState, setSessionState] = useState<'checkin' | 'prepare' | 'breathing' | 'checkout' | 'summary'>('checkin');
  const [stressBefore, setStressBefore] = useState<number>(5);
  const [stressAfter, setStressAfter] = useState<number>(3);
  
  // Breathing animation states
  const [isActive, setIsActive] = useState<boolean>(true);
  const [phase, setPhase] = useState<BreathingPhase>('prepare');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(5);
  const [totalSecondsLeft, setTotalSecondsLeft] = useState<number>(duration);
  const [currentCycle, setCurrentCycle] = useState<number>(0);
  
  const [circleScale, setCircleScale] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Sound Engine initial trigger
  useEffect(() => {
    if (sessionState === 'breathing' && isActive) {
      soundEngine.startAmbient(ambientSound);
    } else {
      soundEngine.stopAmbient();
    }

    return () => {
      soundEngine.stopAmbient();
    };
  }, [sessionState, ambientSound, isActive]);

  // Handle Mute toggle
  const handleToggleMute = () => {
    const muteStatus = soundEngine.toggleMute();
    setIsMuted(muteStatus);
  };

  // Phase transition and timing logic
  useEffect(() => {
    if (sessionState !== 'breathing' || !isActive) return;

    let startTime = performance.now();
    let frameId: number;

    const tick = () => {
      const now = performance.now();
      const elapsedTotal = (now - startTime) / 1000;
      
      // Calculate remaining total session time
      const newTotalLeft = Math.max(0, duration - elapsedTotal);
      setTotalSecondsLeft(Math.ceil(newTotalLeft));

      if (newTotalLeft <= 0) {
        setSessionState('checkout');
        soundEngine.playCue(cueSound === 'click' ? 'chime' : 'chime');
        cancelAnimationFrame(frameId);
        return;
      }

      // Calculate breathing cycle timing
      const cycleTime = pattern.inhale + pattern.holdIn + pattern.exhale + pattern.holdOut;
      const sessionElapsed = elapsedTotal;
      const cycleElapsed = sessionElapsed % cycleTime;
      const completedCycles = Math.floor(sessionElapsed / cycleTime);
      setCurrentCycle(completedCycles);

      // Determine current phase and progress
      let currentPhase: BreathingPhase = 'inhale';
      let phaseTimeElapsed = 0;
      let phaseDuration = pattern.inhale;

      if (cycleElapsed < pattern.inhale) {
        currentPhase = 'inhale';
        phaseTimeElapsed = cycleElapsed;
        phaseDuration = pattern.inhale;
      } else if (cycleElapsed < pattern.inhale + pattern.holdIn) {
        currentPhase = 'holdIn';
        phaseTimeElapsed = cycleElapsed - pattern.inhale;
        phaseDuration = pattern.holdIn;
      } else if (cycleElapsed < pattern.inhale + pattern.holdIn + pattern.exhale) {
        currentPhase = 'exhale';
        phaseTimeElapsed = cycleElapsed - (pattern.inhale + pattern.holdIn);
        phaseDuration = pattern.exhale;
      } else {
        currentPhase = 'holdOut';
        phaseTimeElapsed = cycleElapsed - (pattern.inhale + pattern.holdIn + pattern.exhale);
        phaseDuration = pattern.holdOut;
      }

      const progress = phaseTimeElapsed / phaseDuration;
      setPhaseSecondsLeft(Math.ceil(phaseDuration - phaseTimeElapsed));

      // Trigger cue sounds on phase change
      setPhase((prevPhase) => {
        if (prevPhase !== currentPhase) {
          soundEngine.playCue(cueSound);
          return currentPhase;
        }
        return prevPhase;
      });

      // Calculate breathing circle scaling
      // Base scale: 1.0 (empty) to 1.8 (full)
      let scale = 1.0;
      if (currentPhase === 'inhale') {
        // Linear expansion from 1.0 to 1.8
        scale = 1.0 + progress * 0.8;
      } else if (currentPhase === 'holdIn') {
        // Maintain full expansion
        scale = 1.8;
      } else if (currentPhase === 'exhale') {
        // Linear contraction from 1.8 to 1.0
        scale = 1.8 - progress * 0.8;
      } else if (currentPhase === 'holdOut') {
        // Maintain complete contraction
        scale = 1.0;
      }
      setCircleScale(scale);

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [sessionState, isActive, pattern, duration, cueSound]);

  // Handle Preparation countdown (5 seconds before session starts)
  useEffect(() => {
    if (sessionState !== 'prepare') return;

    soundEngine.playCue('chime');
    let timeLeft = 5;
    setPhaseSecondsLeft(timeLeft);
    setPhase('prepare');

    const interval = setInterval(() => {
      timeLeft -= 1;
      setPhaseSecondsLeft(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(interval);
        setSessionState('breathing');
      } else {
        soundEngine.playCue('click');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionState]);

  // Phase instructional text and subtitles
  const getPhaseText = (p: BreathingPhase) => {
    switch (p) {
      case 'prepare': return 'Prepare Yourself';
      case 'inhale': return 'Breathe In';
      case 'holdIn': return 'Hold Breath';
      case 'exhale': return 'Exhale Slowly';
      case 'holdOut': return 'Hold Empty';
      default: return '';
    }
  };

  const getPhaseSubtitle = (p: BreathingPhase) => {
    switch (p) {
      case 'prepare': return 'Find a comfortable sitting position and empty your lungs.';
      case 'inhale': return 'Fill your chest with air, feel your belly expand...';
      case 'holdIn': return 'Retain the breath gently, relax your shoulders...';
      case 'exhale': return 'Release the air smoothly and completely through your mouth...';
      case 'holdOut': return 'Pause in the stillness before the next breath...';
      default: return '';
    }
  };

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Radial progress offset calculation
  const radius = 130;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (totalSecondsLeft / duration) * circumference;

  const handleFinishCheckOut = () => {
    // Save to history
    onSaveSession({
      patternId: pattern.id,
      patternName: pattern.name,
      durationSeconds: duration,
      completed: true,
      stressBefore,
      stressAfter
    });
    setSessionState('summary');
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col transition-all duration-1000 ${theme.bgClass} font-sans select-none overflow-hidden h-full w-full`}>
      {/* Background drifting orbs */}
      <AmbientBackground 
        theme={theme} 
        isBreathing={sessionState === 'breathing'} 
        phaseScale={(circleScale - 1) / 0.8}
      />

      {/* Top Header/Action Bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 w-full">
        {sessionState === 'checkin' ? (
          <button
            onClick={onClose}
            className="flex items-center space-x-2 text-sm text-slate-400 hover:text-slate-100 bg-slate-800/20 hover:bg-slate-800/40 px-3 py-1.5 rounded-full backdrop-blur-sm transition-all border border-slate-700/30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        ) : (
          <div />
        )}

        {sessionState === 'breathing' && (
          <div className="flex items-center space-x-2 bg-slate-900/30 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800/40">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-sm font-medium tracking-wider text-slate-300">
              {pattern.name} • {formatTime(totalSecondsLeft)} left
            </span>
          </div>
        )}

        {(sessionState === 'breathing' || sessionState === 'prepare') && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleMute}
              className="text-slate-400 hover:text-slate-200 p-2.5 rounded-full bg-slate-900/20 border border-slate-800/30 backdrop-blur-sm"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              onClick={() => {
                if (window.confirm('End this breathing session?')) {
                  onClose();
                }
              }}
              className="text-slate-400 hover:text-slate-100 p-2.5 rounded-full bg-slate-900/20 border border-slate-800/30 backdrop-blur-sm hover:bg-red-500/20 hover:border-red-500/30"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center px-4">
        
        {/* VIEW 1: PRE-SESSION STRESS CHECK-IN */}
        {sessionState === 'checkin' && (
          <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-8 rounded-3xl text-center space-y-6 shadow-2xl animate-fade-in animate-slide-up">
            <h2 className="text-3xl font-light tracking-wide">Pre-Session Check-in</h2>
            <p className="text-slate-400 text-sm">
              How stressed or tense are you feeling right now?
            </p>
            
            <div className="py-8">
              <div className="text-6xl font-extralight mb-4 text-cyan-400">{stressBefore}</div>
              <div className="text-sm uppercase tracking-widest text-slate-500 mb-6 font-semibold">
                {stressBefore <= 3 ? 'Calm / relaxed' : stressBefore <= 6 ? 'Moderately tense' : 'Highly stressed'}
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={stressBefore}
                onChange={(e) => setStressBefore(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-xs text-slate-500 font-mono mt-2">
                <span>1 (Zen)</span>
                <span>5 (Average)</span>
                <span>10 (Overwhelmed)</span>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.resume();
                setSessionState('prepare');
              }}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium rounded-2xl shadow-lg transition-all duration-300 transform hover:translate-y-[-1px] active:translate-y-0"
            >
              Begin Practice
            </button>
          </div>
        )}

        {/* VIEW 2: PREPARATION COUNTDOWN */}
        {sessionState === 'prepare' && (
          <div className="text-center space-y-8 max-w-md animate-fade-in">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-48 h-48 rounded-full border border-slate-800/30 animate-ping opacity-20"></div>
              <div className="text-8xl font-thin tracking-tighter text-white font-mono bg-slate-900/40 border border-slate-800/30 rounded-full w-40 h-40 flex items-center justify-center backdrop-blur-md">
                {phaseSecondsLeft}
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-light tracking-wide text-slate-200">Get Ready...</h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                {getPhaseSubtitle('prepare')}
              </p>
            </div>
          </div>
        )}

        {/* VIEW 3: ACTIVE BREATHING SESSION */}
        {sessionState === 'breathing' && (
          <div className="flex flex-col items-center justify-center text-center max-w-lg w-full">
            {/* The Breathing Circle Visual Guide */}
            <div className="relative w-[320px] h-[320px] flex items-center justify-center mb-16">
              
              {/* Outer Total Session SVG Progress Ring */}
              <svg className="absolute w-full h-full -rotate-90 pointer-events-none z-10">
                <circle
                  cx="160"
                  cy="160"
                  r={radius}
                  fill="transparent"
                  className="stroke-slate-800/30"
                  strokeWidth={2}
                />
                <circle
                  cx="160"
                  cy="160"
                  r={radius}
                  fill="transparent"
                  className={`transition-all duration-1000 stroke-current ${theme.primaryColor}`}
                  strokeWidth={stroke}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>

              {/* Background ambient decorative rotating circles */}
              <div className={`absolute rounded-full border border-dashed opacity-20 ${theme.circleBorder} w-[290px] h-[290px] animate-spin-slow`}></div>
              <div className={`absolute rounded-full border border-dotted opacity-10 ${theme.circleBorder} w-[340px] h-[340px] animate-spin-reverse`}></div>

              {/* The Dynamic Breathing Circle */}
              <div
                style={{
                  transform: `scale(${circleScale})`,
                  transition: isActive ? 'transform 100ms linear' : 'transform 500ms ease-out',
                }}
                className={`absolute w-[150px] h-[150px] rounded-full backdrop-blur-xl border border-white/20 flex items-center justify-center ${theme.circleColor} ${theme.circleBorder} ${theme.accentGlow}`}
              >
                {/* Center Core */}
                <div className="w-[20px] h-[20px] rounded-full bg-white/20 blur-[2px]"></div>
              </div>

              {/* Text overlays inside/around the circle */}
              <div className="relative z-20 flex flex-col items-center justify-center text-center">
                <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1 opacity-75">
                  {phase === 'holdIn' || phase === 'holdOut' ? 'Pause' : phase}
                </span>
                <h1 className="text-3xl font-light tracking-wide text-white mb-2">
                  {getPhaseText(phase)}
                </h1>
                <div className="text-xl font-mono text-white/80 bg-black/20 px-3 py-0.5 rounded-full border border-white/5 backdrop-blur-md">
                  {phaseSecondsLeft}s
                </div>
              </div>
            </div>

            {/* Subtitle instructions below circle */}
            <div className="h-16 px-6 max-w-sm">
              <p className="text-base text-slate-300 font-light leading-relaxed animate-fade-in">
                {getPhaseSubtitle(phase)}
              </p>
            </div>

            {/* Play/Pause Button */}
            <div className="mt-8 flex items-center space-x-6">
              <div className="text-xs text-slate-500 uppercase tracking-widest font-mono">
                Cycle {currentCycle + 1}
              </div>
              
              <button
                onClick={() => setIsActive(!isActive)}
                className={`p-5 rounded-full backdrop-blur-md border border-white/20 transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/10 text-white hover:bg-white/20' 
                    : 'bg-emerald-500 text-white hover:bg-emerald-400 scale-110 shadow-lg shadow-emerald-500/30'
                }`}
              >
                {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
              </button>

              <div className="text-xs text-slate-500 uppercase tracking-widest font-mono">
                {formatTime(duration - totalSecondsLeft)} In
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: POST-SESSION STRESS CHECK-OUT */}
        {sessionState === 'checkout' && (
          <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-8 rounded-3xl text-center space-y-6 shadow-2xl animate-fade-in animate-slide-up">
            <div className="inline-flex p-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-light tracking-wide">Session Complete!</h2>
            <p className="text-slate-400 text-sm">
              Take a moment to check in with yourself. How do you feel now?
            </p>
            
            <div className="py-8">
              <div className="text-6xl font-extralight mb-4 text-emerald-400">{stressAfter}</div>
              <div className="text-sm uppercase tracking-widest text-slate-500 mb-6 font-semibold">
                {stressAfter <= 3 ? 'Calm / relaxed' : stressAfter <= 6 ? 'Moderately tense' : 'Highly stressed'}
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={stressAfter}
                onChange={(e) => setStressAfter(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-xs text-slate-500 font-mono mt-2">
                <span>1 (Zen)</span>
                <span>5 (Average)</span>
                <span>10 (Overwhelmed)</span>
              </div>
            </div>

            <button
              onClick={handleFinishCheckOut}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium rounded-2xl shadow-lg transition-all duration-300 transform hover:translate-y-[-1px] active:translate-y-0"
            >
              View Summary
            </button>
          </div>
        )}

        {/* VIEW 5: SESSION SUMMARY & MOTIVATION */}
        {sessionState === 'summary' && (
          <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800/40 p-8 rounded-3xl text-center shadow-2xl animate-fade-in animate-slide-up">
            <h2 className="text-3xl font-light tracking-wide mb-2">Wonderful Job</h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              You dedicated {formatTime(duration)} to your mental well-being. Consistently taking breaks to breathe re-wires your brain's stress response.
            </p>

            {/* Comparison Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/40 flex flex-col items-center">
                <span className="text-xs text-slate-400 uppercase tracking-widest mb-1">Stress Change</span>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 line-through font-light text-xl">{stressBefore}</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-2xl font-semibold text-emerald-400">{stressAfter}</span>
                </div>
                {stressBefore > stressAfter ? (
                  <span className="text-xs text-emerald-500 font-medium mt-1 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    -{Math.round(((stressBefore - stressAfter) / stressBefore) * 100)}% Stress
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 mt-1">Maintained calm</span>
                )}
              </div>

              <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/40 flex flex-col items-center">
                <span className="text-xs text-slate-400 uppercase tracking-widest mb-1">Total Breaths</span>
                <span className="text-2xl font-bold text-cyan-400">{currentCycle}</span>
                <span className="text-xs text-slate-400 mt-1">Cycles completed</span>
              </div>
            </div>

            <p className="text-emerald-300 font-light italic text-base px-4 py-3 bg-emerald-950/20 rounded-xl border border-emerald-500/10 mb-8">
              "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor." 
              <span className="block text-xs mt-1 text-emerald-500 font-medium not-italic">— Thich Nhat Hanh</span>
            </p>

            <button
              onClick={onClose}
              className="w-full py-4 bg-slate-100 hover:bg-white text-slate-950 font-semibold rounded-2xl shadow-md transition-all duration-300"
            >
              Return to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
