import React from 'react';
import { Calendar, Award, Clock, Activity, Trash2, Heart, CheckCircle } from 'lucide-react';
import { SessionHistory, BreathingStats } from '../types/breathing';

interface DashboardProps {
  history: SessionHistory[];
  stats: BreathingStats;
  onClearHistory: () => void;
  onSelectPreset: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  history,
  stats,
  onClearHistory,
  onSelectPreset
}) => {
  // Get last 7 days for the activity chart
  const getLast7Days = () => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      
      // Check if there was a session on this date
      const hadSession = history.some(h => h.date.startsWith(dateString));
      
      days.push({
        name: dayNames[d.getDay()],
        date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        active: hadSession,
        dateStr: dateString
      });
    }
    return days;
  };

  const recentDays = getLast7Days();

  // Format time for logs
  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto w-full px-2">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Streak Card */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 flex items-center space-x-5 shadow-lg shadow-black/10">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest block">Day Streak</span>
            <span className="text-3xl font-bold text-slate-100">{stats.streakDays}</span>
            <span className="text-xs font-medium text-amber-500 block mt-0.5">
              {stats.streakDays > 0 ? '🔥 Keep it going!' : 'Start your streak today'}
            </span>
          </div>
        </div>

        {/* Total Minutes Card */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 flex items-center space-x-5 shadow-lg shadow-black/10">
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest block">Total Minutes</span>
            <span className="text-3xl font-bold text-slate-100">
              {stats.totalMinutes >= 1 ? stats.totalMinutes.toFixed(1) : (stats.totalMinutes * 60).toFixed(0)}
            </span>
            <span className="text-xs font-medium text-slate-400 block mt-0.5">
              {stats.totalMinutes >= 1 ? 'Minutes practiced' : 'Seconds practiced'}
            </span>
          </div>
        </div>

        {/* Sessions Count Card */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 flex items-center space-x-5 shadow-lg shadow-black/10">
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest block">Sessions</span>
            <span className="text-3xl font-bold text-slate-100">{stats.sessionsCount}</span>
            <span className="text-xs font-medium text-slate-400 block mt-0.5">Completed routines</span>
          </div>
        </div>

      </div>

      {/* Activity Bar Chart (Last 7 Days) */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 mb-6 border-b border-slate-800/50 pb-3">
          <Calendar className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-medium text-slate-100">Weekly Consistency</h3>
        </div>
        
        <div className="flex justify-between items-end px-2 sm:px-6 h-28">
          {recentDays.map((day, i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              {/* Bar or Glow */}
              <div 
                className={`w-10 sm:w-14 rounded-xl transition-all duration-500 flex items-center justify-center ${
                  day.active 
                    ? 'h-20 bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-lg shadow-cyan-500/20 text-white' 
                    : 'h-8 bg-slate-800/50 text-slate-600 border border-slate-800/40'
                }`}
              >
                {day.active && <CheckCircle className="w-5 h-5 animate-pulse" />}
              </div>
              
              {/* Labels */}
              <span className={`text-xs font-medium mt-3 ${day.active ? 'text-cyan-400 font-semibold' : 'text-slate-500'}`}>
                {day.name}
              </span>
              <span className="text-[10px] text-slate-600 font-mono mt-0.5">
                {day.date.split(' ')[1]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* History Log Table & Empty State */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800/50 pb-3">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-rose-400" />
            <h3 className="text-lg font-medium text-slate-100">Recent Journals</h3>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => {
                if(window.confirm('Are you sure you want to delete all practice history?')) {
                  onClearHistory();
                }
              }}
              className="text-xs text-slate-500 hover:text-red-400 flex items-center space-x-1 border border-slate-800/80 hover:border-red-500/20 px-2.5 py-1.5 rounded-lg bg-slate-950/20 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-full text-slate-500">
              <Activity className="w-12 h-12 stroke-thin" />
            </div>
            <div className="max-w-xs space-y-1">
              <p className="text-slate-200 font-medium">Your journal is empty</p>
              <p className="text-slate-500 text-xs">
                Complete your first breathing session to start tracking your mindfulness journey.
              </p>
            </div>
            <button
              onClick={() => {
                // Trigger navigating to exercises tab in App
                onSelectPreset('box-breathing');
              }}
              className="mt-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50 px-4 py-2 rounded-xl transition-all"
            >
              Explore Breathing Exercises
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-slate-400 uppercase tracking-widest border-b border-slate-800/50 pb-2 font-mono">
                  <th className="py-2 pr-4 font-semibold">Exercise</th>
                  <th className="py-2 px-4 font-semibold">Date & Time</th>
                  <th className="py-2 px-4 font-semibold">Duration</th>
                  <th className="py-2 pl-4 font-semibold text-right">Stress Shift</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm">
                {history.slice(0, 8).map((log, index) => {
                  const stressChange = log.stressBefore && log.stressAfter ? log.stressBefore - log.stressAfter : 0;
                  return (
                    <tr key={log.id || index} className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-3.5 pr-4">
                        <span className="font-medium text-slate-200 block">{log.patternName}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">
                        {formatDateTime(log.date)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {log.durationSeconds >= 60 
                          ? `${Math.floor(log.durationSeconds / 60)}m ${log.durationSeconds % 60 > 0 ? `${log.durationSeconds % 60}s` : ''}`
                          : `${log.durationSeconds}s`
                        }
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        {log.stressBefore && log.stressAfter ? (
                          <div className="flex items-center justify-end space-x-2">
                            <span className="text-xs text-slate-500 font-mono">
                              {log.stressBefore} → {log.stressAfter}
                            </span>
                            {stressChange > 0 ? (
                              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold font-mono px-2 py-0.5 rounded-full">
                                -{stressChange}
                              </span>
                            ) : stressChange === 0 ? (
                              <span className="bg-slate-800 text-slate-400 text-xs font-semibold font-mono px-2 py-0.5 rounded-full">
                                =
                              </span>
                            ) : (
                              <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold font-mono px-2 py-0.5 rounded-full">
                                +{Math.abs(stressChange)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs font-mono">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {history.length > 8 && (
              <div className="text-center pt-4 text-xs text-slate-500 italic">
                Showing the 8 most recent entries of {history.length} total.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
