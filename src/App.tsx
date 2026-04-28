import { useState, useEffect } from 'react';
import { Wind, Activity, Settings as SettingsIcon, Heart } from 'lucide-react';

import { defaultPatterns } from './data/defaultPatterns';
import { appThemes, defaultTheme } from './data/themes';
import { BreathingPattern, SessionHistory, UserSettings, BreathingStats } from './types/breathing';

import { soundEngine } from './services/soundEngine';
import { Dashboard } from './components/Dashboard';
import { PresetSelector } from './components/PresetSelector';
import { CustomPatternForm } from './components/CustomPatternForm';
import { SettingsPanel } from './components/SettingsPanel';
import { BreathingSession } from './components/BreathingSession';
import { AmbientBackground } from './components/AmbientBackground';
import { Paywall } from './components/Paywall';
import { Onboarding } from './components/Onboarding';

// LocalStorage Keys
const HISTORY_KEY = 'flowbreath_history';
const CUSTOM_PATTERNS_KEY = 'flowbreath_custom';
const SETTINGS_KEY = 'flowbreath_settings';

const defaultSettings: UserSettings = {
  masterVolume: 0.8,
  ambientVolume: 0.5,
  ambientSound: 'waves',
  cueSound: 'chime',
  theme: 'deep-ocean',
  defaultDuration: 180,
  hasCompletedOnboarding: false,
  isPremium: false
};

export default function App() {
  // Application State
  const [history, setHistory] = useState<SessionHistory[]>([]);
  const [customPresets, setCustomPresets] = useState<BreathingPattern[]>([]);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'routines' | 'settings'>('routines');
  const [activePreset, setActivePreset] = useState<BreathingPattern | null>(null);
  const [isCreatingCustom, setIsCreatingCustom] = useState<boolean>(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);

  // Initialize and load data from LocalStorage
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_KEY);
      if (storedHistory) setHistory(JSON.parse(storedHistory));

      const storedCustom = localStorage.getItem(CUSTOM_PATTERNS_KEY);
      if (storedCustom) setCustomPresets(JSON.parse(storedCustom));

      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSettings({ ...defaultSettings, ...parsed });
        
        // Apply initial volume settings to sound engine
        setTimeout(() => {
          soundEngine.setMasterVolume(parsed.masterVolume ?? defaultSettings.masterVolume);
          soundEngine.setAmbientVolume(parsed.ambientVolume ?? defaultSettings.ambientVolume);
        }, 100);
      } else {
        // First load defaults
        soundEngine.setMasterVolume(defaultSettings.masterVolume);
        soundEngine.setAmbientVolume(defaultSettings.ambientVolume);
      }
    } catch (e) {
      console.error('Failed to load localStorage data', e);
    }
  }, []);

  // Save Settings
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Save a New Custom Breathing Pattern
  const handleSaveCustomPattern = (pattern: BreathingPattern) => {
    setCustomPresets(prev => {
      const updated = [...prev, pattern];
      localStorage.setItem(CUSTOM_PATTERNS_KEY, JSON.stringify(updated));
      return updated;
    });
    setIsCreatingCustom(false);
    setActiveTab('routines');
  };

  // Delete Custom Breathing Pattern
  const handleDeleteCustomPattern = (id: string) => {
    setCustomPresets(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem(CUSTOM_PATTERNS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Clear Session History
  const handleClearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  // Save Session to History
  const handleSaveSession = (sessionData: Omit<SessionHistory, 'id' | 'date'>) => {
    const newSession: SessionHistory = {
      ...sessionData,
      id: `session-${Date.now()}`,
      date: new Date().toISOString()
    };

    setHistory(prev => {
      const updated = [newSession, ...prev];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Select preset and open BreathingSession overlay
  const handleSelectPreset = (pattern: BreathingPattern) => {
    setActivePreset(pattern);
  };

  const handleSelectPresetFromDashboard = (presetId: string) => {
    const found = defaultPatterns.find(p => p.id === presetId) || customPresets.find(p => p.id === presetId);
    if (found) {
      setActivePreset(found);
    } else {
      // Fallback to first routine
      setActivePreset(defaultPatterns[0]);
    }
  };

  // Calculate Mindfulness Statistics
  const calculateStats = (): BreathingStats => {
    const completed = history.filter(h => h.completed);
    const totalMinutes = completed.reduce((acc, h) => acc + (h.durationSeconds / 60), 0);
    const sessionsCount = completed.length;
    
    if (completed.length === 0) {
      return { totalMinutes, sessionsCount, streakDays: 0, lastSessionDate: null };
    }

    // Sort unique dates in descending order
    const uniqueDates = Array.from(new Set(
      completed.map(h => h.date.split('T')[0])
    )).sort().reverse();

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if user breathed today or yesterday
    if (uniqueDates.length > 0 && (uniqueDates.includes(today) || uniqueDates.includes(yesterday))) {
      let currentCheckDate = uniqueDates.includes(today) ? today : yesterday;
      let idx = uniqueDates.indexOf(currentCheckDate);
      
      while (idx !== -1) {
        streak++;
        // Go back one day
        const prevDateObj = new Date(currentCheckDate);
        prevDateObj.setDate(prevDateObj.getDate() - 1);
        const prevDateStr = prevDateObj.toISOString().split('T')[0];
        
        currentCheckDate = prevDateStr;
        idx = uniqueDates.indexOf(currentCheckDate);
      }
    }

    return {
      totalMinutes,
      sessionsCount,
      streakDays: streak,
      lastSessionDate: uniqueDates[0] || null
    };
  };

  const stats = calculateStats();

  // Get active theme
  const currentTheme = appThemes.find(t => t.id === settings.theme) || defaultTheme;

  // Onboarding Screen Interceptor for First-Time Users
  if (!settings.hasCompletedOnboarding) {
    return (
      <Onboarding
        theme={currentTheme}
        onComplete={(upgradeToPremium) => {
          handleUpdateSettings({
            hasCompletedOnboarding: true,
            isPremium: upgradeToPremium || settings.isPremium
          });
          if (upgradeToPremium) {
            alert('🎉 Congratulations! Flowbreath Premium unlocked successfully. Welcome to your mindfulness journey!');
          }
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.bgClass} flex flex-col font-sans transition-colors duration-1000 select-none`}>
      
      {/* Background animated orbs for main dashboard */}
      <AmbientBackground theme={currentTheme} isBreathing={false} />

      {/* Main Header */}
      <header className="relative z-10 w-full px-6 py-6 border-b border-white/5 backdrop-blur-sm bg-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-2xl bg-white/5 border ${currentTheme.circleBorder} text-white`}>
            <Wind className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center space-x-1.5">
              <span>Flowbreath</span>
              <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full border ${settings.isPremium ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-white/5 text-slate-400 border-white/10'} font-bold`}>
                {settings.isPremium ? 'Premium' : 'Free'}
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-light mt-0.5">Paced mindfulness & breathing journal</p>
          </div>
        </div>

        {/* Motivational Subtext */}
        <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400 font-medium bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
          <Heart className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>
            {stats.streakDays > 0 
              ? `${stats.streakDays} Day Practice Streak!` 
              : 'Take a deep breath. Focus on the now.'}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-8 pb-28">
        
        {/* Render Form Overlay */}
        {isCreatingCustom ? (
          <CustomPatternForm
            onSave={handleSaveCustomPattern}
            onClose={() => setIsCreatingCustom(false)}
          />
        ) : (
          <>
            {/* Render Tabs */}
            {activeTab === 'dashboard' && (
              <Dashboard
                history={history}
                stats={stats}
                onClearHistory={handleClearHistory}
                onSelectPreset={handleSelectPresetFromDashboard}
              />
            )}

            {activeTab === 'routines' && (
              <PresetSelector
                presets={defaultPatterns}
                customPresets={customPresets}
                isPremiumUser={settings.isPremium}
                onSelectPreset={handleSelectPreset}
                onDeleteCustomPattern={handleDeleteCustomPattern}
                onOpenCustomForm={() => setIsCreatingCustom(true)}
                onOpenPaywall={() => setIsPaywallOpen(true)}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsPanel
                settings={settings}
                isPremiumUser={settings.isPremium}
                onUpdateSettings={handleUpdateSettings}
                onOpenPaywall={() => setIsPaywallOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Bottom Navigation (Frosted glass) */}
      {!isCreatingCustom && (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-950/40 backdrop-blur-xl border border-white/10 px-3 py-2.5 rounded-2xl flex items-center space-x-2 shadow-2xl w-[320px] sm:w-[360px]">
          {([
            { id: 'dashboard', label: 'Journal', icon: <Activity className="w-5 h-5" /> },
            { id: 'routines', label: 'Practice', icon: <Wind className="w-5 h-5" /> },
            { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
          ] as const).map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                  isSelected
                    ? `${currentTheme.circleColor} text-white font-semibold border border-white/10 shadow-sm`
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <div className={`${isSelected ? currentTheme.primaryColor : 'text-current'}`}>
                  {tab.icon}
                </div>
                <span className="text-[10px] uppercase tracking-wider mt-1 font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Full-Screen Breathing Session Overlay */}
      {activePreset && (
        <BreathingSession
          pattern={activePreset}
          duration={settings.defaultDuration}
          theme={currentTheme}
          ambientSound={settings.ambientSound}
          cueSound={settings.cueSound}
          onClose={() => setActivePreset(null)}
          onSaveSession={handleSaveSession}
        />
      )}

      {/* Subscription Paywall Overlay */}
      {isPaywallOpen && (
        <Paywall
          onClose={() => setIsPaywallOpen(false)}
          onUpgradeSuccess={() => {
            handleUpdateSettings({ isPremium: true });
            setIsPaywallOpen(false);
            alert('🎉 Congratulations! Flowbreath Premium unlocked successfully.');
          }}
        />
      )}
      
    </div>
  );
}
