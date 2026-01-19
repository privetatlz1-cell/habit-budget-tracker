import React, { useState, lazy, Suspense } from "react";
import { useLanguage } from "../contexts/LanguageContext";

// Lazy load heavy components for better performance
const HabitList = lazy(() => import("./HabitTracker/HabitList"));
const BudgetList = lazy(() => import("./BudgetTracker/BudgetList"));
const HomeDashboard = lazy(() => import("./Home/HomeDashboard"));
const TaskBoard = lazy(() => import("./TaskTracker/TaskBoard"));

/**
 * Dashboard Component
 * Main dashboard with tab navigation for Home, Habits, and Budget
 */
export default function Dashboard() {
  const [view, setView] = useState("home");
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-neutral-medium/30">
        <button
          onClick={() => setView("home")}
          className={`px-5 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
            view === "home"
              ? "border-primary-purple text-gray-900 dark:text-white"
              : "border-transparent text-gray-500 dark:text-neutral-light hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          {t('home') || 'Home'}
        </button>
        <button
          onClick={() => setView("habits")}
          className={`px-5 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
            view === "habits"
              ? "border-primary-purple text-gray-900 dark:text-white"
              : "border-transparent text-gray-500 dark:text-neutral-light hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          {t('habitTracker')}
        </button>
        <button
          onClick={() => setView("budget")}
          className={`px-5 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
            view === "budget"
              ? "border-primary-purple text-gray-900 dark:text-white"
              : "border-transparent text-gray-500 dark:text-neutral-light hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          {t('budgetTracker')}
        </button>
        <button
          onClick={() => setView("tasks")}
          className={`px-5 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
            view === "tasks"
              ? "border-primary-purple text-gray-900 dark:text-white"
              : "border-transparent text-gray-500 dark:text-neutral-light hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          {t('taskTracker') || 'Task Tracker'}
        </button>
        <button
          onClick={() => setView("work-tasks")}
          className={`px-5 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
            view === "work-tasks"
              ? "border-primary-purple text-gray-900 dark:text-white"
              : "border-transparent text-gray-500 dark:text-neutral-light hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          {t('workTaskTracker') || 'Work Task Tracker'}
        </button>
      </div>

      {/* Tab Content */}
      <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="text-gray-500 dark:text-neutral-light">Loading...</div></div>}>
        {view === "home" && <HomeDashboard />}
        {view === "habits" && (
          <div className="card p-6 md:p-8">
            <HabitList />
          </div>
        )}
        {view === "budget" && (
          <div className="card p-6 md:p-8">
            <BudgetList />
          </div>
        )}
        {view === "tasks" && (
          <div className="card p-6 md:p-8">
            <TaskBoard type="personal" />
          </div>
        )}
        {view === "work-tasks" && (
          <div className="card p-6 md:p-8">
            <TaskBoard type="work" />
          </div>
        )}
      </Suspense>
    </div>
  );
}



