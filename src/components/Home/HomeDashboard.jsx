import React, { useEffect, useState } from "react";
import Widget from "../Shared/Widget";
import ModernCalendar from "./ModernCalendar";
import { useLanguage } from "../../contexts/LanguageContext";
import useCurrency from "../../hooks/useCurrency";
import { API_BASE } from "../../utils/constants";

export default function HomeDashboard() {
  const [habitSummary, setHabitSummary] = useState({ completedToday: 0, expectedToday: 0, totalHabits: 0 });
  const [budgetSummary, setBudgetSummary] = useState({ income: 0, expenses: 0, balance: 0 });
  const [streak, setStreak] = useState(0);
  const [sleepHours, setSleepHours] = useState(null);
  const { t, language } = useLanguage();
  const { format } = useCurrency();

  const loadSummaries = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      
      const [h, b, s, sleep] = await Promise.all([
        fetch(`${API_BASE}/api/habits/today-summary`).then(r=>r.json()).catch(()=>({ completedToday:0, expectedToday:0 })),
        fetch(`${API_BASE}/api/budget/monthly-summary`).then(r=>r.json()).catch(()=>({ income:0, expenses:0, balance:0 })),
        fetch(`${API_BASE}/api/habits/streak`).then(r=>r.json()).catch(()=>({ streak:0 })),
        fetch(`${API_BASE}/api/sleep/${today}`).then(r=>r.ok ? r.json() : null).catch(()=>null)
      ]);
      
      setHabitSummary(h || { completedToday: 0, expectedToday: 0, totalHabits: 0 });
      setBudgetSummary(b || { income:0, expenses:0, balance:0 });
      setStreak((s || {}).streak || 0);
      setSleepHours(sleep ? sleep.hours : null);
    } catch {
      // ignore UI errors here
    }
  };

  useEffect(() => { 
    loadSummaries();
    // Refresh every minute
    const interval = setInterval(loadSummaries, 60000);
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="space-y-6">
      {/* Key Metrics Widgets */}
      <div className="flex flex-wrap gap-4 justify-between items-stretch">
        <div className="flex-1 min-w-[200px]">
          <div className="card px-5 py-4 h-full">
            <Widget 
              title={t('habitsDone')} 
              value={`${habitSummary.completedToday || 0}/${habitSummary.expectedToday || habitSummary.totalHabits || 0}`} 
              accent="blue"
            />
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="card px-5 py-4 h-full">
            <Widget 
              title={t('budgetLeft')} 
              value={format(budgetSummary.balance || 0, language)} 
              accent="green"
            />
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="card px-5 py-4 h-full">
            <Widget 
              title={t('streak')} 
              value={streak > 0 ? `🔥 ${streak} ${streak === 1 ? t('dayStreak') : t('daysStreak')}` : `0 ${t('daysStreak')}`} 
              accent="pink"
            />
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="card px-5 py-4 h-full">
            <Widget 
              title={t('sleepTracking') || 'Sleep Tracking'} 
              value={sleepHours !== null ? `${sleepHours}h` : '-'} 
              accent="yellow"
            />
          </div>
        </div>
      </div>

      {/* Modern Calendar */}
      <ModernCalendar />
    </div>
  );
}

