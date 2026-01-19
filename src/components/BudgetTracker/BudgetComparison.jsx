import React, { useEffect, useState, useMemo } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import useCurrency from "../../hooks/useCurrency";
import { API_BASE } from "../../utils/constants";
import ProgressCircle from "../HabitTracker/ProgressCircle";

export default function BudgetComparison({ year, month }) {
  const { t, language } = useLanguage();
  const { format, convert } = useCurrency();
  const [actualData, setActualData] = useState({ income: 0, expenses: 0, balance: 0 });
  const [plannedData, setPlannedData] = useState({ plannedIncome: 0, plannedExpenses: 0, plannedBalance: 0 });
  const [loading, setLoading] = useState(false);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);

  useEffect(() => {
    loadComparisonData();
  }, [year, month]);

  const loadComparisonData = async () => {
    setLoading(true);
    try {
      // Load actual data
      const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
      const nextMonthStart = month === 12 
        ? `${year + 1}-01-01`
        : `${year}-${String(month + 1).padStart(2, '0')}-01`;
      
      const [actualRes, plannedRes] = await Promise.all([
        fetch(`${API_BASE}/api/budget`).then(r => r.json()),
        fetch(`${API_BASE}/api/budget-plans/summary?year=${year}&month=${month}`).then(r => r.json())
      ]);

      // Calculate actual totals for the month
      const monthItems = actualRes.filter(item => {
        const itemDate = (item.date || '').slice(0, 10);
        return itemDate >= monthStart && itemDate < nextMonthStart;
      });

      const actualIncome = monthItems
        .filter(i => i.type === 'income')
        .reduce((sum, i) => sum + (i.amount || 0), 0);
      
      const actualExpenses = monthItems
        .filter(i => i.type === 'expense')
        .reduce((sum, i) => sum + (i.amount || 0), 0);

      setActualData({
        income: actualIncome,
        expenses: actualExpenses,
        balance: actualIncome - actualExpenses
      });

      setPlannedData({
        plannedIncome: plannedRes.plannedIncome || 0,
        plannedExpenses: plannedRes.plannedExpenses || 0,
        plannedBalance: plannedRes.plannedBalance || 0
      });

      // Category breakdown
      const breakdown = [];
      const categories = new Set([
        ...monthItems.map(i => i.category),
        ...(plannedRes.plans || []).map(p => p.category)
      ]);

      categories.forEach(category => {
        const actualIncome = monthItems
          .filter(i => i.category === category && i.type === 'income')
          .reduce((sum, i) => sum + (i.amount || 0), 0);
        
        const actualExpense = monthItems
          .filter(i => i.category === category && i.type === 'expense')
          .reduce((sum, i) => sum + (i.amount || 0), 0);
        
        const plannedIncome = (plannedRes.plans || [])
          .filter(p => p.category === category && p.type === 'income')
          .reduce((sum, p) => sum + (p.plannedAmount || 0), 0);
        
        const plannedExpense = (plannedRes.plans || [])
          .filter(p => p.category === category && p.type === 'expense')
          .reduce((sum, p) => sum + (p.plannedAmount || 0), 0);

        if (actualIncome > 0 || actualExpense > 0 || plannedIncome > 0 || plannedExpense > 0) {
          breakdown.push({
            category,
            actualIncome,
            actualExpense,
            plannedIncome,
            plannedExpense,
            incomeDiff: actualIncome - plannedIncome,
            expenseDiff: actualExpense - plannedExpense
          });
        }
      });

      setCategoryBreakdown(breakdown);
    } catch (error) {
      console.error('Failed to load comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  const incomeDiff = useMemo(() => {
    return actualData.income - plannedData.plannedIncome;
  }, [actualData.income, plannedData.plannedIncome]);

  const expenseDiff = useMemo(() => {
    return actualData.expenses - plannedData.plannedExpenses;
  }, [actualData.expenses, plannedData.plannedExpenses]);

  const balanceDiff = useMemo(() => {
    return actualData.balance - plannedData.plannedBalance;
  }, [actualData.balance, plannedData.plannedBalance]);

  const incomeProgress = useMemo(() => {
    if (plannedData.plannedIncome === 0) return 0;
    return Math.min(100, (actualData.income / plannedData.plannedIncome) * 100);
  }, [actualData.income, plannedData.plannedIncome]);

  const expenseProgress = useMemo(() => {
    if (plannedData.plannedExpenses === 0) return 0;
    return Math.min(100, (actualData.expenses / plannedData.plannedExpenses) * 100);
  }, [actualData.expenses, plannedData.plannedExpenses]);

  const monthName = new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-slate-400">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 dark:border-green-400"></div>
        <p className="mt-2 text-sm">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
        {t('comparison') || 'Actual vs Planned'} - {monthName}
      </h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income Comparison */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600 dark:text-slate-400">{t('income')}</span>
            <ProgressCircle percent={incomeProgress} size={50} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">{t('actual') || 'Actual'}:</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {format(actualData.income, language)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">{t('planned') || 'Planned'}:</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {format(plannedData.plannedIncome, language)}
              </span>
            </div>
            <div className={`flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-slate-700 ${
              incomeDiff >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              <span className="font-medium">{t('difference') || 'Difference'}:</span>
              <span className="font-semibold">
                {incomeDiff >= 0 ? '+' : ''}{format(incomeDiff, language)}
              </span>
            </div>
          </div>
        </div>

        {/* Expenses Comparison */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600 dark:text-slate-400">{t('expense')}</span>
            <ProgressCircle percent={expenseProgress} size={50} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">{t('actual') || 'Actual'}:</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {format(actualData.expenses, language)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">{t('planned') || 'Planned'}:</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {format(plannedData.plannedExpenses, language)}
              </span>
            </div>
            <div className={`flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-slate-700 ${
              expenseDiff <= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              <span className="font-medium">{t('difference') || 'Difference'}:</span>
              <span className="font-semibold">
                {expenseDiff >= 0 ? '+' : ''}{format(expenseDiff, language)}
              </span>
            </div>
          </div>
        </div>

        {/* Balance Comparison */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600 dark:text-slate-400">{t('balance')}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">{t('actual') || 'Actual'}:</span>
              <span className={`font-semibold ${
                actualData.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {format(actualData.balance, language)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">{t('planned') || 'Planned'}:</span>
              <span className={`font-semibold ${
                plannedData.plannedBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {format(plannedData.plannedBalance, language)}
              </span>
            </div>
            <div className={`flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-slate-700 ${
              balanceDiff >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              <span className="font-medium">{t('difference') || 'Difference'}:</span>
              <span className="font-semibold">
                {balanceDiff >= 0 ? '+' : ''}{format(balanceDiff, language)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <h4 className="font-semibold text-gray-800 dark:text-white">{t('categoryBreakdown') || 'Category Breakdown'}</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-700/50">
                  <th className="py-3 px-4">{t('category')}</th>
                  <th className="py-3 text-right">{t('income')} ({t('actual') || 'A'}/{t('planned') || 'P'})</th>
                  <th className="py-3 text-right">{t('expense')} ({t('actual') || 'A'}/{t('planned') || 'P'})</th>
                  <th className="py-3 text-right">{t('difference') || 'Diff'}</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map((item, idx) => (
                  <tr key={idx} className="border-t border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-gray-800 dark:text-white">
                      {item.category}
                    </td>
                    <td className="py-3 text-right text-sm text-gray-800 dark:text-white">
                      {item.actualIncome > 0 || item.plannedIncome > 0 ? (
                        <span>
                          {format(item.actualIncome, language)} / {format(item.plannedIncome, language)}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-3 text-right text-sm text-gray-800 dark:text-white">
                      {item.actualExpense > 0 || item.plannedExpense > 0 ? (
                        <span>
                          {format(item.actualExpense, language)} / {format(item.plannedExpense, language)}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex flex-col items-end gap-1">
                        {item.incomeDiff !== 0 && (
                          <span className={`text-xs font-medium ${
                            item.incomeDiff >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {t('income')}: {item.incomeDiff >= 0 ? '+' : ''}{format(item.incomeDiff, language)}
                          </span>
                        )}
                        {item.expenseDiff !== 0 && (
                          <span className={`text-xs font-medium ${
                            item.expenseDiff <= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {t('expense')}: {item.expenseDiff >= 0 ? '+' : ''}{format(item.expenseDiff, language)}
                          </span>
                        )}
                        {item.incomeDiff === 0 && item.expenseDiff === 0 && (
                          <span className="text-xs text-gray-400 dark:text-slate-500">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


