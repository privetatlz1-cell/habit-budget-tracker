import React, { useMemo } from "react";
import CalendarView from "./CalendarView";
import ProgressCircle from "./ProgressCircle";
import { useLanguage } from "../../contexts/LanguageContext";
import { calculateHabitProgress, formatFrequency, isScheduledDay } from "../../utils/habitProgress";

/**
 * HabitCard Component
 * Displays a single habit with progress, calendar view, and actions
 * @param {Object} habit - Habit object
 * @param {boolean} doneToday - Whether habit is completed today
 * @param {Function} onToggleDay - Handler for toggling completion on a date
 * @param {Function} onDelete - Handler for deleting habit
 * @param {number} weekOffset - Week offset for calendar view
 * @param {Function} onWeekChange - Handler for week navigation
 * @param {Array} weekCompletions - Array of completion records for the week
 * @param {Array} allHabits - All habits (for context)
 */
const HabitCard = React.memo(function HabitCard({ habit, doneToday, onToggleDay, onDelete, weekOffset = 0, onWeekChange, weekCompletions = [], allHabits = [] }) {
  const { t } = useLanguage();
  const todayIso = new Date().toISOString().slice(0, 10);

  // Calculate progress for this habit based on frequency
  const habitProgress = useMemo(() => {
    return calculateHabitProgress(habit, weekCompletions, 'week');
  }, [habit, weekCompletions]);

  // Check if today is a scheduled day
  const todayIsScheduled = useMemo(() => {
    return isScheduledDay(habit, todayIso);
  }, [habit, todayIso]);

  return (
    <div className="card p-5 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-4">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-1">{habit.name}</h3>
          {habit.description && (
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">{habit.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="category-tag">
              {habit.category || 'General'}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-[#BFDBFE]/30 dark:bg-blue-900/30 text-gray-600 dark:text-slate-400 border border-[#BFDBFE]/50 dark:border-blue-700">
              {formatFrequency(habit)}
            </span>
          </div>
          {/* Progress Circle */}
          <div className="flex items-center gap-3 mt-3">
            <ProgressCircle percent={habitProgress} size={60} />
            <div className="text-sm">
              <div className="text-gray-500 dark:text-slate-400">{t('thisWeekProgress') || 'This week'}</div>
              <div className="font-semibold text-gray-800 dark:text-white">{Math.round(habitProgress)}%</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!todayIsScheduled && habit.frequency !== 'daily') {
                // Show message that today is not scheduled
                alert(t('todayNotScheduled') || `Today is not a scheduled day for this habit. Scheduled: ${formatFrequency(habit)}`);
                return;
              }
              onToggleDay(habit.id, todayIso, !doneToday);
            }}
            className={`icon-btn ${doneToday ? 'bg-green-50 hover:bg-green-100 border-green-200 dark:bg-green-900/20 dark:border-green-800' : !todayIsScheduled && habit.frequency !== 'daily' ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={t('toggleCompletion')}
            title={doneToday ? t('completed') : !todayIsScheduled && habit.frequency !== 'daily' ? (t('todayNotScheduled') || 'Today is not scheduled') : t('toggleCompletion')}
            disabled={!todayIsScheduled && habit.frequency !== 'daily'}
          >
            {doneToday ? (
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
          <button
            onClick={() => onDelete(habit.id)}
            className="icon-btn hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
            aria-label={t('delete')}
            title={t('delete')}
          >
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
        <CalendarView 
          completions={weekCompletions} 
          weekOffset={weekOffset}
          onWeekChange={onWeekChange}
          allHabits={allHabits}
          habitId={habit.id}
          onToggleDay={onToggleDay}
        />
      </div>
    </div>
  );
});

export default HabitCard;

