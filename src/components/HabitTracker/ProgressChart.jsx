import React, { useEffect, useRef } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import Chart from "chart.js/auto";

export default function ProgressChart({ dailyData = [], weeklyData = [] }) {
  const { t } = useLanguage();
  const dailyRef = useRef(null);
  const weeklyRef = useRef(null);

  useEffect(() => {
    if (!dailyRef.current) return;
    const ctx = dailyRef.current.getContext('2d');
    if (!ctx) return;

    const textColor = '#cbd5f5';
    const gridColor = 'rgba(148, 163, 184, 0.2)';
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dailyData.map(d => new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
        datasets: [
          {
          label: t('dailyCompletionPercent') || 'Daily completion %',
            data: dailyData.map(d => d.rate),
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37, 99, 235, 0.15)',
            tension: 0.3,
            fill: true,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false, labels: { color: textColor } },
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed.y.toFixed(1)}%`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (value) => `${value}%`,
              color: textColor
            },
            grid: { color: gridColor }
          },
          x: {
            ticks: { color: textColor },
            grid: { color: gridColor }
          }
        }
      }
    });

    return () => chart.destroy();
  }, [dailyData, t]);

  useEffect(() => {
    if (!weeklyRef.current) return;
    const ctx = weeklyRef.current.getContext('2d');
    if (!ctx) return;

    const textColor = '#cbd5f5';
    const gridColor = 'rgba(148, 163, 184, 0.2)';
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: weeklyData.map(d => d.label),
        datasets: [
          {
          label: t('weeklyCompletionPercent') || 'Weekly completion %',
            data: weeklyData.map(d => d.rate),
            backgroundColor: '#A7F3D0',
            borderRadius: 8,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false, labels: { color: textColor } },
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed.y.toFixed(1)}%`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (value) => `${value}%`,
              color: textColor
            },
            grid: { color: gridColor }
          },
          x: {
            ticks: { color: textColor },
            grid: { color: gridColor }
          }
        }
      }
    });

    return () => chart.destroy();
  }, [weeklyData, t]);

  if (!dailyData.length && !weeklyData.length) {
    return null;
  }

  return (
    <div className="card p-5">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('progressOverview') || 'Progress Overview'}</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-48 sm:h-52">
          <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">{t('dailyCompletionLast7') || 'Daily completion (last 7 days)'}</h4>
          <canvas ref={dailyRef} />
        </div>
        <div className="h-48 sm:h-52">
          <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">{t('weeklyCompletionLast4') || 'Weekly completion (last 4 weeks)'}</h4>
          <canvas ref={weeklyRef} />
        </div>
      </div>
    </div>
  );
}



