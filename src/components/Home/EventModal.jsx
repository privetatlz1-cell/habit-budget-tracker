import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { API_BASE } from "../../utils/constants";

const EVENT_CATEGORIES = [
  { name: 'Personal', color: '#6C5DD3' },
  { name: 'Work', color: '#FFA2C0' },
  { name: 'Health', color: '#10B981' },
  { name: 'Family', color: '#FFCE73' },
  { name: 'Other', color: '#A0D7E7' }
];

export default function EventModal({ event, date, onSave, onDelete, onClose }) {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState("Personal");
  const [color, setColor] = useState("#6C5DD3");
  const [allDay, setAllDay] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title || "");
      setDescription(event.description || "");
      setStartDate(event.startDate || "");
      setStartTime(event.startTime || "");
      setEndDate(event.endDate || event.startDate || "");
      setEndTime(event.endTime || "");
      setCategory(event.category || "Personal");
      setColor(event.color || "#6C5DD3");
      setAllDay(event.allDay !== undefined ? event.allDay : true);
    } else if (date) {
      const dateStr = date.slice(0, 10);
      setStartDate(dateStr);
      setEndDate(dateStr);
    }
  }, [event, date]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert(t('eventTitleRequired') || 'Event title is required');
      return;
    }

    setSaving(true);
    try {
      const eventData = {
        title: title.trim(),
        description: description.trim() || null,
        startDate,
        startTime: allDay ? null : (startTime || null),
        endDate: endDate && endDate !== startDate ? endDate : null, // Only set if different from start
        endTime: allDay ? null : (endTime || null),
        category,
        color,
        allDay
      };

      const url = event ? `${API_BASE}/api/events/${event.id}` : `${API_BASE}/api/events`;
      const method = event ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData)
      });

      if (!res.ok) throw new Error("Failed to save event");

      const savedEvent = await res.json();
      if (onSave) onSave(savedEvent);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving event:", error);
      alert(t('errorSaveEvent') || "Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    
    if (!window.confirm(t('deleteEventConfirm') || "Delete this event?")) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/events/${event.id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to delete event");

      if (onDelete) onDelete(event.id);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert(t('errorDeleteEvent') || "Failed to delete event");
    } finally {
      setSaving(false);
    }
  };

  const selectedCategory = EVENT_CATEGORIES.find(c => c.name === category) || EVENT_CATEGORIES[0];

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#2C2F3A] rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-neutral-medium/30">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {event ? t('editEvent') || 'Edit Event' : t('newEvent') || 'New Event'}
          </h3>
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
        <div className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-light mb-2">
              {t('title') || 'Title'} *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('eventTitlePlaceholder') || 'Event title'}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#353844] text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-medium/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none transition-all"
              autoFocus
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-light mb-2">
                {t('startDate') || 'Start Date'} *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#353844] text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-medium/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-light mb-2">
                {t('endDate') || 'End Date'}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#353844] text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-medium/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none transition-all"
              />
            </div>
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="allDay"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-neutral-medium text-primary-purple focus:ring-primary-purple"
            />
            <label htmlFor="allDay" className="text-sm font-medium text-gray-700 dark:text-neutral-light">
              {t('allDay') || 'All Day'}
            </label>
          </div>

          {/* Time (if not all day) */}
          {!allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-light mb-2">
                  {t('startTime') || 'Start Time'}
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#353844] text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-medium/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-light mb-2">
                  {t('endTime') || 'End Time'}
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#353844] text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-medium/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Category & Color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-light mb-2">
                {t('category') || 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  const cat = EVENT_CATEGORIES.find(c => c.name === e.target.value);
                  if (cat) setColor(cat.color);
                }}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#353844] text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-medium/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none transition-all"
              >
                {EVENT_CATEGORIES.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-light mb-2">
                {t('color') || 'Color'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border border-gray-300 dark:border-neutral-medium cursor-pointer"
                />
                <div className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#353844] text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-medium/30">
                  {color}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-light mb-2">
              {t('description') || 'Description'}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('eventDescriptionPlaceholder') || 'Add description...'}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#353844] text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-medium/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-gray-200 dark:border-neutral-medium/30">
          {event && (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-semantic-pink hover:bg-semantic-pink/10 rounded-lg transition-colors disabled:opacity-50"
            >
              {t('delete') || 'Delete'}
            </button>
          )}
          <div className="flex gap-3 ml-auto">
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

