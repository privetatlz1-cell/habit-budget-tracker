import React, { useEffect, useMemo, useState } from "react";
import PieChart from "./PieChart";
import BarChart from "./BarChart";
import BudgetPlanForm from "./BudgetPlanForm";
import BudgetComparison from "./BudgetComparison";
import { useLanguage } from "../../contexts/LanguageContext";
import useCurrency from "../../hooks/useCurrency";
import { useToast } from "../Shared/Toast";
import { API_BASE } from "../../utils/constants";

export default function BudgetList({ onChanged = () => {} }) {
  const [activeTab, setActiveTab] = useState("actual");
  const [items, setItems] = useState([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("expense");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { t, budgetCategories, language } = useLanguage();
  const { format, convertToUSD, getSymbol, stale } = useCurrency();
  const { showToast } = useToast();
  const [customCat, setCustomCat] = useState("");
  const [savedCats, setSavedCats] = useState([]);
  
  // Current month/year for planning
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API_BASE}/api/budget`);
      if (!r.ok) throw new Error('Failed to load');
      const data = await r.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) { 
      setError(t('errorLoad'));
      showToast(t('errorLoad'), 'error');
    }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem('budgetCustomCats') || '[]');
      setSavedCats(Array.isArray(c) ? c : []);
    } catch { setSavedCats([]); }
  }, []);

  // Clear amount input when language changes to avoid confusion
  useEffect(() => {
    setAmount("");
  }, [language]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast(t('invalidAmount'), 'error');
      return;
    }

    const finalCategory = category === 'Custom' && customCat.trim() ? customCat.trim() : category;
    if (!finalCategory || finalCategory.trim() === '') {
      showToast(t('categoryRequired'), 'error');
      return;
    }

    // Convert input amount to USD before saving
    // If lang=ru, user entered RUB, so convert RUB to USD
    // If lang=en, user entered USD, so use as-is
    const amountInUSD = convertToUSD(numAmount, language);

    try {
      const res = await fetch(`${API_BASE}/api/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: amountInUSD, 
          category: finalCategory, 
          type, 
          description: description.trim() || null, 
          date 
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || t('errorAdd'));
      }

      const newItem = await res.json();
      await load();
      if (onChanged) onChanged();
      
      // Save custom category if used
      if (category === 'Custom' && customCat.trim()) {
        const next = Array.from(new Set([...(savedCats||[]), customCat.trim()]));
        setSavedCats(next);
        try { localStorage.setItem('budgetCustomCats', JSON.stringify(next)); } catch {}
        setCustomCat("");
      }
      
      // Clear form
      setAmount("");
      setCategory("");
      setDescription("");
      setType("expense");
      setDate(new Date().toISOString().slice(0,10));
      
      showToast(t('successAdd'), 'success');
    } catch (e) {
      showToast(e.message || t('errorAdd'), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('deleteItem') + '?')) return;
    try {
      const res = await fetch(`/api/budget/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(t('errorDelete'));
      await load();
      if (onChanged) onChanged();
      showToast(t('successDelete'), 'success');
    } catch (e) { 
      showToast(t('errorDelete'), 'error');
    }
  };

  const monthKey = (d) => d.slice(0,7);
  const nowMonth = new Date().toISOString().slice(0,7);

  const monthlySummary = useMemo(() => {
    const monthItems = items.filter(i => (i.date || '').slice(0,7) === nowMonth);
    const income = monthItems.filter(i=>i.type==='income').reduce((a,b)=>a + (b.amount||0),0);
    const expense = monthItems.filter(i=>i.type==='expense').reduce((a,b)=>a + (b.amount||0),0);
    return { income, expense, balance: income - expense };
  }, [items, nowMonth]);

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-neutral-medium/30">
        <button
          onClick={() => setActiveTab("actual")}
              className={`px-4 py-2 text-sm font-semibold transition-all duration-200 border-b-2 ${
            activeTab === "actual"
              ? "border-[#10B981] text-gray-900 dark:text-white"
              : "border-transparent text-gray-500 dark:text-neutral-light hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          {t('actual') || 'Actual'}
        </button>
        <button
          onClick={() => setActiveTab("planned")}
              className={`px-4 py-2 text-sm font-semibold transition-all duration-200 border-b-2 ${
            activeTab === "planned"
              ? "border-primary-purple text-gray-900 dark:text-white"
              : "border-transparent text-gray-500 dark:text-neutral-light hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          {t('planned') || 'Planned'}
        </button>
        <button
          onClick={() => setActiveTab("comparison")}
              className={`px-4 py-2 text-sm font-semibold transition-all duration-200 border-b-2 ${
            activeTab === "comparison"
              ? "border-semantic-pink text-gray-900 dark:text-white"
              : "border-transparent text-gray-500 dark:text-neutral-light hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          {t('comparison') || 'Comparison'}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "actual" && (
        <>
          {/* Add Budget Form */}
          <form onSubmit={handleSubmit} className="card p-5 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('yourBudget')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <select 
            value={type} 
            onChange={e => setType(e.target.value)} 
            className="px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#2C2F3A] text-gray-900 dark:text-white border border-gray-200 dark:border-neutral-medium/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none transition-all"
          >
            <option value="income">{t('income')}</option>
            <option value="expense">{t('expense')}</option>
          </select>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-light font-medium">
              {getSymbol(language)}
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder={t('amount')}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#2C2F3A] text-gray-900 dark:text-white border border-gray-200 dark:border-neutral-medium/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none transition-all placeholder-gray-400 dark:placeholder-neutral-medium"
              required
            />
          </div>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#2C2F3A] text-gray-900 dark:text-white border border-gray-200 dark:border-neutral-medium/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none transition-all whitespace-nowrap min-w-[8.5rem]"
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#2C2F3A] text-gray-900 dark:text-white border border-gray-200 dark:border-neutral-medium/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none transition-all"
            required
          >
            <option value="">{t('category')}</option>
            {[...budgetCategories, ...(savedCats||[])].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="Custom">Custom</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {category === 'Custom' ? (
            <input
              type="text"
              value={customCat}
              onChange={e => setCustomCat(e.target.value)}
              placeholder={t('category')}
              className="px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#2C2F3A] text-gray-900 dark:text-white border border-gray-200 dark:border-neutral-medium/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none transition-all placeholder-gray-400 dark:placeholder-neutral-medium"
              required
            />
          ) : (
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('descriptionOptional')}
              className="px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#2C2F3A] text-gray-900 dark:text-white border border-gray-200 dark:border-neutral-medium/30 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/30 outline-none transition-all placeholder-gray-400 dark:placeholder-neutral-medium"
            />
          )}
        </div>
        <button
          type="submit"
          className="btn-soft btn-primary"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('add')}
          </span>
        </button>
      </form>

      {loading && (
        <div className="text-center py-8 text-gray-500 dark:text-neutral-light">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-purple"></div>
          <p className="mt-2 text-sm">{t('loading')}</p>
        </div>
      )}
      {error && (
        <div className="card p-4 mb-4 bg-semantic-pink/20 dark:bg-semantic-pink/20 border-semantic-pink/30">
          <p className="text-sm text-semantic-pink">{error}</p>
        </div>
      )}
      {stale && (
        <div className="text-xs text-semantic-yellow mb-2 px-2">Rate may be outdated</div>
      )}

      {/* Monthly Summary */}
      <div className="card p-5 mb-6 bg-gradient-to-r from-[#10B981]/10 to-primary-purple/10 dark:from-[#10B981]/20 dark:to-primary-purple/20 border border-primary-purple/20 dark:border-primary-purple/30">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">{t('monthlyIncome')}</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-500 dark:text-neutral-light mb-1">{t('income')}</div>
            <div className="text-lg font-bold text-[#10B981]">{format(monthlySummary.income, language)}</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-neutral-light mb-1">{t('expense')}</div>
            <div className="text-lg font-bold text-semantic-pink">{format(monthlySummary.expense, language)}</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-neutral-light mb-1">{t('balance')}</div>
            <div className={`text-lg font-bold ${monthlySummary.balance >= 0 ? 'text-[#10B981]' : 'text-semantic-pink'}`}>
              {format(monthlySummary.balance, language)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Items Table */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-neutral-medium/30">
            <h4 className="font-semibold text-gray-900 dark:text-white">{t('yourBudget')}</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 dark:text-neutral-light bg-gray-50 dark:bg-[#353844] uppercase tracking-wide">
                  <th className="py-3 px-4">{t('date')}</th>
                  <th className="py-3">{t('category')}</th>
                  <th className="py-3">{t('type')}</th>
                  <th className="py-3 text-right">{t('amount')}</th>
                  <th className="py-3 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500 dark:text-neutral-light text-sm">
                      No budget items yet
                    </td>
                  </tr>
                ) : (
                  items.map(item => (
                    <tr key={item.id} className="border-t border-gray-200 dark:border-neutral-medium/30 hover:bg-gray-50 dark:hover:bg-[#353844] transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">{item.date}</td>
                      <td className="py-3 text-sm text-gray-900 dark:text-white">{item.category}</td>
                      <td className="py-3">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-lg ${
                          item.type === "expense" 
                            ? "bg-semantic-pink/20 dark:bg-semantic-pink/20 text-semantic-pink border border-semantic-pink/30" 
                            : "bg-[#10B981]/20 dark:bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
                        }`}>
                          {item.type === 'expense' ? t('expense') : t('income')}
                        </span>
                      </td>
                      <td className="py-3 text-right text-sm font-bold text-gray-900 dark:text-white">
                        {format(item.amount, language)}
                      </td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => handleDelete(item.id)} 
                          className="icon-btn hover:bg-semantic-pink/20 border-semantic-pink/30" 
                          aria-label={t('deleteItem')}
                          title={t('delete')}
                        >
                          <svg className="w-4 h-4 text-semantic-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-6">
          <div className="card p-4">
            <PieChart data={items} />
          </div>
          <div className="card p-4">
            <BarChart data={items} />
          </div>
        </div>
      </div>
        </>
      )}

      {activeTab === "planned" && (
        <div className="space-y-6">
          {/* Month/Year Selector */}
          <div className="card p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                {t('selectMonth') || 'Select Month/Year'}:
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="px-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-white border border-gray-300 dark:border-slate-600 focus:border-[#BFDBFE] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#BFDBFE]/30 dark:focus:ring-blue-400/20 outline-none transition-all"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>
                    {new Date(selectedYear, m - 1, 1).toLocaleDateString(undefined, { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="px-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-white border border-gray-300 dark:border-slate-600 focus:border-[#BFDBFE] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#BFDBFE]/30 dark:focus:ring-blue-400/20 outline-none transition-all"
              >
                {Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <BudgetPlanForm 
            year={selectedYear} 
            month={selectedMonth}
            onSave={() => {
              if (onChanged) onChanged();
            }}
          />
        </div>
      )}

      {activeTab === "comparison" && (
        <div className="space-y-6">
          {/* Month/Year Selector */}
          <div className="card p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                {t('selectMonth') || 'Select Month/Year'}:
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="px-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-white border border-gray-300 dark:border-slate-600 focus:border-[#BFDBFE] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#BFDBFE]/30 dark:focus:ring-blue-400/20 outline-none transition-all"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>
                    {new Date(selectedYear, m - 1, 1).toLocaleDateString(undefined, { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="px-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-white border border-gray-300 dark:border-slate-600 focus:border-[#BFDBFE] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#BFDBFE]/30 dark:focus:ring-blue-400/20 outline-none transition-all"
              >
                {Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <BudgetComparison year={selectedYear} month={selectedMonth} />
        </div>
      )}
    </div>
  );
}
