import { BreathingPattern } from '../types/breathing';

export const defaultPatterns: BreathingPattern[] = [
  {
    id: 'box-breathing',
    name: 'Box Breathing (4-4-4-4)',
    description: 'Used by elite performers and Navy SEALs to reset focus, manage high-stress situations, and center the mind.',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    category: 'focus'
  },
  {
    id: '4-7-8-relax',
    name: 'Deep Relaxation (4-7-8)',
    description: 'A powerful tranquilizer for the nervous system. Excellent for winding down, beating insomnia, and releasing tension.',
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
    category: 'calm',
    requiresPremium: true
  },
  {
    id: 'resonant-hrv',
    name: 'Coherent Breathing (5-5)',
    description: 'Perfectly balances your heart and mind. Maximizes Heart Rate Variability (HRV), promoting long-term cardiovascular health.',
    inhale: 5,
    holdIn: 0,
    exhale: 5,
    holdOut: 0,
    category: 'balanced'
  },
  {
    id: 'energizer',
    name: 'Awakening Breath (6-0-2-0)',
    description: 'A quick pick-me-up to replace caffeine. Extended inhalations activate the sympathetic nervous system for instant alertness.',
    inhale: 6,
    holdIn: 0,
    exhale: 2,
    holdOut: 0,
    category: 'energize',
    requiresPremium: true
  },
  {
    id: 'gentle-unwind',
    name: 'Gentle Calm (4-2-6-2)',
    description: 'A standard restorative pattern. Extending the exhalation triggers the vagus nerve to slow down the heart rate.',
    inhale: 4,
    holdIn: 2,
    exhale: 6,
    holdOut: 2,
    category: 'calm'
  },
  {
    id: 'equal-breath',
    name: 'Sama Vritti (6-6-0-0)',
    description: 'Equal ratio breathing draws focus away from racing thoughts, bringing emotional balance and mental steadiness.',
    inhale: 6,
    holdIn: 6,
    exhale: 0,
    holdOut: 0,
    category: 'balanced'
  }
];
