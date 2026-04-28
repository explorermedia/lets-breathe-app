import React, { useState } from 'react';
import { Wind, Trash2, PlusCircle, Smile, Zap, Eye, Sliders, ChevronRight, Lock } from 'lucide-react';
import { BreathingPattern } from '../types/breathing';

interface PresetSelectorProps {
  presets: BreathingPattern[];
  customPresets: BreathingPattern[];
  isPremiumUser: boolean;
  onSelectPreset: (pattern: BreathingPattern) => void;
  onDeleteCustomPattern: (id: string) => void;
  onOpenCustomForm: () => void;
  onOpenPaywall: () => void;
}

type FilterCategory = 'all' | 'calm' | 'focus' | 'energize' | 'balanced' | 'custom';

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  presets,
  customPresets,
  isPremiumUser,
  onSelectPreset,
  onDeleteCustomPattern,
  onOpenCustomForm,
  onOpenPaywall
}) => {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');

  const allAvailable = [...presets, ...customPresets];

  const filteredPresets = allAvailable.filter(p => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'custom') return p.isCustom;
    return p.category === activeCategory && !p.isCustom;
  });

  // Get appropriate icon for category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'calm': return <Smile className="w-4 h-4 text-emerald-400" />;
      case 'energize': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'focus': return <Eye className="w-4 h-4 text-cyan-400" />;
      case 'balanced': return <Wind className="w-4 h-4 text-purple-400" />;
      case 'custom': return <Sliders className="w-4 h-4 text-rose-400" />;
      default: return <Wind className="w-4 h-4 text-slate-400" />;
    }
  };

  // Get category label background color
  const getCategoryBg = (category: string) => {
    switch (category) {
      case 'calm': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'energize': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'focus': return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
      case 'balanced': return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
      case 'custom': return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      default: return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
    }
  };

  const categories: { id: FilterCategory; label: string }[] = [
    { id: 'all', label: 'All Routines' },
    { id: 'calm', label: 'Calm' },
    { id: 'focus', label: 'Focus' },
    { id: 'energize', label: 'Energize' },
    { id: 'balanced', label: 'Balanced' },
    { id: 'custom', label: 'Custom' }
  ];

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-4xl mx-auto px-2">
      {/* Categories Filter Bar */}
      <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-medium uppercase tracking-wider border transition-all ${
              activeCategory === cat.id
                ? 'bg-slate-100 text-slate-950 border-white shadow-md font-bold'
                : 'bg-slate-900/40 text-slate-400 border-slate-800/60 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* "Create Custom" Call-to-action Card */}
        {activeCategory === 'all' || activeCategory === 'custom' ? (
          <div
            onClick={() => {
              if (isPremiumUser) {
                onOpenCustomForm();
              } else {
                onOpenPaywall();
              }
            }}
            className="group cursor-pointer border border-dashed border-slate-700/60 hover:border-cyan-500/50 bg-slate-900/10 hover:bg-cyan-500/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[160px] space-y-3 relative overflow-hidden"
          >
            {!isPremiumUser && (
              <div className="absolute top-3 right-3 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 p-1.5 rounded-lg flex items-center shadow-md">
                <Lock className="w-3 h-3" />
              </div>
            )}
            <PlusCircle className="w-10 h-10 text-slate-500 group-hover:text-cyan-400 transition-colors duration-300" />
            <div>
              <h3 className="text-sm font-medium text-slate-200 group-hover:text-cyan-300 flex items-center justify-center space-x-1">
                <span>Create Custom Rhythm</span>
              </h3>
              <p className="text-slate-500 text-xs mt-1 max-w-[200px]">
                Define your own inhale, hold, and exhale ratios. {!isPremiumUser && <span className="text-cyan-400/80 font-medium">(Premium)</span>}
              </p>
            </div>
          </div>
        ) : null}

        {filteredPresets.map((preset) => {
          const isLocked = preset.requiresPremium && !isPremiumUser;
          return (
          <div
            key={preset.id}
            className="group relative bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-5 hover:border-slate-700/80 hover:bg-slate-900/60 hover:shadow-xl hover:shadow-black/10 flex flex-col justify-between transition-all duration-300 animate-slide-up overflow-hidden"
          >
            {/* Custom Pattern Delete Action */}
            {preset.isCustom && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete custom routine "${preset.name}"?`)) {
                    onDeleteCustomPattern(preset.id);
                  }
                }}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                title="Delete routine"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {isLocked && (
              <div className="absolute top-4 right-4 p-1.5 text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 rounded-lg shadow-md z-10 flex items-center">
                <Lock className="w-3.5 h-3.5" />
              </div>
            )}

            <div 
              onClick={() => {
                if (isLocked) {
                  onOpenPaywall();
                } else {
                  onSelectPreset(preset);
                }
              }} 
              className="cursor-pointer space-y-3 flex-1"
            >
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getCategoryBg(preset.isCustom ? 'custom' : preset.category)}`}>
                  {getCategoryIcon(preset.isCustom ? 'custom' : preset.category)}
                  <span>{preset.isCustom ? 'Custom' : preset.category}</span>
                </span>
                
                <span className="text-xs text-slate-500 font-mono">
                  {preset.inhale}-{preset.holdIn}-{preset.exhale}-{preset.holdOut}
                </span>

                {preset.requiresPremium && (
                  <span className="text-[9px] font-bold uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-1.5 py-0.5 rounded-md">
                    Premium
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-100 group-hover:text-white transition-colors flex items-center">
                  <span>{preset.name}</span>
                </h3>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  {preset.description}
                </p>
              </div>
            </div>

            <div 
              onClick={() => {
                if (isLocked) {
                  onOpenPaywall();
                } else {
                  onSelectPreset(preset);
                }
              }} 
              className="cursor-pointer border-t border-slate-800/40 mt-4 pt-3 flex items-center justify-between"
            >
              {/* Timing breakdown tags */}
              <div className="flex space-x-3 text-xs font-mono text-slate-400">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">In</span>
                  <span className="text-slate-300 font-semibold">{preset.inhale}s</span>
                </div>
                {preset.holdIn > 0 && (
                  <div className="flex flex-col border-l border-slate-800/80 pl-3">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">Hold</span>
                    <span className="text-slate-300 font-semibold">{preset.holdIn}s</span>
                  </div>
                )}
                <div className="flex flex-col border-l border-slate-800/80 pl-3">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">Out</span>
                  <span className="text-slate-300 font-semibold">{preset.exhale}s</span>
                </div>
                {preset.holdOut > 0 && (
                  <div className="flex flex-col border-l border-slate-800/80 pl-3">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">Hold</span>
                    <span className="text-slate-300 font-semibold">{preset.holdOut}s</span>
                  </div>
                )}
              </div>

              {/* Quick Play Arrow */}
              <div className="rounded-xl p-2 bg-slate-800/30 group-hover:bg-cyan-500/10 text-slate-400 group-hover:text-cyan-400 border border-slate-700/30 group-hover:border-cyan-500/30 transition-all duration-300">
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};
