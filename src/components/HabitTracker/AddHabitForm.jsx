import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function AddHabitForm({ onAdd }) {
  const { t, habitCategories } = useLanguage();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(habitCategories[0] || "General");
  const [customCat, setCustomCat] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [monthlySchedule, setMonthlySchedule] = useState([]);

  const dayNames = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const dayLabels = {
    mon: t('mon'),
    tue: t('tue'),
    wed: t('wed'),
    thu: t('thu'),
    fri: t('fri'),
    sat: t('sat'),
    sun: t('sun'),
  };

  const handleWeeklyDayToggle = (day) => {
    setWeeklySchedule(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleMonthlyDayToggle = (day) => {
    setMonthlySchedule(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => a - b)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert(t('habitNameRequired') || 'Habit name is required');
      return;
    }
    
    // Validate schedule based on frequency
    let schedule = null;
    if (frequency === 'weekly') {
      if (weeklySchedule.length === 0) {
        alert(t('scheduleRequired') || 'Please select at least one day for weekly habits');
        return;
      }
      schedule = weeklySchedule;
    } else if (frequency === 'monthly') {
      if (monthlySchedule.length === 0) {
        alert(t('scheduleRequired') || 'Please select at least one day for monthly habits');
        return;
      }
      schedule = monthlySchedule;
    }
    // For daily, schedule remains null

    onAdd({
      name: name.trim(),
      description: description.trim() || null,
      category: category === 'Custom' && customCat.trim() ? customCat.trim() : category,
      frequency,
      schedule
    });
    setName("");
    setDescription("");
    setCategory(habitCategories[0] || "General");
    setCustomCat("");
    setFrequency("daily");
    setWeeklySchedule([]);
    setMonthlySchedule([]);
  };

  return (
    <form onSubmit={handleSubmit} className="card p-5 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('addHabit')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('habitName')}
          className="px-4 py-2.5 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-white border border-gray-300 dark:border-slate-600 focus:border-[#BFDBFE] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#BFDBFE]/30 dark:focus:ring-blue-400/20 outline-none transition-all"
          required
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('descriptionOptional')}
          className="px-4 py-2.5 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-white border border-gray-300 dark:border-slate-600 focus:border-[#BFDBFE] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#BFDBFE]/30 dark:focus:ring-blue-400/20 outline-none transition-all"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2.5 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-white border border-gray-300 dark:border-slate-600 focus:border-[#BFDBFE] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#BFDBFE]/30 dark:focus:ring-blue-400/20 outline-none transition-all"
        >
          {habitCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          <option value="Custom">Custom</option>
        </select>
        {category === 'Custom' && (
          <input
            type="text"
            value={customCat}
            onChange={(e) => setCustomCat(e.target.value)}
            placeholder={t('category')}
            className="px-4 py-2.5 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-white border border-gray-300 dark:border-slate-600 focus:border-[#BFDBFE] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#BFDBFE]/30 dark:focus:ring-blue-400/20 outline-none transition-all"
          />
        )}
        {category !== 'Custom' && <div />}
      </div>

      {/* Frequency Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          {t('frequency')}
        </label>
        <select
          value={frequency}
          onChange={(e) => {
            setFrequency(e.target.value);
            setWeeklySchedule([]);
            setMonthlySchedule([]);
          }}
          className="px-4 py-2.5 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-white border border-gray-300 dark:border-slate-600 focus:border-[#BFDBFE] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#BFDBFE]/30 dark:focus:ring-blue-400/20 outline-none transition-all w-full md:w-auto"
        >
          <option value="daily">{t('daily')}</option>
          <option value="weekly">{t('weekly')}</option>
          <option value="monthly">{t('monthly')}</option>
        </select>
      </div>

      {/* Weekly Schedule */}
      {frequency === 'weekly' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            {t('schedule')} - {t('selectDays')}
          </label>
          <div className="flex flex-wrap gap-2">
            {dayNames.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => handleWeeklyDayToggle(day)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  weeklySchedule.includes(day)
                    ? 'bg-[#BFDBFE] dark:bg-blue-600 text-gray-800 dark:text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-300 dark:border-slate-600 hover:border-[#BFDBFE] dark:hover:border-blue-400'
                }`}
              >
                {dayLabels[day]}
              </button>
            ))}
          </div>
          {weeklySchedule.length === 0 && (
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
              Select at least one day
            </p>
          )}
        </div>
      )}

      {/* Monthly Schedule */}
      {frequency === 'monthly' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            {t('schedule')} - {t('selectDaysOfMonth')}
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
              <button
                key={day}
                type="button"
                onClick={() => handleMonthlyDayToggle(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  monthlySchedule.includes(day)
                    ? 'bg-[#A7F3D0] dark:bg-green-600 text-gray-800 dark:text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-300 dark:border-slate-600 hover:border-[#A7F3D0] dark:hover:border-green-400'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          {monthlySchedule.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Selected: {monthlySchedule.sort((a, b) => a - b).join(', ')}
            </p>
          )}
          {monthlySchedule.length === 0 && (
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Select at least one day of the month
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        className="btn-soft btn-blue w-full md:w-auto"
        disabled={(frequency === 'weekly' && weeklySchedule.length === 0) || (frequency === 'monthly' && monthlySchedule.length === 0)}
      >
        <span className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('addHabit')}
        </span>
      </button>
    </form>
  );
}

