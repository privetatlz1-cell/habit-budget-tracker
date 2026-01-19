import React from "react";
export default function ProgressCircle({ percent = 0, size = 80 }) {
  // Ensure percent is a valid number
  const safePercent = typeof percent === 'number' && !isNaN(percent) ? Math.max(0, Math.min(100, percent)) : 0;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = circ * (safePercent / 100);
  return (
    <svg width={size} height={size} className="block">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={stroke}
        fill="none"
        className="text-gray-200 dark:text-slate-700"
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${dash},${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        className="text-blue-500 dark:text-blue-400 transition-all duration-500"
      />
      {/* Percentage text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        fill="currentColor"
        fontSize={Math.min(size * 0.28, 20)}
        fontWeight="semibold"
        dominantBaseline="central"
        className="text-gray-800 dark:text-white"
      >
        {Math.round(safePercent)}%
      </text>
    </svg>
  );
}



