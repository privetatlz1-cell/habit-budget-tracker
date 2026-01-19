import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { API_BASE } from "../../utils/constants";

/**
 * TaskCard Component
 * Displays a single task with subtasks, attachments, and notes
 */
export default function TaskCard({ task, onEdit, onDelete, getPriorityColor }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);

  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div
      className="bg-white dark:bg-[#353844] rounded-lg p-4 border border-gray-200 dark:border-neutral-medium/30 hover:shadow-md transition-all cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-gray-600 dark:text-neutral-light line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)} flex-shrink-0 ml-2`} />
      </div>

      {/* Dates */}
      {(task.startDate || task.dueDate) && (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-neutral-light mb-2">
          {task.startDate && (
            <span>{formatDate(task.startDate)}</span>
          )}
          {task.startDate && task.dueDate && <span>→</span>}
          {task.dueDate && (
            <span className={isOverdue ? 'text-red-500 font-semibold' : ''}>
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      )}

      {/* Subtasks Progress */}
      {totalSubtasks > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-neutral-light mb-1">
            <span>{t('subtasks') || 'Subtasks'}: {completedSubtasks}/{totalSubtasks}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-[#2C2F3A] rounded-full h-1.5">
            <div
              className="bg-primary-purple h-1.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Attachments */}
      {task.attachments && task.attachments.length > 0 && (
        <div className="flex items-center gap-1 mb-2 flex-wrap">
          {task.attachments.slice(0, 3).map(att => (
            <div
              key={att.id}
              className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-[#2C2F3A] rounded text-xs text-gray-600 dark:text-neutral-light"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span className="truncate max-w-[60px]">{att.fileName}</span>
            </div>
          ))}
          {task.attachments.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-neutral-light">
              +{task.attachments.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Status Badge */}
      <div className="flex items-center justify-between mt-2">
        <span className={`text-xs px-2 py-1 rounded ${
          task.status === 'done' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
          task.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
          'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        }`}>
          {task.status === 'done' ? (t('done') || 'Done') :
           task.status === 'in_progress' ? (t('inProgress') || 'In Progress') :
           (t('todo') || 'To Do')}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-[#404550] rounded transition-colors"
            title={t('edit') || 'Edit'}
          >
            <svg className="w-4 h-4 text-gray-600 dark:text-neutral-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(t('deleteTaskConfirm') || 'Delete this task?')) {
                onDelete();
              }
            }}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
            title={t('delete') || 'Delete'}
          >
            <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-medium/30 space-y-3">
          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-gray-700 dark:text-neutral-light mb-2">
                {t('subtasks') || 'Subtasks'}
              </h5>
              <div className="space-y-1">
                {task.subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center gap-2 text-xs text-gray-600 dark:text-neutral-light">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      disabled
                      className="rounded"
                    />
                    <span className={subtask.completed ? 'line-through opacity-50' : ''}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {task.notes && task.notes.length > 0 && (
            <div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNotesExpanded(!notesExpanded);
                }}
                className="flex items-center justify-between w-full text-xs font-semibold text-gray-700 dark:text-neutral-light mb-2"
              >
                <span>{t('notes') || 'Notes'} ({task.notes.length})</span>
                <svg
                  className={`w-4 h-4 transition-transform ${notesExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {notesExpanded && (
                <div className="space-y-2 text-xs text-gray-600 dark:text-neutral-light">
                  {task.notes.map(note => (
                    <div key={note.id} className="p-2 bg-gray-50 dark:bg-[#2C2F3A] rounded">
                      {note.content}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

