import React, { useEffect, useRef, useMemo } from "react";
import Chart from "chart.js/auto";
import { useLanguage } from "../../contexts/LanguageContext";
import useCurrency from "../../hooks/useCurrency";

/**
 * BarChart Component
 * Displays last 6 months income vs expenses as a bar chart
 * @param {Array} data - Array of budget items
 */
const BarChart = React.memo(function BarChart({ data = [] }) {
  const canvasRef = useRef(null);
  const { t, language } = useLanguage();
  const { convert } = useCurrency();

  const series = useMemo(() => {
    const fmt = (d) => d.slice(0,7);
    const now = new Date();
    const labels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
    }
    // Convert USD amounts to display currency (RUB if lang=ru)
    const income = labels.map(m => data.filter(x => (x.date||'').startsWith(m) && x.type==='income')
      .reduce((a,b)=>a+convert(b.amount||0, language),0));
    const expense = labels.map(m => data.filter(x => (x.date||'').startsWith(m) && x.type==='expense')
      .reduce((a,b)=>a+convert(b.amount||0, language),0));
    return { labels, income, expense };
  }, [data, language, convert]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: series.labels,
        datasets: [
          { label: t('income'), data: series.income, backgroundColor: '#A7F3D0' },
          { label: t('monthlyExpenses'), data: series.expense, backgroundColor: '#FBCFE8' }
        ]
      },
      options: { 
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } }, 
        plugins: { 
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (context) => {
                const symbol = language === 'ru' ? '₽' : '$';
                return `${context.dataset.label}: ${symbol}${context.parsed.y.toFixed(2)}`;
              }
            }
          }
        } 
      }
    });
    return () => chart.destroy();
  }, [series, language, t]);

  return (
    <div className="w-full h-52 sm:h-56">
      <canvas ref={canvasRef} />
    </div>
  );
});

export default BarChart;



