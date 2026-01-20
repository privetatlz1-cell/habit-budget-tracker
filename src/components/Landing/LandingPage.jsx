import React, { useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

function FeatureCard({ title, description, icon, tone }) {
  const toneStyles = useMemo(() => ({
    violet: 'bg-primary-purple/10 text-primary-purple border-primary-purple/20',
    blue: 'bg-semantic-blue/10 text-semantic-blue border-semantic-blue/20',
    green: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
    pink: 'bg-semantic-pink/10 text-semantic-pink border-semantic-pink/20'
  }), []);

  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center ${toneStyles[tone]}`}>
        {icon}
      </div>
      <div>
        <h4 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h4>
        <p className="text-sm mt-1">{description}</p>
      </div>
    </div>
  );
}

function FloatingStat({ label, value, accent }) {
  return (
    <div className="card px-4 py-3 shadow-xl">
      <div className={`text-xs font-semibold uppercase tracking-wide ${accent}`}>{label}</div>
      <div className="text-lg font-bold text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}

export default function LandingPage({ onOpenDashboard, user }) {
  const handleOpenDashboard = onOpenDashboard || (() => {});
  const { t } = useLanguage();
  return (
    <div className="relative overflow-hidden">
      <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-primary-purple/20 blur-3xl" />
      <div className="absolute top-32 -left-24 h-64 w-64 rounded-full bg-semantic-pink/20 blur-3xl" />

      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center py-10 md:py-16">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-purple/10 text-primary-purple px-4 py-2 text-xs font-semibold">
            {t('landingBadge')}
            <span className="h-1.5 w-1.5 rounded-full bg-primary-purple" />
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            {t('landingTitle')}
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-neutral-light">
            {t('landingSubtitle')}
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="tg-button" onClick={handleOpenDashboard} type="button">
              {t('landingOpenDashboard')}
            </button>
            <button className="btn-soft btn-blue" type="button">{t('landingExplore')}</button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard
              title={t('landingHabitsTitle')}
              description={t('landingHabitsDesc')}
              icon={<span className="text-xl">🌿</span>}
              tone="green"
            />
            <FeatureCard
              title={t('landingBudgetTitle')}
              description={t('landingBudgetDesc')}
              icon={<span className="text-xl">💸</span>}
              tone="violet"
            />
            <FeatureCard
              title={t('landingTasksFlow')}
              description={t('landingWellnessDesc')}
              icon={<span className="text-xl">🗂️</span>}
              tone="blue"
            />
            <FeatureCard
              title={t('landingWellnessTitle')}
              description={t('landingWellnessDesc')}
              icon={<span className="text-xl">🧘</span>}
              tone="pink"
            />
          </div>
        </div>

        <div className="relative">
          <div className="absolute -top-8 -left-6 hidden sm:block">
            <FloatingStat label="Streak" value="28 days" accent="text-[#10B981]" />
          </div>
          <div className="absolute -bottom-8 right-4 hidden sm:block">
            <FloatingStat label="Savings" value="$420" accent="text-semantic-blue" />
          </div>
          <div className="card p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('landingWelcome')}</h3>
              <p className="text-sm">
                {user ? `Hi ${user.firstName || user.username || 'there'} — ${t('landingSummaryDesc')}` : t('landingSyncing')}
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-white/60 dark:bg-[#353844] px-4 py-3">
                <span className="text-sm">{t('landingDailyFocus')}</span>
                <span className="font-semibold text-gray-900 dark:text-white">4 habits</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/60 dark:bg-[#353844] px-4 py-3">
                <span className="text-sm">{t('landingBudgetPulse')}</span>
                <span className="font-semibold text-gray-900 dark:text-white">$1,240 left</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/60 dark:bg-[#353844] px-4 py-3">
                <span className="text-sm">{t('landingTasksFlow')}</span>
                <span className="font-semibold text-gray-900 dark:text-white">6 open</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('landingHabitsTitle')}</h3>
            <p className="text-sm mt-2">{t('landingHabitsDesc')}</p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('landingBudgetTitle')}</h3>
            <p className="text-sm mt-2">{t('landingBudgetDesc')}</p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('landingWellnessTitle')}</h3>
            <p className="text-sm mt-2">{t('landingWellnessDesc')}</p>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="card p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {t('landingSummaryTitle')}
            </h2>
            <p className="text-sm md:text-base">
              {t('landingSummaryDesc')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
