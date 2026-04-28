import React, { useState, useEffect } from 'react';
import { Wind, ArrowRight, Sparkles, Smile, Eye, Moon, Heart, Lock, Check } from 'lucide-react';
import { AppTheme } from '../data/themes';

interface OnboardingProps {
  theme: AppTheme;
  onComplete: (upgradeToPremium: boolean) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ theme, onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [breathScale, setBreathScale] = useState<number>(1.0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale'>('inhale');

  // Interactive Breathing Animation for Step 3
  useEffect(() => {
    if (step !== 3) return;

    let startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) % 8000; // 8 second cycle (4s in, 4s out)
      
      if (elapsed < 4000) {
        setBreathPhase('inhale');
        setBreathScale(1.0 + (elapsed / 4000) * 0.8); // Expand 1.0 -> 1.8
      } else {
        setBreathPhase('exhale');
        setBreathScale(1.8 - ((elapsed - 4000) / 4000) * 0.8); // Contract 1.8 -> 1.0
      }
    }, 50);

    return () => clearInterval(interval);
  }, [step]);

  const goals = [
    { id: 'stress', label: 'Reduce Stress & Anxiety', icon: <Smile className="w-5 h-5 text-emerald-400" /> },
    { id: 'sleep', label: 'Improve Sleep Quality', icon: <Moon className="w-5 h-5 text-indigo-400" /> },
    { id: 'focus', label: 'Increase Mental Focus', icon: <Eye className="w-5 h-5 text-cyan-400" /> },
    { id: 'health', label: 'General Well-being', icon: <Heart className="w-5 h-5 text-rose-400" /> }
  ];

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-slate-950 font-sans select-none overflow-hidden h-full w-full`}>
      
      {/* Background Decorative Rings */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed opacity-10 ${theme.circleBorder} w-[300px] h-[300px] animate-spin-slow`}></div>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dotted opacity-5 ${theme.circleBorder} w-[450px] h-[450px] animate-spin-reverse`}></div>

      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-8 rounded-3xl text-center shadow-2xl relative z-10">
        
        {/* Progress Bar */}
        <div className="flex justify-center space-x-1.5 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step 
                  ? 'w-8 bg-cyan-400' 
                  : s < step 
                    ? 'w-4 bg-cyan-600/50' 
                    : 'w-4 bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* STEP 1: WELCOME */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="inline-flex p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400 mb-2 shadow-lg shadow-cyan-500/5">
              <Wind className="w-10 h-10 animate-pulse" />
            </div>
            <h1 className="text-3xl font-light tracking-wide text-white">
              Welcome to <span className="font-semibold text-cyan-400">Flowbreath</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Flowbreath is a scientifically-backed breathing app designed to help you regulate your nervous system, reduce stress instantly, and optimize your mental clarity.
            </p>
            <p className="text-slate-500 text-xs italic">
              "Conscious breathing is the ultimate anchor."
            </p>
            <div className="pt-4">
              <button
                onClick={() => setStep(2)}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: GOAL SELECTION */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-light tracking-wide text-white">What is your main goal?</h2>
              <p className="text-slate-400 text-xs mt-1">We will customize your daily practice based on your focus.</p>
            </div>

            <div className="space-y-3 pt-2">
              {goals.map((g) => (
                <div
                  key={g.id}
                  onClick={() => setSelectedGoal(g.id)}
                  className={`p-4 rounded-xl border flex items-center space-x-4 cursor-pointer transition-all ${
                    selectedGoal === g.id
                      ? 'bg-slate-800 border-cyan-500/50 text-white shadow-md font-semibold'
                      : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:bg-slate-900/30'
                  }`}
                >
                  <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800`}>
                    {g.icon}
                  </div>
                  <span className="text-sm">{g.label}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                onClick={() => setStep(3)}
                disabled={!selectedGoal}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 text-white disabled:text-slate-500 font-medium rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition-all disabled:cursor-not-allowed"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: BREATHING DEMO */}
        {step === 3 && (
          <div className="space-y-8 animate-fade-in flex flex-col items-center">
            <div className="text-center">
              <h2 className="text-2xl font-light tracking-wide text-white">How it works</h2>
              <p className="text-slate-400 text-xs mt-1">Synchronize your breath with the expanding circle.</p>
            </div>

            {/* Breathing Circle Container */}
            <div className="relative w-48 h-48 flex items-center justify-center my-4">
              {/* Outer Ring */}
              <div className={`absolute rounded-full border border-dashed opacity-20 ${theme.circleBorder} w-full h-full animate-spin-slow`}></div>
              
              {/* Animated Circle */}
              <div
                style={{
                  transform: `scale(${breathScale})`,
                  transition: 'transform 50ms linear',
                }}
                className={`absolute w-24 h-24 rounded-full backdrop-blur-xl border border-white/10 flex items-center justify-center ${theme.circleColor} ${theme.circleBorder} ${theme.accentGlow}`}
              />

              {/* Center Core */}
              <div className="relative z-10 text-center">
                <span className="text-xs uppercase font-mono text-white/80 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {breathPhase === 'inhale' ? 'Breathe In' : 'Breathe Out'}
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed max-w-xs mx-auto text-center h-8">
              {breathPhase === 'inhale' 
                ? 'Fill your lungs gently as the circle expands...' 
                : 'Exhale fully and smoothly as the circle contracts...'
              }
            </p>

            <div className="pt-4 w-full">
              <button
                onClick={() => setStep(4)}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition-all"
              >
                <span>Enter Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: INTRODUCTORY PAYWALL */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            {/* Header Badge */}
            <div className="relative pt-4">
              <div className="inline-flex p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400 mb-3 shadow-lg shadow-cyan-500/5">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide">Unlock the Full Experience</h2>
              <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto leading-relaxed">
                Start your mindfulness journey with a special introductory offer.
              </p>
            </div>

            {/* Micro Features list */}
            <div className="bg-slate-950/40 border border-slate-800/40 rounded-2xl p-4 text-left space-y-3">
              {[
                'Unlock advanced 4-7-8 and Awakening routines',
                'Create unlimited custom breathing ratios',
                'Synthesized background soundscapes (Drone, Rain)',
                'Immersive visual canvas themes (Sunset, Aurora)',
              ].map((text, i) => (
                <div key={i} className="flex items-center space-x-2.5 text-xs text-slate-300">
                  <div className="p-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Special MVP Offer Box */}
            <div className="border border-cyan-500/20 bg-cyan-500/5 rounded-2xl p-4 text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-md border border-cyan-500/20">
                Special MVP Launch Offer
              </span>
              <div className="flex items-baseline justify-center space-x-1 mt-2.5">
                <span className="text-3xl font-bold text-white">$29.99</span>
                <span className="text-xs text-slate-400">per year</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">Just $2.49/mo (Save 50% vs Monthly)</p>
            </div>

            <div className="space-y-2 pt-2">
              {/* Upgrade CTA */}
              <button
                onClick={() => onComplete(true)}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-cyan-500/10 flex items-center justify-center space-x-2 transition-all hover:translate-y-[-1px] active:translate-y-0"
              >
                <Lock className="w-4 h-4" />
                <span>Unlock Premium Access</span>
              </button>

              {/* Free Trial / Skip CTA */}
              <button
                onClick={() => onComplete(false)}
                className="w-full text-center py-2 text-xs text-slate-500 hover:text-slate-400 font-medium transition-colors"
              >
                Start with Free Tier & Explore First
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
