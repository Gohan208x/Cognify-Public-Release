
import React, { useMemo } from 'react';
import { StudySession } from '../types';
import {
  BarChart3,
  BrainCircuit,
  Clock,
  TrendingUp,
  Target,
  Zap,
  Lightbulb,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface StudyAnalyzerProps {
  sessions: StudySession[];
}

export const StudyAnalyzer: React.FC<StudyAnalyzerProps> = ({ sessions }) => {

  // --- ANALYTICS LOGIC ---
  const stats = useMemo(() => {
    if (sessions.length === 0) return null;

    const totalSeconds = sessions.reduce((acc, s) => acc + s.duration, 0);
    const totalHours = (totalSeconds / 3600).toFixed(1);

    // Subject Performance
    const subjectStats: Record<string, { totalScore: number; count: number; time: number }> = {};

    // Hourly Performance (0-23)
    const hourlyPerformance: Record<number, { totalScore: number; count: number }> = {};
    const hourlyActivity: Record<number, number> = {}; // Hour -> count of sessions

    sessions.forEach(s => {
      // Subject Aggregation - Skip FOCUS sessions (they don't represent subject mastery)
      if (s.activityType !== 'FOCUS') {
        const sub = s.subject || 'General';
        if (!subjectStats[sub]) subjectStats[sub] = { totalScore: 0, count: 0, time: 0 };
        subjectStats[sub].time += s.duration;

        if (s.score !== undefined) {
          subjectStats[sub].totalScore += s.score;
          subjectStats[sub].count += 1;

          // Hourly Aggregation (Only for scored activities)
          const date = new Date(s.timestamp);
          const hour = date.getHours();

          if (!hourlyPerformance[hour]) hourlyPerformance[hour] = { totalScore: 0, count: 0 };
          hourlyPerformance[hour].totalScore += s.score;
          hourlyPerformance[hour].count += 1;
        }
      }

      // Hourly Activity
      const h = new Date(s.timestamp).getHours();
      hourlyActivity[h] = (hourlyActivity[h] || 0) + 1;
    });

    // Calculate Averages
    const subjects = Object.keys(subjectStats).map(name => {
      const data = subjectStats[name];
      const avgScore = data.count > 0 ? Math.round(data.totalScore / data.count) : 0;
      return { name, avgScore, time: data.time, count: data.count };
    });

    const hourlyAvg = Object.keys(hourlyPerformance).map(h => {
      const hour = parseInt(h);
      const data = hourlyPerformance[hour];
      return { hour, avg: Math.round(data.totalScore / data.count) };
    });

    // Find Insights
    const bestSubject = [...subjects].sort((a, b) => b.avgScore - a.avgScore)[0];
    const weakSubject = [...subjects].filter(s => s.count > 0).sort((a, b) => a.avgScore - b.avgScore)[0];
    const bestHourData = [...hourlyAvg].sort((a, b) => b.avg - a.avg)[0];

    // Format "Best Time" string
    let bestTimeStr = "Not enough data";
    if (bestHourData) {
      const h = bestHourData.hour;
      const period = h >= 5 && h < 12 ? "Morning" : h >= 12 && h < 17 ? "Afternoon" : h >= 17 && h < 22 ? "Evening" : "Night";
      const suffix = h >= 12 ? "PM" : "AM";
      const displayH = h % 12 || 12;
      bestTimeStr = `${displayH} ${suffix} (${period})`;
    }

    // Chart Data (Last 7 Days) with detailed info for tooltips
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dateObj: d
      };
    });

    const activityPerDay = last7Days.map(dayInfo => {
      const daySessions = sessions.filter(s => {
        const sessionDate = new Date(s.timestamp);
        return sessionDate.toDateString() === dayInfo.dateObj.toDateString();
      });
      const count = daySessions.length;
      const totalDuration = daySessions.reduce((acc, s) => acc + s.duration, 0);
      const types = [...new Set(daySessions.map(s => s.activityType))];
      const subjects = [...new Set(daySessions.map(s => s.subject).filter(Boolean))];
      return {
        day: dayInfo.weekday,
        fullDate: dayInfo.fullDate,
        count,
        totalDuration,
        types,
        subjects
      };
    });
    const maxActivity = Math.max(...activityPerDay.map(d => d.count), 1);

    return {
      totalHours,
      totalSessions: sessions.length,
      subjects,
      bestSubject,
      weakSubject,
      bestTimeStr,
      hourlyAvg,
      activityPerDay,
      maxActivity,
      bestHourData
    };

  }, [sessions]);

  // --- RENDERING HELPERS ---

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center animate-fade-in">
        <div className="bg-slate-900 p-6 rounded-full mb-4 border border-slate-800">
          <BarChart3 size={48} className="text-slate-600" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Data Yet</h3>
        <p className="text-slate-400 max-w-sm">
          Complete quizzes, focus sessions, or flashcards to generate insights about your study habits.
        </p>
      </div>
    );
  }

  // Generate Advice String
  const getAdvice = () => {
    const tips = [];
    if (stats.bestHourData) {
      tips.push(`🧠 You perform best around **${stats.bestTimeStr}**. Schedule difficult topics then.`);
    }
    if (stats.weakSubject && stats.weakSubject.avgScore < 60) {
      tips.push(`📉 Your scores in **${stats.weakSubject.name}** are low (${stats.weakSubject.avgScore}%). Try creating more flashcards.`);
    } else if (stats.weakSubject) {
      tips.push(`🎯 Focus on **${stats.weakSubject.name}** next to balance your knowledge.`);
    }
    if (parseFloat(stats.totalHours) > 10) {
      tips.push(`🔥 You're on fire! ${stats.totalHours} hours logged.`);
    }
    return tips;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 h-full overflow-y-auto custom-scrollbar">

      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2"><Clock size={12} /> Study Time</div>
          <div className="text-2xl font-bold text-white">{stats.totalHours} <span className="text-sm text-slate-500 font-normal">hrs</span></div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2"><Target size={12} /> Sessions</div>
          <div className="text-2xl font-bold text-white">{stats.totalSessions}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2"><Zap size={12} /> Best Hour</div>
          <div className="text-lg font-bold text-yellow-400 truncate">{stats.bestTimeStr}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2"><BrainCircuit size={12} /> Top Subject</div>
          <div className="text-lg font-bold text-emerald-400 truncate">{stats.bestSubject?.name || "N/A"}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Chart: Activity */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="text-primary-500" size={20} /> Last 7 Days Activity
          </h3>

          {/* Simple bar chart */}
          <div className="space-y-2">
            {/* Chart bars area */}
            <div
              className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3"
              style={{ height: '160px' }}
            >
              {stats.activityPerDay.map((d, i) => {
                const hasActivity = d.count > 0;
                const barHeightPercent = hasActivity
                  ? Math.max(20, Math.round((d.count / stats.maxActivity) * 100))
                  : 8;
                const isToday = i === 6;

                return (
                  <div key={i} className="relative group">
                    {/* Bar column - full height, bar anchored to bottom */}
                    <div className="absolute inset-0 flex flex-col justify-end items-center">
                      {/* Count label */}
                      <div className={`text-sm font-bold mb-1 ${hasActivity ? 'text-white' : 'text-slate-600'}`}>
                        {d.count}
                      </div>
                      {/* The actual bar */}
                      <div
                        className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 ${isToday
                          ? 'bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400 shadow-lg shadow-blue-500/30'
                          : hasActivity
                            ? 'bg-gradient-to-t from-purple-600 via-purple-500 to-purple-400'
                            : 'bg-slate-700'
                          }`}
                        style={{ height: `${barHeightPercent}%` }}
                      />
                    </div>

                    {/* Hover Tooltip - positioned to avoid edge clipping */}
                    <div
                      className={`absolute -top-2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30 ${i === 0 ? 'left-0' : i === 6 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                        }`}
                    >
                      <div className="bg-slate-800 border border-slate-700 rounded-xl p-2 sm:p-3 shadow-2xl min-w-[120px] sm:min-w-[150px] text-left">
                        <div className="text-xs font-bold text-white mb-2">
                          {d.fullDate} {isToday && <span className="text-blue-400">(Today)</span>}
                        </div>
                        {hasActivity ? (
                          <>
                            <div className="text-xs text-slate-400 mb-1">
                              <span className="text-emerald-400 font-bold">{d.count}</span> session{d.count !== 1 ? 's' : ''}
                            </div>
                            <div className="text-xs text-slate-400 mb-1">
                              <span className="text-yellow-400 font-bold">{Math.round(d.totalDuration / 60)}</span> min studied
                            </div>
                            {d.types.length > 0 && (
                              <div className="text-xs text-slate-500">
                                {d.types.map(t => t === 'FOCUS' ? '🎯 Focus' : t === 'QUIZ' ? '📝 Quiz' : t === 'FLASHCARD' ? '🃏 Cards' : t === 'MEMORY' ? '🧠 Memory' : t).join(', ')}
                              </div>
                            )}
                            {d.subjects.length > 0 && (
                              <div className="text-xs text-purple-400 mt-1">
                                {d.subjects.slice(0, 2).join(', ')}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-xs text-slate-500 italic">No activity this day</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3">
              {stats.activityPerDay.map((d, i) => {
                const isToday = i === 6;
                return (
                  <div key={i} className="text-center">
                    <span className={`text-xs font-bold ${isToday ? 'text-blue-400' : 'text-slate-500'}`}>
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Lightbulb size={64} /></div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 relative z-10">
            <BrainCircuit className="text-purple-400" size={20} /> AI Insights
          </h3>
          <div className="space-y-4 relative z-10">
            {getAdvice().map((tip, idx) => (
              <div key={idx} className="flex gap-3 items-start bg-slate-950/30 p-3 rounded-xl border border-white/5">
                <div className="mt-1 min-w-[16px]"><Target size={16} className="text-indigo-400" /></div>
                <p className="text-sm text-indigo-100 leading-relaxed">
                  <span dangerouslySetInnerHTML={{ __html: tip.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-white">$1</span>') }} />
                </p>
              </div>
            ))}
            {getAdvice().length === 0 && <p className="text-slate-400 italic text-sm">Play more to generate tips!</p>}
          </div>
        </div>
      </div>

      {/* Subject Breakdown */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Target className="text-emerald-500" size={20} /> Subject Mastery
        </h3>
        <div className="space-y-6">
          {stats.subjects.map(sub => (
            <div key={sub.name}>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="font-bold text-white">{sub.name}</span>
                  <span className="text-xs text-slate-500 ml-2">({sub.count} sessions)</span>
                </div>
                <div className="text-sm font-bold">
                  <span className={sub.avgScore > 70 ? "text-emerald-400" : sub.avgScore > 40 ? "text-yellow-400" : "text-red-400"}>
                    {sub.avgScore}% Avg
                  </span>
                </div>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${sub.avgScore > 70 ? "bg-emerald-500" : sub.avgScore > 40 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                  style={{ width: `${sub.avgScore}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
