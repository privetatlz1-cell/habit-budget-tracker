import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { COLUMNS } from '../types';

const MetricsCharts = ({ history, tasks }) => {
  // Подготовка данных для Cumulative Flow Diagram
  const cfdData = history.map((h) => ({
    day: h.day,
    ...h.columnDistribution,
  }));

  // Подготовка данных для финансового графика
  const budgetData = history.map((h) => ({
    day: h.day,
    остаток: h.budget,
    потрачено: h.spent,
  }));

  // Подготовка данных для Cycle Time
  const completedTasks = tasks.filter((t) => t.completedDay !== null);
  const cycleTimeData = completedTasks.map((task) => {
    const cycleTime = task.completedDay - (task.startDay || task.createdAt);
    return {
      task: task.title.substring(0, 30) + (task.title.length > 30 ? '...' : ''),
      cycleTime,
      cost: task.cost,
    };
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Cumulative Flow Diagram
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={cfdData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            {COLUMNS.map((col, index) => (
              <Area
                key={col.id}
                type="monotone"
                dataKey={col.id}
                stackId="1"
                stroke={`hsl(${index * 45}, 70%, 50%)`}
                fill={`hsl(${index * 45}, 70%, 50%)`}
                name={col.name}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Финансовый график
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={budgetData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip formatter={(value) => `${value.toLocaleString('ru-RU')} ₽`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="остаток"
              stroke="#10B981"
              strokeWidth={2}
              name="Остаток бюджета"
            />
            <Line
              type="monotone"
              dataKey="потрачено"
              stroke="#F59E0B"
              strokeWidth={2}
              name="Потрачено"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {cycleTimeData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Cycle Time (время выполнения задач)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cycleTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="task" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="cycleTime"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Cycle Time (дни)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default MetricsCharts;

