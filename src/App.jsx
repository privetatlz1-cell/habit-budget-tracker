import React, { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import Dashboard from './components/Dashboard';
import LandingPage from './components/Landing/LandingPage';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/Shared/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import useTelegramWebApp from './hooks/useTelegramWebApp';

function AppContent() {
  const { user, loading, isTelegram, error, logout } = useAuth();
  const [view, setView] = useState('home');

  useTelegramWebApp();

  useEffect(() => {
    if (!WebApp?.BackButton) return;
    const handleBack = () => setView('home');
    if (view === 'dashboard') {
      WebApp.BackButton.show();
      WebApp.BackButton.onClick(handleBack);
    } else {
      WebApp.BackButton.hide();
    }
    return () => {
      WebApp.BackButton.offClick(handleBack);
    };
  }, [view]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-gray-500">
        Loading your workspace...
      </div>
    );
  }

  if (!isTelegram) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center text-sm text-gray-500 px-6">
        Open this app inside Telegram to continue.
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center text-sm text-red-600 px-6">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-6xl p-4 md:p-6">
        {view === 'dashboard' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between card px-4 py-3">
              <div className="text-sm">
                @{user?.username || user?.firstName || 'Telegram user'}
              </div>
              <button className="btn-soft btn-blue" onClick={logout}>Log out</button>
            </div>
            <Dashboard />
          </div>
        ) : (
          <LandingPage onOpenDashboard={() => setView('dashboard')} user={user} />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;



