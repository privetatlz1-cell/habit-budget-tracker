/**
 * Calculate habit progress based on frequency and schedule
 * @param {Object} habit - Habit object with frequency and schedule
 * @param {Array} completions - Array of completion records
 * @param {string} period - 'week' or 'month' or 'today'
 * @returns {number} Progress percentage (0-100)
 */
export function calculateHabitProgress(habit, completions = [], period = 'week') {
  if (!habit) return 0;

  const frequency = habit.frequency || 'daily';
  const schedule = habit.schedule || [];

  // Get completions for this habit
  const habitCompletions = completions.filter(c => {
    const habitId = c.Habit?.id || c.HabitId || c.habit?.id;
    return habitId === habit.id && (c.completed === true || c.HabitCompletion?.completed === true);
  });

  if (frequency === 'daily') {
    // Daily habits: count completed days in the period
    if (period === 'today') {
      const today = new Date().toISOString().slice(0, 10);
      return habitCompletions.some(c => (c.date || c.HabitCompletion?.date) === today) ? 100 : 0;
    }
    
    // For week/month, count completed days vs total days in period
    const today = new Date();
    let totalDays = 7; // default to week
    let startDate = new Date(today);
    
    if (period === 'week') {
      const day = (today.getDay() + 6) % 7; // 0 = Monday
      startDate.setDate(today.getDate() - day);
      totalDays = 7;
    } else if (period === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      totalDays = endDate.getDate();
    }

    const completedDates = new Set(
      habitCompletions
        .map(c => c.date || c.HabitCompletion?.date)
        .filter(date => {
          if (!date) return false;
          const dateObj = new Date(date);
          return dateObj >= startDate && dateObj <= today;
        })
    );

    return totalDays > 0 ? (completedDates.size / totalDays) * 100 : 0;
  }

  if (frequency === 'weekly') {
    // Weekly habits: count completed scheduled days vs total scheduled days
    if (!Array.isArray(schedule) || schedule.length === 0) {
      // Fallback to daily logic if no schedule defined
      return calculateHabitProgress({ ...habit, frequency: 'daily' }, completions, period);
    }

    const today = new Date();
    let startDate = new Date(today);
    
    if (period === 'week') {
      const day = (today.getDay() + 6) % 7; // 0 = Monday
      startDate.setDate(today.getDate() - day);
    } else if (period === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    // Get all scheduled days in the period
    const scheduledDays = getScheduledDaysInPeriod(schedule, frequency, startDate, today);
    
    // Count completed scheduled days
    const completedScheduled = habitCompletions.filter(c => {
      const date = c.date || c.HabitCompletion?.date;
      if (!date) return false;
      return scheduledDays.has(date);
    });

    return scheduledDays.size > 0 ? (completedScheduled.length / scheduledDays.size) * 100 : 0;
  }

  if (frequency === 'monthly') {
    // Monthly habits: count completed scheduled days vs total scheduled days in month
    if (!Array.isArray(schedule) || schedule.length === 0) {
      // Fallback to daily logic if no schedule defined
      return calculateHabitProgress({ ...habit, frequency: 'daily' }, completions, period);
    }

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Get all scheduled days in current month
    const scheduledDays = new Set();
    schedule.forEach(dayNum => {
      if (dayNum >= 1 && dayNum <= 31) {
        const date = new Date(currentYear, currentMonth, dayNum);
        if (date.getMonth() === currentMonth && date <= today) {
          scheduledDays.add(date.toISOString().slice(0, 10));
        }
      }
    });

    // Count completed scheduled days
    const completedScheduled = habitCompletions.filter(c => {
      const date = c.date || c.HabitCompletion?.date;
      return date && scheduledDays.has(date);
    });

    return scheduledDays.size > 0 ? (completedScheduled.length / scheduledDays.size) * 100 : 0;
  }

  return 0;
}

/**
 * Get scheduled days in a period for weekly habits
 * @param {Array} schedule - Array of day names like ['mon', 'wed', 'fri']
 * @param {string} frequency - 'weekly'
 * @param {Date} startDate - Start of period
 * @param {Date} endDate - End of period
 * @returns {Set<string>} Set of ISO date strings
 */
function getScheduledDaysInPeriod(schedule, frequency, startDate, endDate) {
  const scheduledDays = new Set();
  const dayMap = {
    'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6, 'sun': 0
  };

  if (frequency === 'weekly') {
    const current = new Date(startDate);
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      const dayName = Object.keys(dayMap).find(key => dayMap[key] === dayOfWeek);
      if (schedule.includes(dayName)) {
        scheduledDays.add(current.toISOString().slice(0, 10));
      }
      current.setDate(current.getDate() + 1);
    }
  }

  return scheduledDays;
}

/**
 * Check if a date is a scheduled day for a habit
 * @param {Object} habit - Habit object
 * @param {string} dateIso - ISO date string (YYYY-MM-DD)
 * @returns {boolean}
 */
export function isScheduledDay(habit, dateIso) {
  if (!habit) return false;
  
  const frequency = habit.frequency || 'daily';
  const schedule = habit.schedule || [];

  if (frequency === 'daily') {
    return true; // All days are scheduled for daily habits
  }

  if (frequency === 'weekly') {
    if (!Array.isArray(schedule) || schedule.length === 0) return false;
    const date = new Date(dateIso);
    const dayOfWeek = date.getDay();
    const dayMap = {
      'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6, 'sun': 0
    };
    const dayName = Object.keys(dayMap).find(key => dayMap[key] === dayOfWeek);
    return schedule.includes(dayName);
  }

  if (frequency === 'monthly') {
    if (!Array.isArray(schedule) || schedule.length === 0) return false;
    const date = new Date(dateIso);
    const dayOfMonth = date.getDate();
    return schedule.includes(dayOfMonth);
  }

  return false;
}

/**
 * Format frequency display text
 * @param {Object} habit - Habit object
 * @returns {string}
 */
export function formatFrequency(habit) {
  if (!habit) return '';
  
  const frequency = habit.frequency || 'daily';
  const schedule = habit.schedule || [];

  if (frequency === 'daily') {
    return 'Daily';
  }

  if (frequency === 'weekly') {
    if (!Array.isArray(schedule) || schedule.length === 0) {
      return 'Weekly (no schedule)';
    }
    const dayLabels = {
      'mon': 'Mon', 'tue': 'Tue', 'wed': 'Wed', 'thu': 'Thu',
      'fri': 'Fri', 'sat': 'Sat', 'sun': 'Sun'
    };
    const days = schedule.map(d => dayLabels[d] || d).join(', ');
    return `${schedule.length}×/week (${days})`;
  }

  if (frequency === 'monthly') {
    if (!Array.isArray(schedule) || schedule.length === 0) {
      return 'Monthly (no schedule)';
    }
    const days = schedule.sort((a, b) => a - b).join(', ');
    return `${schedule.length}×/month (${days})`;
  }

  return frequency;
}
