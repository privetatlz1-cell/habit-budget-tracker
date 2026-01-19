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
            '#A7F3D0', '#BFDBFE', '#FBCFE8', '#FDBA74', '#C7D2FE'
          ],
        }]
      },
      options: { 
        plugins: { 
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: (context) => {
                const symbol = language === 'ru' ? '₽' : '$';
                return `${context.label}: ${symbol}${context.parsed.toFixed(2)}`;
              }
            }
          }
        }, 
        responsive: true 
      }
    });
    return () => chart.destroy();
  }, [chartData]);
  return <canvas ref={canvasRef} width={180} height={180} />;
});

export default PieChart;



