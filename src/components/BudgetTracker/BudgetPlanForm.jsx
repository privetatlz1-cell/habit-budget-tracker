import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import useCurrency from "../../hooks/useCurrency";
import { useToast } from "../Shared/Toast";
import { API_BASE } from "../../utils/constants";

export default function BudgetPlanForm({ year, month, onSave, onCancel }) {
  const { t, budgetCategories, language } = useLanguage();
  const { format, convertToUSD, getSymbol } = useCurrency();
  const { showToast } = useToast();
  
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newPlan, setNewPlan] = useState({
    category: "",
    type: "expense",
    plannedAmount: ""
  });

  useEffect(() => {
    loadPlans();
  }, [year, month]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/budget-plans?year=${year}&month=${month}`);
      if (!res.ok) throw new Error('Failed to load plans');
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load plans:', error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = async (e) => {
    e.preventDefault();
    
    if (!newPlan.category || !newPlan.plannedAmount) {
      showToast(t('allFieldsRequired') || 'All fields are required', 'error');
      return;
    }

    const numAmount = parseFloat(newPlan.plannedAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast(t('invalidAmount'), 'error');
      return;
    }

    // Convert to USD for storage (if needed)
    const amountInUSD = convertToUSD(numAmount, language);

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/budget-plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          month,
          category: newPlan.category.trim(),
          type: newPlan.type,
          plannedAmount: amountInUSD
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || t('errorAdd'));
      }

      await loadPlans();
      setNewPlan({ category: "", type: "expense", plannedAmount: "" });
      showToast(t('successAdd'), 'success');
    } catch (error) {
      showToast(error.message || t('errorAdd'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm(t('deletePlanConfirm') || 'Delete this plan?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/budget-plans/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(t('errorDelete'));
      await loadPlans();
      showToast(t('successDelete'), 'success');
    } catch (error) {
      showToast(t('errorDelete'), 'error');
    }
  };

  const monthName = new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {t('budgetPlan') || 'Budget Plan'} - {monthName}
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
          >
            {t('cancel') || 'Cancel'}
          </button>
        )}
      </div>

      {/* Add Plan Form */}
      <form onSubmit={handleAddPlan} className="card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={newPlan.type}
            onChange={(e) => setNewPlan({ ...newPlan, type: e.target.value })}
            className="px-4 py-2.5 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-white border border-gray-300 dark:border-slate-600 focus:border-[#BFDBFE] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#BFDBFE]/30 dark:focus:ring-blue-400/20 outline-none transition-all"
          >
            <option value="income">{t('income')}</option>
            <option value="expense">{t('expense')}</option>
          </select>
          
          <select
            value={newPlan.category}
            onChange={(e) => setNewPlan({ ...newPlan, category: e.target.value })}
            className="px-4 py-2.5 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-white border border-gray-300 dark:border-slate-600 focus:border-[#BFDBFE] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#BFDBFE]/30 dark:focus:ring-blue-400/20 outline-none transition-all"
            required
          >
            <option value="">{t('category')}</option>
            {budgetCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 font-medium">
              {getSymbol(language)}
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={newPlan.plannedAmount}
              onChange={(e) => setNewPlan({ ...newPlan, plannedAmount: e.target.value })}
              placeholder={t('plannedAmount') || 'Planned amount'}
              className="w-full pl-8 pr-4 py-2.5 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-white border border-gray-300 dark:border-slate-600 focus:border-[#BFDBFE] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#BFDBFE]/30 dark:focus:ring-blue-400/20 outline-none transition-all"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={saving}
            className="btn-soft btn-blue disabled:opacity-50"
          >
            {saving ? t('saving') || 'Saving...' : t('add') || 'Add'}
          </button>
        </div>
      </form>

      {/* Plans List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500 dark:text-slate-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-2 text-sm">{t('loading')}</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500 dark:text-slate-400">{t('noPlans') || 'No plans yet. Add your first plan above.'}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-700/50">
                  <th className="py-3 px-4">{t('type')}</th>
                  <th className="py-3">{t('category')}</th>
                  <th className="py-3 text-right">{t('plannedAmount') || 'Planned'}</th>
                  <th className="py-3 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {plans.map(plan => (
                  <tr key={plan.id} className="border-t border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        plan.type === "expense" 
                          ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400" 
                          : "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                      }`}>
                        {plan.type === 'expense' ? t('expense') : t('income')}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-800 dark:text-white">{plan.category}</td>
                    <td className="py-3 text-right text-sm font-medium text-gray-800 dark:text-white">
                      {format(plan.plannedAmount, language)}
                    </td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => handleDeletePlan(plan.id)} 
                        className="icon-btn hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800" 
                        aria-label={t('delete')}
                        title={t('delete')}
                      >
                        <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
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

