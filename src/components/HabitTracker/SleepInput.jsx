import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { API_BASE } from "../../utils/constants";

export default function SleepInput({ date, initialHours, onSave, onClose }) {
  const { t } = useLanguage();
  const [hours, setHours] = useState(initialHours?.toString() || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setHours(initialHours?.toString() || "");
  }, [initialHours, date]);

  const handleSave = async () => {
    const numHours = parseFloat(hours);
    if (isNaN(numHours) || numHours < 0 || numHours > 24) {
      alert(t('invalidSleepHours') || 'Please enter a valid number between 0 and 24');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/sleep`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, hours: numHours })
      });

      if (!res.ok) throw new Error("Failed to save sleep data");

      const savedEntry = await res.json();
      if (onSave) onSave(savedEntry);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving sleep data:", error);
      alert(t('errorSaveSleep') || "Failed to save sleep data");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialHours) {
      if (onClose) onClose();
      return;
    }

    if (!window.confirm(t('deleteSleepConfirm') || "Delete sleep data for this day?")) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/sleep/${date}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to delete sleep data");

      if (onSave) onSave({ date, hours: null });
      if (onClose) onClose();
    } catch (error) {
      console.error("Error deleting sleep data:", error);
      alert(t('errorDeleteSleep') || "Failed to delete sleep data");
    } finally {
      setSaving(false);
    }
  };

  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#2C2F3A] rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-neutral-medium/30">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('sleepHours') || 'Sleep Hours'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-neutral-light mt-1">
              {formattedDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="icon-btn"
            aria-label={t('close') || "Close"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-light mb-2">
              {t('hoursSlept') || 'Hours Slept'}
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="7.5"
                className="w-full px-4 py-3 rounded-xl text-lg bg-white dark:bg-[#353844] text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-medium/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none transition-all"
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-light font-medium">
                {t('hours') || 'hours'}
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-neutral-light">
              {t('sleepRecommendation') || 'Recommended: 7-9 hours'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-gray-200 dark:border-neutral-medium/30">
          <button
            onClick={handleDelete}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-semantic-pink hover:bg-semantic-pink/10 rounded-lg transition-colors disabled:opacity-50"
          >
            {t('delete') || 'Delete'}
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-neutral-light hover:bg-gray-100 dark:hover:bg-[#353844] rounded-lg transition-colors disabled:opacity-50"
            >
              {t('cancel') || 'Cancel'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-primary-purple hover:bg-[#5A4FC0] text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('saving') || 'Saving...'}
                </>
              ) : (
                t('save') || 'Save'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


