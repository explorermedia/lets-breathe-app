import React, { useEffect, useState } from 'react';
import { Volume2, Music, Bell, Clock, Palette, Check, Play, Pause } from 'lucide-react';
import { UserSettings } from '../types/breathing';
import { appThemes } from '../data/themes';
import { soundEngine } from '../services/soundEngine';

import { Lock, Crown } from 'lucide-react';

interface SettingsPanelProps {
  settings: UserSettings;
  isPremiumUser: boolean;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onOpenPaywall: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  isPremiumUser,
  onUpdateSettings,
  onOpenPaywall
}) => {
  const [isPreviewingAmbient, setIsPreviewingAmbient] = useState(false);

  // Stop ambient sound on unmount if previewing
  useEffect(() => {
    return () => {
      soundEngine.stopAmbient();
    };
  }, []);

  const handleAmbientChange = (sound: UserSettings['ambientSound']) => {
    // Check if premium sound
    if ((sound === 'drone' || sound === 'rain') && !isPremiumUser) {
      onOpenPaywall();
      return;
    }

    onUpdateSettings({ ambientSound: sound });
    
    // Play sound immediately if preview is on
    if (isPreviewingAmbient && sound !== 'none') {
      soundEngine.startAmbient(sound);
    } else if (sound === 'none') {
      soundEngine.stopAmbient();
      setIsPreviewingAmbient(false);
    }
  };

  const toggleAmbientPreview = () => {
    if (isPreviewingAmbient) {
      soundEngine.stopAmbient();
      setIsPreviewingAmbient(false);
    } else {
      if (settings.ambientSound !== 'none') {
        soundEngine.startAmbient(settings.ambientSound);
        setIsPreviewingAmbient(true);
      }
    }
  };

  const handleCueChange = (cue: UserSettings['cueSound']) => {
    onUpdateSettings({ cueSound: cue });
    // Play a sample of the cue sound
    soundEngine.playCue(cue);
  };

  const handleVolumeChange = (type: 'master' | 'ambient', val: number) => {
    if (type === 'master') {
      onUpdateSettings({ masterVolume: val });
      soundEngine.setMasterVolume(val);
    } else {
      onUpdateSettings({ ambientVolume: val });
      soundEngine.setAmbientVolume(val);
    }
  };

  const durations = [
    { label: '1 Min', value: 60 },
    { label: '3 Mins', value: 180 },
    { label: '5 Mins', value: 300 },
    { label: '10 Mins', value: 600 },
    { label: '15 Mins', value: 900 }
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto w-full px-2">
      
      {/* Upgrade Banner for Free Tier */}
      {!isPremiumUser && (
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border border-cyan-500/20 rounded-2xl p-5 flex items-center justify-between shadow-lg relative overflow-hidden group animate-slide-up">
          <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <Crown className="w-6 h-6 animate-pulse" />
            </div>
<div>
              <h4 className="font-semibold text-white">Unlock Flowbreath Premium</h4>
              <p className="text-xs text-slate-400 mt-0.5">Get unlimited custom rhythms, premium themes, and immersive ambient audio.</p>
            </div>
          </div>
          <button
            onClick={onOpenPaywall}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all hover:translate-y-[-1px] active:translate-y-0 relative z-10 flex items-center space-x-1 flex-shrink-0"
          >
            <span>Upgrade</span>
          </button>
        </div>
      )}

      {/* 1. Audio Controls */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center space-x-2 border-b border-slate-800/40 pb-3">
          <Volume2 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-medium text-slate-100">Audio & Sounds</h3>
        </div>

        {/* Volume Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-400 font-semibold uppercase tracking-widest">
              <span>Voice / Cues Volume</span>
              <span className="font-mono text-slate-200">{Math.round(settings.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.masterVolume}
              onChange={(e) => handleVolumeChange('master', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-400 font-semibold uppercase tracking-widest">
              <span>Ambient Volume</span>
              <span className="font-mono text-slate-200">{Math.round(settings.ambientVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.ambientVolume}
              onChange={(e) => handleVolumeChange('ambient', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Ambient Soundscapes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center space-x-1">
                <Music className="w-3.5 h-3.5 text-cyan-400" />
                <span>Background Ambient</span>
              </label>

              {settings.ambientSound !== 'none' && (
                <button
                  onClick={toggleAmbientPreview}
                  className={`flex items-center space-x-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border backdrop-blur-sm transition-all ${
                    isPreviewingAmbient
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-sm'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {isPreviewingAmbient ? (
                    <>
                      <Pause className="w-3 h-3 fill-current" />
                      <span>Stop Preview</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>Preview Sound</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <select
              value={settings.ambientSound}
              onChange={(e) => handleAmbientChange(e.target.value as UserSettings['ambientSound'])}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/40 transition-colors cursor-pointer"
            >
              <option value="none">Silence (No Ambient Sound)</option>
              <option value="drone">Deep Meditation Drone {!isPremiumUser ? '🔒' : '(Premium)'}</option>
              <option value="waves">Soothing Ocean Waves</option>
              <option value="rain">Summer Rain {!isPremiumUser ? '🔒' : '(Premium)'}</option>
            </select>
          </div>

          {/* Transition Cues */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center space-x-1">
              <Bell className="w-3.5 h-3.5 text-cyan-400" />
              <span>Breathing Cues</span>
            </label>
            <select
              value={settings.cueSound}
              onChange={(e) => handleCueChange(e.target.value as UserSettings['cueSound'])}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/40 transition-colors cursor-pointer"
            >
              <option value="bell">Tibetan Bell</option>
              <option value="chime">Wind Chime</option>
              <option value="bowl">Singing Bowl</option>
              <option value="click">Soft Woodblock Click</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Session Defaults */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center space-x-2 border-b border-slate-800/40 pb-3">
          <Clock className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-medium text-slate-100">Session Preferences</h3>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Default Session Length</label>
          <div className="flex flex-wrap gap-2">
            {durations.map((d) => (
              <button
                key={d.value}
                onClick={() => onUpdateSettings({ defaultDuration: d.value })}
                className={`flex-1 min-w-[70px] py-3 rounded-xl text-xs font-medium border transition-all ${
                  settings.defaultDuration === d.value
                    ? 'bg-slate-100 text-slate-950 border-white font-bold'
                    : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Visual Themes Grid */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center space-x-2 border-b border-slate-800/40 pb-3">
          <Palette className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-medium text-slate-100">Visual Environments</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {appThemes.map((t) => {
            const isLockedTheme = t.requiresPremium && !isPremiumUser;
            return (
              <button
                key={t.id}
                onClick={() => {
                  if (isLockedTheme) {
                    onOpenPaywall();
                  } else {
                    onUpdateSettings({ theme: t.id });
                  }
                }}
                className={`p-4 rounded-2xl border transition-all flex flex-col items-center text-center space-y-2 group relative overflow-hidden ${
                  settings.theme === t.id
                    ? 'border-white/40 ring-2 ring-white/20'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/20'
                }`}
              >
                {/* Fake Background Preview Square */}
                <div className={`w-full h-14 rounded-xl ${t.bgClass} flex items-center justify-center border border-white/5 shadow-inner mb-1`}>
                  <div className={`w-6 h-6 rounded-full border-2 ${t.circleBorder} ${t.circleColor}`}></div>
                </div>
                
                <span className={`text-xs font-medium group-hover:text-white transition-colors flex items-center space-x-1 ${settings.theme === t.id ? 'text-slate-100 font-bold' : 'text-slate-400'}`}>
                  <span>{t.name}</span>
                  {t.requiresPremium && (
                    <span className="text-[10px] text-cyan-400">
                      <Lock className="w-3 h-3" />
                    </span>
                  )}
                </span>

                {settings.theme === t.id && (
                  <div className="absolute top-2 right-2 bg-white text-slate-950 rounded-full p-0.5 shadow-sm">
                    <Check className="w-3 h-3 font-extrabold" />
                  </div>
                )}
                {isLockedTheme && (
                  <div className="absolute top-2 right-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full p-1.5 shadow-sm">
                    <Lock className="w-3 h-3" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
