import React, { useMemo } from 'react';

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
  return (
    <div className="relative overflow-hidden">
      <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-primary-purple/20 blur-3xl" />
      <div className="absolute top-32 -left-24 h-64 w-64 rounded-full bg-semantic-pink/20 blur-3xl" />

      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center py-10 md:py-16">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-purple/10 text-primary-purple px-4 py-2 text-xs font-semibold">
            Habit & Budget Tracker
            <span className="h-1.5 w-1.5 rounded-full bg-primary-purple" />
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            Build habits, master budgets, and keep wellness in sync.
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-neutral-light">
            A calm, beautiful workspace for everyday progress. Track routines, plan expenses, and
            manage tasks with clarity—designed for focus and ease.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="tg-button" onClick={handleOpenDashboard} type="button">
              Open your dashboard
            </button>
            <button className="btn-soft btn-blue" type="button">Explore features</button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard
              title="Habit flow"
              description="Weekly streaks, smart reminders, and gentle nudges that keep momentum."
              icon={<span className="text-xl">🌿</span>}
              tone="green"
            />
            <FeatureCard
              title="Budget clarity"
              description="Plan monthly goals and watch spending balance itself with live insights."
              icon={<span className="text-xl">💸</span>}
              tone="violet"
            />
            <FeatureCard
              title="Task studio"
              description="Visual boards for priorities, subtasks, and lightweight notes."
              icon={<span className="text-xl">🗂️</span>}
              tone="blue"
            />
            <FeatureCard
              title="Wellness notes"
              description="Daily reflections, sleep tracking, and mindful highlights."
              icon={<span className="text-xl">🧘</span>}
              tone="pink"
            />
          </div>
        </div>

        <div className="relative">
          <div className="absolute -top-8 -left-6">
            <FloatingStat label="Streak" value="28 days" accent="text-[#10B981]" />
          </div>
          <div className="absolute -bottom-8 right-4">
            <FloatingStat label="Savings" value="$420" accent="text-semantic-blue" />
          </div>
          <div className="card p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Welcome back</h3>
              <p className="text-sm">
                {user ? `Hi ${user.firstName || user.username || 'there'} — your progress is ready.` : 'Syncing your Telegram profile...'}
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-white/60 dark:bg-[#353844] px-4 py-3">
                <span className="text-sm">Daily focus</span>
                <span className="font-semibold text-gray-900 dark:text-white">4 habits</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/60 dark:bg-[#353844] px-4 py-3">
                <span className="text-sm">Budget pulse</span>
                <span className="font-semibold text-gray-900 dark:text-white">$1,240 left</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/60 dark:bg-[#353844] px-4 py-3">
                <span className="text-sm">Tasks in flow</span>
                <span className="font-semibold text-gray-900 dark:text-white">6 open</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Habits that stick</h3>
            <p className="text-sm mt-2">Visual streaks, calendar focus, and daily check-ins tailored to your pace.</p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Budgeting made human</h3>
            <p className="text-sm mt-2">Plan with intention, categorize expenses, and see live monthly summaries.</p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Wellness & planning</h3>
            <p className="text-sm mt-2">Sleep notes, mood checkpoints, and task boards keep your week balanced.</p>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="card p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Everything you need in one calm workspace.
            </h2>
            <p className="text-sm md:text-base">
              No clutter, no noise. Only the tools you need to nurture habits, plan budgets, and move
              through your week with confidence.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="btn-soft btn-green">Explore features</button>
            <button className="btn-soft btn-pink">See templates</button>
          </div>
        </div>
      </section>
    </div>
  );
}
