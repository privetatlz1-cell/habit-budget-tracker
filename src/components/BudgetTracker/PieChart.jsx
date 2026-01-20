import React, { useEffect, useRef, useMemo } from "react";
import Chart from "chart.js/auto";
import { useLanguage } from "../../contexts/LanguageContext";
import useCurrency from "../../hooks/useCurrency";

/**
 * PieChart Component
 * Displays expense categories as a pie chart
 * @param {Array} data - Array of budget items
 */
const PieChart = React.memo(function PieChart({ data }) {
  const canvasRef = useRef(null);
  const { language } = useLanguage();
  const { convert } = useCurrency();

  // Memoize chart data to avoid unnecessary recalculations
  const chartData = useMemo(() => {
    const cats = {};
    data.filter(i => i.type === "expense").forEach(item => {
      const displayAmount = convert(item.amount, language);
      cats[item.category] = (cats[item.category] || 0) + displayAmount;
    });
    return {
      labels: Object.keys(cats),
      values: Object.values(cats)
    };
  }, [data, language, convert]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: chartData.labels,
        datasets: [{
          data: chartData.values,
          backgroundColor: [
            'rgba(74, 222, 128, 0.55)',
            'rgba(59, 130, 246, 0.5)',
            'rgba(236, 72, 153, 0.5)',
            'rgba(251, 146, 60, 0.55)',
            'rgba(129, 140, 248, 0.5)'
          ],
        }]
      },
      options: { 
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { position: "bottom", labels: { color: '#cbd5f5' } },
          tooltip: {
            callbacks: {
              label: (context) => {
                const symbol = language === 'ru' ? '₽' : '$';
                return `${context.label}: ${symbol}${context.parsed.toFixed(2)}`;
              }
            }
          }
        }
      }
    });
    return () => chart.destroy();
  }, [chartData, language]);
  return (
    <div className="w-full h-48 sm:h-52">
      <canvas ref={canvasRef} />
    </div>
  );
});

export default PieChart;



