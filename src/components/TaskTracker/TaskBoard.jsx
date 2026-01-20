import React, { useState, useEffect, useMemo } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { API_BASE } from "../../utils/constants";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";

/**
 * TaskBoard Component
 * Displays tasks organized by category columns (Kanban-style)
 * Supports filtering, sorting, and task management
 */
export default function TaskBoard({ type = 'personal' }) {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    category: null,
    status: null,
    priority: null
  });
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('ASC');

  // Load tasks
  useEffect(() => {
    loadTasks();
  }, [type, filters, sortBy, sortOrder]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type });
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const res = await fetch(`${API_BASE}/api/tasks?${params}`);
      if (!res.ok) throw new Error('Failed to load tasks');
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from tasks
  const categories = useMemo(() => {
    const cats = [...new Set(tasks.map(t => t.category))];
    return cats.length > 0 ? cats : type === 'work' 
      ? ['Work', 'Meeting', 'Project', 'Bug']
      : ['Personal', 'Health', 'Home'];
  }, [tasks, type]);

  // Group tasks by category
  const tasksByCategory = useMemo(() => {
    const grouped = {};
    categories.forEach(cat => {
      grouped[cat] = tasks.filter(t => t.category === cat);
    });
    return grouped;
  }, [tasks, categories]);

  const handleTaskSave = (savedTask) => {
    if (selectedTask && savedTask.id === selectedTask.id) {
      setTasks(prev => prev.map(t => t.id === savedTask.id ? savedTask : t));
    } else {
      setTasks(prev => [...prev, savedTask]);
    }
    setSelectedTask(null);
    setShowModal(false);
  };

  const handleTaskDelete = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete task');
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setSelectedTask(null);
      setShowModal(false);
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert(t('errorDeleteTask') || 'Failed to delete task');
    }
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Filters and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {type === 'work' ? (t('workTaskTracker') || 'Work Task Tracker') : (t('taskTracker') || 'Task Tracker')}
        </h2>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter by Status */}
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || null }))}
            className="px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#353844] border border-gray-300 dark:border-neutral-medium/30 text-gray-900 dark:text-white"
          >
            <option value="">{t('allStatuses') || 'All Statuses'}</option>
            <option value="todo">{t('todo') || 'To Do'}</option>
            <option value="in_progress">{t('inProgress') || 'In Progress'}</option>
            <option value="done">{t('done') || 'Done'}</option>
          </select>

          {/* Filter by Priority */}
          <select
            value={filters.priority || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value || null }))}
            className="px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#353844] border border-gray-300 dark:border-neutral-medium/30 text-gray-900 dark:text-white"
          >
            <option value="">{t('allPriorities') || 'All Priorities'}</option>
            <option value="Urgent">{t('urgent') || 'Urgent'}</option>
            <option value="High">{t('high') || 'High'}</option>
            <option value="Medium">{t('medium') || 'Medium'}</option>
            <option value="Low">{t('low') || 'Low'}</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#353844] border border-gray-300 dark:border-neutral-medium/30 text-gray-900 dark:text-white"
          >
            <option value="dueDate">{t('sortByDueDate') || 'Sort by Due Date'}</option>
            <option value="priority">{t('sortByPriority') || 'Sort by Priority'}</option>
            <option value="createdAt">{t('sortByCreated') || 'Sort by Created'}</option>
          </select>

          <button
            onClick={handleCreateTask}
            className="px-4 py-2 bg-primary-purple hover:bg-[#5A4FC0] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('addTask') || 'Add Task'}
          </button>
        </div>
      </div>

      {/* Task Board - Columns by Category */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500 dark:text-neutral-light">{t('loading') || 'Loading...'}</div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:overflow-x-auto">
          {categories.map(category => (
            <div
              key={category}
              className="w-full sm:flex-shrink-0 sm:w-80 bg-gray-50 dark:bg-[#2C2F3A] rounded-lg p-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {category}
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-neutral-light">
                  ({tasksByCategory[category]?.length || 0})
                </span>
              </h3>
              
              <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto">
                {tasksByCategory[category]?.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => handleEditTask(task)}
                    onDelete={() => handleTaskDelete(task.id)}
                    getPriorityColor={getPriorityColor}
                  />
                ))}
                {(!tasksByCategory[category] || tasksByCategory[category].length === 0) && (
                  <div className="text-center text-gray-400 dark:text-neutral-medium py-8 text-sm">
                    {t('noTasks') || 'No tasks in this category'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      {showModal && (
        <TaskModal
          task={selectedTask}
          type={type}
          onSave={handleTaskSave}
          onDelete={selectedTask ? () => handleTaskDelete(selectedTask.id) : null}
          onClose={() => {
            setShowModal(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}


