import React from "react";

/**
 * Widget Component
 * Displays a metric with title, value, and accent color
 * @param {string} title - Widget title
 * @param {string|number} value - Widget value to display
 * @param {string} accent - Accent color: 'green', 'blue', 'pink', 'yellow', or default
 */
const Widget = React.memo(function Widget({ title, value, accent }) {
  const chip =
    accent === "green"
      ? "bg-[#10B981]/20 dark:bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
      : accent === "blue"
      ? "bg-semantic-blue/20 dark:bg-semantic-blue/20 text-semantic-blue border border-semantic-blue/30"
      : accent === "pink"
      ? "bg-semantic-pink/20 dark:bg-semantic-pink/20 text-semantic-pink border border-semantic-pink/30"
      : accent === "yellow"
      ? "bg-semantic-yellow/20 dark:bg-semantic-yellow/20 text-semantic-yellow border border-semantic-yellow/30"
      : "bg-gray-100 dark:bg-[#2C2F3A] text-gray-600 dark:text-neutral-light border border-gray-200 dark:border-neutral-medium/30";
  return (
    <div className="w-full">
      <div className="text-xs font-semibold text-gray-500 dark:text-neutral-light mb-3 uppercase tracking-wide">{title}</div>
      <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl ${chip} shadow-md w-full justify-center`}> 
        <span className="text-xl font-bold whitespace-nowrap">{value}</span>
      </div>
    </div>
  );
});

export default Widget;
