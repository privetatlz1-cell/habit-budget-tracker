import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { isScheduledDay } from "../../utils/habitProgress";
import { API_BASE } from "../../utils/constants";
import SleepInput from "./SleepInput";

// Weekly calendar with navigation, completion visualization, and editing
export default function CalendarView({
  completions = [],
  weekOffset = 0,
  onWeekChange,
  allHabits = [],
  habitId,
  onToggleDay,
}) {
  const { daysShort, t } = useLanguage();
  const [currentWeekOffset, setCurrentWeekOffset] = useState(weekOffset);
  const [sleepData, setSleepData] = useState({});
  const [editingSleepDate, setEditingSleepDate] = useState(null);

  // Get the habit being displayed (if showing single habit)
  const currentHabit = useMemo(() => {
    if (habitId && allHabits.length > 0) {
      return allHabits.find(h => h.id === habitId);
    }
    return null;
  }, [habitId, allHabits]);

  const week = useMemo(() => {
    const today = new Date();
    const day = (today.getDay() + 6) % 7; // 0 = Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() - day + (currentWeekOffset * 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  }, [currentWeekOffset]);

  // Load sleep data for the current week
  useEffect(() => {
    const loadData = async () => {
      try {
        const weekStart = week[0];
        const weekEnd = week[6];
        
        const sleepRes = await fetch(`${API_BASE}/api/sleep?from=${weekStart}&to=${weekEnd}`);
        
        if (sleepRes.ok) {
          const sleepEntries = await sleepRes.json();
          const sleepMap = {};
          sleepEntries.forEach(entry => {
            sleepMap[entry.date] = entry.hours;
          });
          setSleepData(sleepMap);
        }
      } catch (error) {
        console.error('Failed to load sleep data:', error);
      }
    };

    loadData();
  }, [week]);

  useEffect(() => {
    setCurrentWeekOffset(weekOffset);
  }, [weekOffset]);

  const todayIso = new Date().toISOString().slice(0, 10);

  // Group completions by date, tracking aggregate and per-habit status
  const completionsByDate = useMemo(() => {
    const map = new Map();
    
    // Initialize all days in the week
    week.forEach(iso => {
      map.set(iso, {
        completedNames: [],
        completedIds: new Set(),
        total: allHabits.length,
        completedCount: 0,
      });
    });
    
    // Process completions - group by date and count unique completed habits
    completions.forEach(c => {
      const date = c.date || c.HabitCompletion?.date;
      if (!date) return;
      if (!map.has(date)) return;

      const habit = c.Habit || c.habit;
      if (!habit) return;

      const isCompleted = c.completed === true || c.HabitCompletion?.completed === true;
      if (!isCompleted) return;

      const dayData = map.get(date);
      if (!dayData.completedIds.has(habit.id)) {
        dayData.completedIds.add(habit.id);
        dayData.completedCount = dayData.completedIds.size;
      }
      if (!dayData.completedNames.includes(habit.name)) {
        dayData.completedNames.push(habit.name);
      }
    });
    
    return map;
  }, [completions, allHabits, week]);

  const getDayStatus = (iso) => {
    const data = completionsByDate.get(iso);
    if (!data || data.completedCount === 0) return 'none'; // Gray
    // If showing single habit, just check if done
    if (allHabits.length === 1) {
      return data.completedCount > 0 ? 'all' : 'none';
    }
    // If showing multiple habits, show aggregate status
    if (data.completedCount === data.total && data.total > 0) return 'all'; // Green - all done
    return 'some'; // Yellow - some done
  };

  const handlePrevWeek = () => {
    const newOffset = currentWeekOffset - 1;
    setCurrentWeekOffset(newOffset);
    if (onWeekChange) onWeekChange(newOffset);
  };

  const handleNextWeek = () => {
    const newOffset = currentWeekOffset + 1;
    setCurrentWeekOffset(newOffset);
    if (onWeekChange) onWeekChange(newOffset);
  };

  const handleToday = () => {
    setCurrentWeekOffset(0);
    if (onWeekChange) onWeekChange(0);
  };

  const weekStart = week[0];
  const weekEnd = week[6];
  const isCurrentWeek = currentWeekOffset === 0;


  const handleSleepClick = (iso) => {
    setEditingSleepDate(iso);
  };

  const handleSleepSave = (savedEntry) => {
    setSleepData(prev => ({
      ...prev,
      [savedEntry.date]: savedEntry.hours
    }));
    setEditingSleepDate(null);
  };


  return (
    <div>
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevWeek}
          className="icon-btn"
          aria-label={t('previousWeek')}
          title={t('previousWeek')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
            {new Date(weekStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(weekEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
          {!isCurrentWeek && (
            <button
              onClick={handleToday}
              className="text-xs px-2 py-1 rounded-full bg-[#BFDBFE]/60 hover:bg-[#BFDBFE] text-gray-700 dark:text-slate-300 transition-colors"
            >
              {t('today')}
            </button>
          )}
        </div>
        <button
          onClick={handleNextWeek}
          className="icon-btn"
          aria-label={t('nextWeek')}
          title={t('nextWeek')}
          disabled={isCurrentWeek}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {week.map((iso, idx) => {
          const status = getDayStatus(iso);
          const label = daysShort[idx];
          const isToday = iso === todayIso;
          const dayData = completionsByDate.get(iso);
          const completedHabits = dayData ? dayData.completedNames : [];
          const habitCompleted = habitId ? dayData?.completedIds?.has(habitId) : (status === 'all');
          
          // Check if this day is scheduled for the current habit
          const isScheduled = currentHabit ? isScheduledDay(currentHabit, iso) : true;
          const isPastOrToday = new Date(iso) <= new Date();

          const handleDayClick = () => {
            if (!onToggleDay || !habitId) return;
            if (!isPastOrToday) return;
            if (!isScheduled && currentHabit && currentHabit.frequency !== 'daily') {
              // Show message that this day is not scheduled
              return;
            }
            const nextState = !habitCompleted;
            onToggleDay(habitId, iso, nextState);
          };
          
          const sleepHours = sleepData[iso];
          const isInsufficientSleep = sleepHours !== undefined && sleepHours < 7;

          return (
            <div key={iso} className="flex flex-col items-center gap-2">
              <div className={`text-xs font-medium ${isToday ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-500 dark:text-neutral-light'}`}>
                {label}
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                    onToggleDay && habitId && isPastOrToday && (isScheduled || !currentHabit || currentHabit.frequency === 'daily') ? 'cursor-pointer' : ''
                  } ${
                    status === 'all'
                      ? 'bg-green-500 dark:bg-green-400 shadow-sm'
                      : status === 'some'
                      ? 'bg-yellow-400 dark:bg-yellow-500 shadow-sm'
                      : isToday
                      ? 'bg-[#BFDBFE]/60 dark:bg-blue-900/40 border-2 border-[#BFDBFE] dark:border-blue-400'
                      : !isScheduled && currentHabit && currentHabit.frequency !== 'daily'
                      ? 'bg-gray-100 dark:bg-slate-800 opacity-40 border border-dashed border-gray-300 dark:border-slate-600'
                      : 'bg-gray-200 dark:bg-slate-700'
                  }`}
                  title={
                    !isScheduled && currentHabit && currentHabit.frequency !== 'daily'
                      ? `${t('scheduledDay')}: No - ${new Date(iso).toLocaleDateString()}`
                      : dayData
                      ? `${completedHabits.length}/${dayData.total} ${t('completed')}${completedHabits.length > 0 ? ': ' + completedHabits.join(', ') : ''}`
                      : `${t('noCompletions')} - ${new Date(iso).toLocaleDateString()}`
                  }
                  onClick={handleDayClick}
                >
                  {status === 'all' && (
                    <svg className="w-4 h-4 text-white dark:text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {!habitCompleted && status !== 'all' && (
                    <svg className="w-4 h-4 text-white dark:text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                  )}
                  {habitCompleted && (
                    <svg className="w-4 h-4 text-white dark:text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                {/* Sleep indicator */}
                {sleepHours !== undefined ? (
                  <div
                    onClick={() => handleSleepClick(iso)}
                    className={`w-full px-1.5 py-0.5 text-[10px] rounded cursor-pointer transition-colors flex items-center justify-center gap-1 ${
                      isInsufficientSleep
                        ? 'bg-semantic-pink/20 dark:bg-semantic-pink/20 text-semantic-pink border border-semantic-pink/30'
                        : 'bg-primary-purple/20 dark:bg-primary-purple/20 text-primary-purple border border-primary-purple/30'
                    }`}
                    title={`${sleepHours}h ${t('sleep') || 'sleep'}`}
                  >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <span>{sleepHours}h</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSleepClick(iso)}
                    className="w-full px-1.5 py-0.5 text-[10px] text-gray-400 dark:text-neutral-light hover:text-primary-purple transition-colors"
                    title={t('addSleep') || 'Add sleep'}
                  >
                    <svg className="w-3 h-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-400 dark:text-neutral-light">
                {new Date(iso).getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sleep Input Modal */}
      {editingSleepDate && (
        <SleepInput
          date={editingSleepDate}
          initialHours={sleepData[editingSleepDate]}
          onSave={handleSleepSave}
          onClose={() => setEditingSleepDate(null)}
        />
      )}
    </div>
  );
}
