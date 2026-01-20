import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { API_BASE } from "../../utils/constants";

/**
 * TaskModal Component
 * Modal for creating and editing tasks with all features:
 * - Basic fields (title, description, dates, priority, category, status)
 * - Subtasks management
 * - File attachments
 * - Notes
 */
export default function TaskModal({ task, type, onSave, onDelete, onClose }) {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState(type === 'work' ? 'Work' : 'Personal');
  const [status, setStatus] = useState("todo");
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

  // Categories based on type
  const categories = type === 'work'
    ? ['Work', 'Meeting', 'Project', 'Bug']
    : ['Personal', 'Health', 'Home'];

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setStartDate(task.startDate || "");
      setDueDate(task.dueDate || "");
      setPriority(task.priority || "Medium");
      setCategory(task.category || (type === 'work' ? 'Work' : 'Personal'));
      setStatus(task.status || "todo");
      setSubtasks(task.subtasks || []);
      setAttachments(task.attachments || []);
      setNotes(task.notes || []);
    } else {
      // Reset for new task
      setTitle("");
      setDescription("");
      setStartDate("");
      setDueDate("");
      setPriority("Medium");
      setCategory(type === 'work' ? 'Work' : 'Personal');
      setStatus("todo");
      setSubtasks([]);
      setAttachments([]);
      setNotes([]);
    }
  }, [task, type]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert(t('taskTitleRequired') || 'Task title is required');
      return;
    }

    setSaving(true);
    try {
      const taskData = {
        type,
        title: title.trim(),
        description: description.trim() || null,
        startDate: startDate || null,
        dueDate: dueDate || null,
        priority,
        category,
        status,
        subtasks: subtasks.map((s, i) => ({
          id: s.id,
          title: s.title,
          completed: s.completed || false,
          order: i
        }))
      };

      const url = task ? `${API_BASE}/api/tasks/${task.id}` : `${API_BASE}/api/tasks`;
      const method = task ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });

      if (!res.ok) throw new Error('Failed to save task');

      const savedTask = await res.json();

      // Load full task with attachments and notes
      const fullTaskRes = await fetch(`${API_BASE}/api/tasks/${savedTask.id}`);
      if (fullTaskRes.ok) {
        const fullTask = await fullTaskRes.json();
        onSave(fullTask);
      } else {
        onSave(savedTask);
      }
    } catch (error) {
      console.error('Error saving task:', error);
      alert(t('errorSaveTask') || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, { id: Date.now(), title: newSubtask.trim(), completed: false }]);
    setNewSubtask("");
  };

  const handleRemoveSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleToggleSubtask = (index) => {
    setSubtasks(subtasks.map((s, i) => i === index ? { ...s, completed: !s.completed } : s));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !task) return; // Can only upload after task is created

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/api/tasks/${task.id}/attachments`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Failed to upload file');

      const attachment = await res.json();
      setAttachments([...attachments, attachment]);

      // Reload task to get updated attachments
      const taskRes = await fetch(`${API_BASE}/api/tasks/${task.id}`);
      if (taskRes.ok) {
        const updatedTask = await taskRes.json();
        setAttachments(updatedTask.attachments || []);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(t('errorUploadFile') || 'Failed to upload file');
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!task) return;

    try {
      const res = await fetch(`${API_BASE}/api/tasks/${task.id}/attachments/${attachmentId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete attachment');

      setAttachments(attachments.filter(a => a.id !== attachmentId));
    } catch (error) {
      console.error('Error deleting attachment:', error);
      alert(t('errorDeleteAttachment') || 'Failed to delete attachment');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !task) return;

    try {
      const res = await fetch(`${API_BASE}/api/tasks/${task.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote.trim() })
      });

      if (!res.ok) throw new Error('Failed to add note');

      const note = await res.json();
      setNotes([...notes, note]);
      setNewNote("");

      // Reload task to get updated notes
      const taskRes = await fetch(`${API_BASE}/api/tasks/${task.id}`);
      if (taskRes.ok) {
        const updatedTask = await taskRes.json();
        setNotes(updatedTask.notes || []);
      }
    } catch (error) {
      console.error('Error adding note:', error);
      alert(t('errorAddNote') || 'Failed to add note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!task) return;

    try {
      const res = await fetch(`${API_BASE}/api/tasks/${task.id}/notes/${noteId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete note');

      setNotes(notes.filter(n => n.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
      alert(t('errorDeleteNote') || 'Failed to delete note');
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return '🖼️';
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('word') || mimeType?.includes('document')) return '📝';
    return '📎';
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#2C2F3A] rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-neutral-medium/30">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {task ? (t('editTask') || 'Edit Task') : (t('createTask') || 'Create Task')}
          </h3>
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
          {/* Basic Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-light mb-1">
                {t('title') || 'Title'} *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 rounded-xl text-base bg-white dark:bg-[#353844] text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-medium/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none"
                placeholder={t('taskTitlePlaceholder') || 'Enter task title'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-light mb-1">
                {t('description') || 'Description'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl text-sm bg-white dark:bg-[#353844] text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-medium/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none resize-none"
                placeholder={t('taskDescriptionPlaceholder') || 'Enter task description'}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-light mb-1">
                  {t('startDate') || 'Start Date'}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-3 rounded-xl text-sm bg-white dark:bg-[#353844] text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-medium/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-light mb-1">
                  {t('dueDate') || 'Due Date'}
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-3 rounded-xl text-sm bg-white dark:bg-[#353844] text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-medium/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-light mb-1">
                  {t('priority') || 'Priority'}
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full p-3 rounded-xl text-sm bg-white dark:bg-[#353844] text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-medium/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none"
                >
                  <option value="Low">{t('low') || 'Low'}</option>
                  <option value="Medium">{t('medium') || 'Medium'}</option>
                  <option value="High">{t('high') || 'High'}</option>
                  <option value="Urgent">{t('urgent') || 'Urgent'}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-light mb-1">
                  {t('category') || 'Category'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 rounded-xl text-sm bg-white dark:bg-[#353844] text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-medium/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-light mb-1">
                  {t('status') || 'Status'}
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-3 rounded-xl text-sm bg-white dark:bg-[#353844] text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-medium/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none"
                >
                  <option value="todo">{t('todo') || 'To Do'}</option>
                  <option value="in_progress">{t('inProgress') || 'In Progress'}</option>
                  <option value="done">{t('done') || 'Done'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Subtasks */}
          <div className="border-t border-gray-200 dark:border-neutral-medium/30 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              {t('subtasks') || 'Subtasks'}
            </h4>
            <div className="space-y-2 mb-3">
              {subtasks.map((subtask, index) => (
                <div key={subtask.id || index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={subtask.completed || false}
                    onChange={() => handleToggleSubtask(index)}
                    className="rounded"
                  />
                  <input
                    type="text"
                    value={subtask.title}
                    onChange={(e) => {
                      const updated = [...subtasks];
                      updated[index] = { ...updated[index], title: e.target.value };
                      setSubtasks(updated);
                    }}
                    className="flex-1 p-2 rounded-lg text-sm bg-white dark:bg-[#353844] text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-medium/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none"
                    placeholder={t('subtaskTitlePlaceholder') || 'Subtask title'}
                  />
                  <button
                    onClick={() => handleRemoveSubtask(index)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                className="flex-1 p-2 rounded-lg text-sm bg-white dark:bg-[#353844] text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-medium/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none"
                placeholder={t('addSubtaskPlaceholder') || 'Add subtask...'}
              />
              <button
                onClick={handleAddSubtask}
                className="px-4 py-2 bg-primary-purple hover:bg-[#5A4FC0] text-white rounded-lg text-sm font-medium transition-colors"
              >
                {t('add') || 'Add'}
              </button>
            </div>
          </div>

          {/* Attachments (only for existing tasks) */}
          {task && (
            <div className="border-t border-gray-200 dark:border-neutral-medium/30 pt-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                {t('attachments') || 'Attachments'}
              </h4>
              <div className="space-y-2 mb-3">
                {attachments.map(att => (
                  <div key={att.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-[#353844] rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getFileIcon(att.mimeType)}</span>
                      <a
                        href={`${API_BASE}/api/tasks/attachments/${att.filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-700 dark:text-neutral-light hover:text-primary-purple"
                      >
                        {att.fileName}
                      </a>
                    </div>
                    <button
                      onClick={() => handleDeleteAttachment(att.id)}
                      className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <label className="block">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <span className="inline-block px-4 py-2 bg-gray-100 dark:bg-[#353844] hover:bg-gray-200 dark:hover:bg-[#404550] text-gray-700 dark:text-neutral-light rounded-lg text-sm font-medium cursor-pointer transition-colors">
                  {t('uploadFile') || 'Upload File'}
                </span>
              </label>
            </div>
          )}

          {/* Notes (only for existing tasks) */}
          {task && (
            <div className="border-t border-gray-200 dark:border-neutral-medium/30 pt-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                {t('notes') || 'Notes'}
              </h4>
              <div className="space-y-2 mb-3">
                {notes.map(note => (
                  <div key={note.id} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-[#353844] rounded-lg">
                    <p className="flex-1 text-sm text-gray-700 dark:text-neutral-light">{note.content}</p>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="ml-2 p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={2}
                  className="flex-1 p-2 rounded-lg text-sm bg-white dark:bg-[#353844] text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-medium/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none resize-none"
                  placeholder={t('addNotePlaceholder') || 'Add a note...'}
                />
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-primary-purple hover:bg-[#5A4FC0] text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {t('add') || 'Add'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-gray-200 dark:border-neutral-medium/30">
          {onDelete && (
            <button
              onClick={() => {
                if (window.confirm(t('deleteTaskConfirm') || 'Delete this task?')) {
                  onDelete();
                }
              }}
              className="px-4 py-2 text-sm font-medium text-semantic-pink hover:bg-semantic-pink/10 rounded-lg transition-colors"
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
              disabled={saving || !title.trim()}
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

