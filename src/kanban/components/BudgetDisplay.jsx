import React from 'react';

const BudgetDisplay = ({ budget, spent, currentDay }) => {
  const remaining = budget - spent;
  const percentage = (spent / budget) * 100;
  const isOverBudget = remaining < 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Бюджет проекта</h2>
        <span className="text-sm text-gray-600">День {currentDay}</span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Остаток</span>
            <span className={`font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              {remaining.toLocaleString('ru-RU')} ₽
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${
                isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Изначальный бюджет</span>
            <p className="font-semibold text-gray-800">
              {budget.toLocaleString('ru-RU')} ₽
            </p>
          </div>
          <div>
            <span className="text-gray-600">Потрачено</span>
            <p className="font-semibold text-orange-600">
              {spent.toLocaleString('ru-RU')} ₽
            </p>
          </div>
        </div>

        {isOverBudget && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Превышен бюджет!</strong> Проект остановлен.
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetDisplay;

