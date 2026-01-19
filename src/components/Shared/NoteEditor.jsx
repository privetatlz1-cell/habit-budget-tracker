import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { API_BASE } from "../../utils/constants";

/**
 * NoteEditor Component
 * Modal for creating and editing daily notes
 */
export default function NoteEditor({ 
  date, 
  initialTitle = "",
  initialContent = "", 
  onSave, 
  onClose 
}) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(initialTitle || "");
  const [content, setContent] = useState(initialContent || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(initialTitle || "");
    setContent(initialContent || "");
  }, [initialTitle, initialContent, date]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/daily-notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          date, 
          title: title.trim() || null, 
          content: content.trim() || null 
        })
      });

      if (!res.ok) throw new Error("Failed to save note");

      const savedNote = await res.json();
      if (onSave) onSave(savedNote);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving note:", error);
      alert(t("errorSaveNote") || "Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!title.trim() && !content.trim() && !initialTitle && !initialContent) {
      if (onClose) onClose();
      return;
    }

    if (!window.confirm(t("deleteNoteConfirm") || "Delete this note?")) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/daily-notes/${date}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to delete note");

      if (onSave) onSave({ date, title: null, content: null });
      if (onClose) onClose();
    } catch (error) {
      console.error("Error deleting note:", error);
      alert(t("errorDeleteNote") || "Failed to delete note");
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
      <div className="bg-white dark:bg-[#2C2F3A] rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-neutral-medium/30">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("dailyNote") || "Daily Note"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-neutral-light mt-1">
              {formattedDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="icon-btn"
            aria-label={t("close") || "Close"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("noteTitlePlaceholder") || "Note title (optional)"}
            className="w-full p-3 rounded-xl text-base bg-white dark:bg-[#353844] text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-medium/30 placeholder-gray-400 dark:placeholder-neutral-light focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none transition-all"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("notePlaceholder") || "Write your note..."}
            className="w-full h-64 p-4 rounded-xl text-sm bg-white dark:bg-[#353844] text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-medium/30 placeholder-gray-400 dark:placeholder-neutral-light focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none resize-none transition-all"
            autoFocus
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-gray-200 dark:border-neutral-medium/30">
          <button
            onClick={handleDelete}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-semantic-pink hover:bg-semantic-pink/10 rounded-lg transition-colors disabled:opacity-50"
          >
            {t("delete") || "Delete"}
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-neutral-light hover:bg-gray-100 dark:hover:bg-[#353844] rounded-lg transition-colors disabled:opacity-50"
            >
              {t("cancel") || "Cancel"}
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
                  {t("saving") || "Saving..."}
                </>
              ) : (
                t("save") || "Save"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


