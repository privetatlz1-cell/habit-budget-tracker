import React, { useCallback, useEffect, useMemo, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { API_BASE } from '../utils/constants';

const AuthContext = React.createContext({
  user: null,
  token: null,
  loading: true,
  isTelegram: false,
  error: null,
  logout: () => {}
});

function parseErrorMessage(error) {
  if (typeof error === 'string') return error;
  if (error && error.error) return error.error;
  return 'Unexpected error. Please try again.';
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = parseErrorMessage(data);
    throw new Error(message);
  }
  return data;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('tgAuthToken'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTelegram, setIsTelegram] = useState(false);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem('tgAuthToken');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const init = async () => {
      const hasInitData = Boolean(WebApp && WebApp.initData);
      setIsTelegram(hasInitData);
      if (!hasInitData) {
        setLoading(false);
        return;
      }

      try {
        const data = await request('/api/telegram/auth', {
          method: 'POST',
          body: JSON.stringify({ initData: WebApp.initData })
        });
        localStorage.setItem('tgAuthToken', data.token);
        setToken(data.token);
        setUser(data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isTelegram,
    error,
    logout
  }), [user, token, loading, isTelegram, error, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}
