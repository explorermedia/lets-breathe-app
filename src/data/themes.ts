export interface AppTheme {
  id: string;
  name: string;
  bgClass: string;
  primaryColor: string;
  circleColor: string;
  circleBorder: string;
  textColor: string;
  accentGlow: string;
  particleColor: string;
  requiresPremium?: boolean;
}

export const appThemes: AppTheme[] = [
  {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    bgClass: 'bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950 text-slate-100',
    primaryColor: 'text-cyan-400',
    circleColor: 'bg-cyan-500/20',
    circleBorder: 'border-cyan-400/80',
    textColor: 'text-cyan-100',
    accentGlow: 'shadow-[0_0_50px_rgba(34,211,238,0.3)]',
    particleColor: '#22d3ee'
  },
  {
    id: 'forest-mist',
    name: 'Forest Mist',
    bgClass: 'bg-gradient-to-br from-stone-900 via-emerald-950 to-teal-950 text-slate-100',
    primaryColor: 'text-emerald-400',
    circleColor: 'bg-emerald-500/20',
    circleBorder: 'border-emerald-400/80',
    textColor: 'text-emerald-100',
    accentGlow: 'shadow-[0_0_50px_rgba(52,211,153,0.3)]',
    particleColor: '#34d399'
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    bgClass: 'bg-gradient-to-br from-slate-950 via-rose-950 to-amber-950 text-slate-100',
    primaryColor: 'text-rose-400',
    circleColor: 'bg-rose-500/20',
    circleBorder: 'border-rose-400/80',
    textColor: 'text-rose-100',
    accentGlow: 'shadow-[0_0_50px_rgba(251,113,133,0.3)]',
    particleColor: '#fb7185',
    requiresPremium: true
  },
  {
    id: 'aurora-borealis',
    name: 'Aurora',
    bgClass: 'bg-gradient-to-br from-slate-900 via-purple-950 to-emerald-950 text-slate-100',
    primaryColor: 'text-purple-400',
    circleColor: 'bg-purple-500/20',
    circleBorder: 'border-purple-400/80',
    textColor: 'text-purple-100',
    accentGlow: 'shadow-[0_0_50px_rgba(192,132,252,0.3)]',
    particleColor: '#c084fc',
    requiresPremium: true
  },
  {
    id: 'midnight-calm',
    name: 'Midnight Calm',
    bgClass: 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100',
    primaryColor: 'text-indigo-400',
    circleColor: 'bg-indigo-500/20',
    circleBorder: 'border-indigo-400/80',
    textColor: 'text-indigo-100',
    accentGlow: 'shadow-[0_0_50px_rgba(129,140,248,0.2)]',
    particleColor: '#818cf8'
  },
  {
    id: 'zen-minimal',
    name: 'Zen Minimal',
    bgClass: 'bg-neutral-900 text-neutral-100',
    primaryColor: 'text-neutral-400',
    circleColor: 'bg-neutral-500/10',
    circleBorder: 'border-neutral-500/50',
    textColor: 'text-neutral-200',
    accentGlow: 'shadow-[0_0_30px_rgba(255,255,255,0.05)]',
    particleColor: '#ffffff'
  }
];
export const defaultTheme = appThemes[0];
