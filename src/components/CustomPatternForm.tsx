import React, { useState } from 'react';
import { Save, ArrowLeft, Sliders, AlertCircle, Sparkles } from 'lucide-react';
import { BreathingPattern } from '../types/breathing';

interface CustomPatternFormProps {
  onSave: (pattern: BreathingPattern) => void;
  onClose: () => void;
}

export const CustomPatternForm: React.FC<CustomPatternFormProps> = ({ onSave, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [inhale, setInhale] = useState(4);
  const [holdIn, setHoldIn] = useState(4);
  const [exhale, setExhale] = useState(4);
  const [holdOut, setHoldOut] = useState(4);
  const [category, setCategory] = useState<'calm' | 'energize' | 'focus' | 'balanced'>('balanced');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      setError('A routine name is required.');
      return;
    }
    
    if (name.length > 25) {
      setError('Routine name must be 25 characters or less.');
      return;
    }

    if (inhale === 0 && exhale === 0) {
      setError('Inhale and Exhale cannot both be 0 seconds.');
      return;
    }

    const newPattern: BreathingPattern = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || `Custom ${inhale}-${holdIn}-${exhale}-${holdOut} rhythm.`,
      inhale,
      holdIn,
      exhale,
      holdOut,
      category,
      isCustom: true
    };

    onSave(newPattern);
  };

  const totalCycleTime = inhale + holdIn + exhale + holdOut;

  return (
    <div className="max-w-xl mx-auto w-full bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 p-6 md:p-8 rounded-3xl shadow-2xl animate-fade-in px-4">
      
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6 border-b border-slate-800/50 pb-4">
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-100 bg-slate-800/30 hover:bg-slate-800/60 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-medium text-slate-100 flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <span>Create Custom Routine</span>
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">Define your own breathing intervals in seconds.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 flex items-start space-x-2 text-red-400 text-sm mb-6 animate-shake">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Name Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Routine Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Afternoon Focus, Sleep Aid"
            className="w-full bg-slate-950/50 hover:bg-slate-950/80 focus:bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all text-sm"
          />
        </div>

        {/* Description Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is the purpose of this routine?"
            rows={2}
            className="w-full bg-slate-950/50 hover:bg-slate-950/80 focus:bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all text-sm resize-none"
          />
        </div>

        {/* Category Radio Grid */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Intent / Category</label>
          <div className="grid grid-cols-2 gap-3">
            {(['calm', 'focus', 'energize', 'balanced'] as const).map((cat) => (
              <label
                key={cat}
                className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer text-sm font-medium capitalize tracking-wide transition-all ${
                  category === cat
                    ? 'bg-slate-100 text-slate-950 border-white font-semibold'
                    : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:bg-slate-900/30'
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat}
                  checked={category === cat}
                  onChange={() => setCategory(cat)}
                  className="sr-only"
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Timing Sliders */}
        <div className="bg-slate-950/30 border border-slate-800/40 rounded-2xl p-5 space-y-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-800/40 pb-2 flex items-center space-x-1">
            <span>Rhythm Intervals</span>
            <span className="text-[10px] text-slate-500 lowercase font-normal italic">(in seconds)</span>
          </h3>

          {/* Inhale */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300 font-medium">1. Inhale</span>
              <span className="font-mono text-cyan-400 font-bold bg-cyan-400/10 px-2.5 py-0.5 rounded-md border border-cyan-500/20">{inhale}s</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              value={inhale}
              onChange={(e) => setInhale(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Hold After Inhale */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300 font-medium">2. Hold breath</span>
              <span className="font-mono text-purple-400 font-bold bg-purple-400/10 px-2.5 py-0.5 rounded-md border border-purple-500/20">{holdIn}s</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={holdIn}
              onChange={(e) => setHoldIn(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>

          {/* Exhale */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300 font-medium">3. Exhale</span>
              <span className="font-mono text-emerald-400 font-bold bg-emerald-400/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">{exhale}s</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              value={exhale}
              onChange={(e) => setExhale(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Hold After Exhale */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300 font-medium">4. Hold empty</span>
              <span className="font-mono text-rose-400 font-bold bg-rose-400/10 px-2.5 py-0.5 rounded-md border border-rose-500/20">{holdOut}s</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={holdOut}
              onChange={(e) => setHoldOut(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
            />
          </div>
        </div>

        {/* Dynamic Preview Footer */}
        <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-400">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div className="flex flex-col">
              <span className="text-xs uppercase font-mono text-slate-500 tracking-wider">Cycle Duration</span>
              <span className="text-base text-slate-200 font-bold font-mono">{totalCycleTime} seconds</span>
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/10 flex items-center space-x-2 transition-all hover:translate-y-[-1px] active:translate-y-0"
          >
            <Save className="w-4 h-4" />
            <span>Save Routine</span>
          </button>
        </div>

      </form>
    </div>
  );
};
