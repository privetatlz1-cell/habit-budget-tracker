import React, { useEffect, useRef, useMemo } from "react";
import Chart from "chart.js/auto";
import { useLanguage } from "../../contexts/LanguageContext";
import { API_BASE } from "../../utils/constants";

export default function SleepChart({ data = [] }) {
  const canvasRef = useRef(null);
  const { t } = useLanguage();
  const [sleepData, setSleepData] = React.useState([]);
  const [stats, setStats] = React.useState({ average: 0, insufficientDays: 0 });

  useEffect(() => {
    loadSleepData();
  }, []);

  const loadSleepData = async () => {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      
      const from = thirtyDaysAgo.toISOString().slice(0, 10);
      const to = now.toISOString().slice(0, 10);
      
      const [entriesRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/sleep?from=${from}&to=${to}`),
        fetch(`${API_BASE}/api/sleep/stats/summary?from=${from}&to=${to}`)
      ]);
      
      if (entriesRes.ok) {
        const entries = await entriesRes.json();
        setSleepData(entries);
      }
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to load sleep data:', error);
    }
  };

  const chartData = useMemo(() => {
    const now = new Date();
    const labels = [];
    const hours = [];
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      labels.push(date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }));
      
      const entry = sleepData.find(e => e.date === dateStr);
      hours.push(entry ? entry.hours : null);
    }
    
    return { labels, hours };
  }, [sleepData]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: t('sleepHours') || 'Sleep Hours',
          data: chartData.hours,
          backgroundColor: chartData.hours.map(h => {
            if (h === null) return '#E5E7EB';
            if (h < 7) return '#FCA5A5'; // Red for insufficient sleep
            if (h >= 7 && h <= 9) return '#6C5DD3'; // Purple for good sleep
            return '#A0D7E7'; // Blue for oversleep
          }),
          borderColor: chartData.hours.map(h => {
            if (h === null) return '#D1D5DB';
            if (h < 7) return '#EF4444';
            if (h >= 7 && h <= 9) return '#5A4FC0';
            return '#7DD3FC';
          }),
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                if (value === null) return t('noData') || 'No data';
                return `${value} ${t('hours') || 'hours'}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 12,
            ticks: {
              stepSize: 2,
              callback: function(value) {
                return value + 'h';
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });

    return () => chart.destroy();
  }, [chartData, t]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900 dark:text-white">{t('sleepTracking') || 'Sleep Tracking'}</h4>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#6C5DD3]"></div>
            <span className="text-gray-600 dark:text-neutral-light">{t('goodSleep') || 'Good (7-9h)'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#FCA5A5]"></div>
            <span className="text-gray-600 dark:text-neutral-light">{t('insufficient') || '<7h'}</span>
          </div>
        </div>
      </div>
      
      <div className="h-64">
        <canvas ref={canvasRef} className="w-full" />
      </div>
      
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-neutral-medium/30">
        <div>
          <div className="text-xs text-gray-500 dark:text-neutral-light mb-1">{t('averageSleep') || 'Average'}</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {stats.average > 0 ? `${stats.average}h` : '-'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-neutral-light mb-1">{t('insufficientDays') || 'Insufficient Days'}</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {stats.insufficientDays || 0}
          </div>
        </div>
      </div>
    </div>
  );
}


