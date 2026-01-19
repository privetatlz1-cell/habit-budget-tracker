import React, { useEffect, useMemo, useState } from "react";
import ProgressCircle from "./ProgressCircle";
import HabitCard from "./HabitCard";
import AddHabitForm from "./AddHabitForm";
import ProgressChart from "./ProgressChart";
import SleepChart from "./SleepChart";
import { useLanguage } from "../../contexts/LanguageContext";
import { useToast } from "../Shared/Toast";
import { isScheduledDay } from "../../utils/habitProgress";
import { API_BASE } from "../../utils/constants";

export default function HabitList({ onChanged = () => {} }) {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekCompletions, setWeekCompletions] = useState([]);
  const [historyCompletions, setHistoryCompletions] = useState([]);
  const { t } = useLanguage();
  const { showToast } = useToast();

  const todayIso = new Date().toISOString().slice(0,10);

  // Calculate week date range
  const weekRange = useMemo(() => {
    const today = new Date();
    const day = (today.getDay() + 6) % 7; // 0 = Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() - day + (weekOffset * 7));
    const from = new Date(monday);
    const to = new Date(monday);
    to.setDate(monday.getDate() + 6);
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10)
    };
  }, [weekOffset]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API_BASE}/api/habits`);
      const data = await r.json();
      setHabits(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Failed to load habits");
    } finally {
      setLoading(false);
    }
  };

  const loadWeekCompletions = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/habits/completions?from=${weekRange.from}&to=${weekRange.to}`);
      if (!res.ok) throw new Error('Failed to load completions');
      const data = await res.json();
      setWeekCompletions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load week completions:', e);
      setWeekCompletions([]);
    }
  };

  const loadHistoryCompletions = async () => {
    try {
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);
      const from = fromDate.toISOString().slice(0, 10);
      const to = toDate.toISOString().slice(0, 10);
      const res = await fetch(`${API_BASE}/api/habits/completions?from=${from}&to=${to}`);
      if (!res.ok) throw new Error('Failed to load history completions');
      const data = await res.json();
      setHistoryCompletions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load history completions:', e);
      setHistoryCompletions([]);
    }
  };

  useEffect(() => { 
    load(); 
    loadHistoryCompletions();
  }, []);

  useEffect(() => {
    loadWeekCompletions();
  }, [weekRange.from, weekRange.to]);

  const handleAdd = async (data) => {
    try {
      const res = await fetch(`${API_BASE}/api/habits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error || t('errorAdd');
        showToast(errorMessage, 'error');
        return;
      }
      
      await load();
      await loadWeekCompletions();
      await loadHistoryCompletions();
      if (onChanged) onChanged();
      showToast(t('successAdd'), 'success');
    } catch (e) {
      console.error('Error adding habit:', e);
      showToast(t('errorAdd'), 'error');
    }
  };

  const handleToggleDay = async (habitId, date, shouldComplete) => {
    try {
      if (shouldComplete) {
        const res = await fetch(`${API_BASE}/api/habits/${habitId}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, completed: true })
        });
        if (!res.ok) throw new Error('Failed');
      } else {
        const res = await fetch(`${API_BASE}/api/habits/${habitId}/completions/${date}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: false })
        });
        if (!res.ok) throw new Error('Failed');
      }

      await load();
      await loadWeekCompletions();
      await loadHistoryCompletions();
      if (onChanged) onChanged();
    } catch (e) {
      console.error(e);
      showToast(t('errorAdd'), 'error');
    }
  };

  const handleDelete = async (habitId) => {
    if (!window.confirm(t('delete') + '?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/habits/${habitId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      await load();
      await loadWeekCompletions();
      if (onChanged) onChanged();
      showToast(t('successDelete'), 'success');
    } catch (e) {
      showToast(t('errorDelete'), 'error');
    }
  };

  const completedTodayCount = useMemo(() => {
    return habits.reduce((acc, h) => {
      const list = h.HabitCompletions || h.completions || [];
      const done = list.some(c => c.date === todayIso && c.completed);
      // For frequency-based habits, only count if today is scheduled
      if (h.frequency !== 'daily') {
        if (!isScheduledDay(h, todayIso)) {
          return acc; // Don't count unscheduled days
        }
      }
      return acc + (done ? 1 : 0);
    }, 0);
  }, [habits, todayIso]);

  // Calculate expected completions today based on frequency
  const expectedTodayCount = useMemo(() => {
    return habits.reduce((acc, h) => {
      if (h.frequency === 'daily') {
        return acc + 1; // Daily habits always expected
      }
      return acc + (isScheduledDay(h, todayIso) ? 1 : 0);
    }, 0);
  }, [habits, todayIso]);

  const percentToday = useMemo(() => {
    if (!expectedTodayCount) return 0;
    return (completedTodayCount / expectedTodayCount) * 100;
  }, [completedTodayCount, expectedTodayCount]);

  // Aggregated history for chart
  const totalHabits = habits.length || 1;
  const dailyChartData = useMemo(() => {
    const data = [];
    for (let offset = 6; offset >= 0; offset--) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const iso = date.toISOString().slice(0, 10);
      const dayCompletions = historyCompletions.filter(c => c.date === iso && (c.completed === true || c.HabitCompletion?.completed === true));
      const completedSet = new Set(dayCompletions.map(c => (c.Habit?.id || c.HabitId)));
      const rate = (completedSet.size / totalHabits) * 100;
      data.push({
        date: iso,
        rate: Math.round(rate * 10) / 10,
        completed: completedSet.size,
      });
    }
    return data;
  }, [historyCompletions, totalHabits]);

  const weeklyChartData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let weekIndex = 3; weekIndex >= 0; weekIndex--) {
      const start = new Date(today);
      start.setDate(start.getDate() - (weekIndex * 7 + 6));
      const end = new Date(today);
      end.setDate(end.getDate() - weekIndex * 7);

      let completedCount = 0;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const iso = d.toISOString().slice(0, 10);
        const dayCompletions = historyCompletions.filter(c => c.date === iso && (c.completed === true || c.HabitCompletion?.completed === true));
        const completedSet = new Set(dayCompletions.map(c => (c.Habit?.id || c.HabitId)));
        completedCount += completedSet.size;
      }

      const rate = ((completedCount / (totalHabits * 7)) * 100) || 0;
      data.push({
        label: `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
        rate: Math.round(rate * 10) / 10,
      });
    }
    return data;
  }, [historyCompletions, totalHabits]);

  return (
    <div>
      {/* Add Habit Form */}
      <AddHabitForm onAdd={handleAdd} />

      {/* Today's Progress Section */}
      <div className="mb-6 flex flex-col sm:flex-row items-center gap-4 p-5 bg-gradient-to-r from-[#BFDBFE]/30 to-[#A7F3D0]/30 dark:from-slate-800 dark:to-slate-800 rounded-xl border border-[#BFDBFE]/50 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <ProgressCircle percent={percentToday} />
          <div className="text-center sm:text-left">
            <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">{t('todaysProgress')}</div>
            <div className="text-lg font-semibold text-gray-800 dark:text-white">
              {completedTodayCount} / {expectedTodayCount} {t('completed')}
            </div>
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="text-center py-8 text-gray-500 dark:text-slate-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-2 text-sm">{t('loading')}</p>
        </div>
      )}
      {error && (
        <div className="card p-4 mb-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Habits Grid */}
      {!loading && habits.length === 0 && (
        <div className="card p-8 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500 dark:text-slate-400">{t('yourHabits')}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">Start by adding your first habit above</p>
        </div>
      )}

      {(dailyChartData.length || weeklyChartData.length) > 0 && (
        <div className="mb-6">
          <ProgressChart dailyData={dailyChartData} weeklyData={weeklyChartData} />
        </div>
      )}

      {/* Sleep Chart */}
      <div className="mb-6">
        <div className="card p-5">
          <SleepChart />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {habits.map(habit => {
          const list = habit.HabitCompletions || habit.completions || [];
          const doneToday = list.some(c => c.date === todayIso && c.completed);
          return (
            <HabitCard
              key={habit.id}
              habit={habit}
              doneToday={doneToday}
              onToggleDay={handleToggleDay}
              onDelete={handleDelete}
              weekOffset={weekOffset}
              onWeekChange={setWeekOffset}
              weekCompletions={weekCompletions}
              allHabits={habits}
            />
          );
        })}
      </div>
    </div>
  );
}
