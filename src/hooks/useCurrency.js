import { useEffect, useState, useCallback } from 'react';

const RATE_KEY = 'currencyRateRUB';
const RATE_EXPIRES_KEY = 'currencyRateExpiresAt';

export default function useCurrency() {
  const [rate, setRate] = useState(1);
  const [loading, setLoading] = useState(true);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    const tryLoad = async () => {
      try {
        const expires = parseInt(localStorage.getItem(RATE_EXPIRES_KEY) || '0', 10);
        const cached = localStorage.getItem(RATE_KEY);
        const now = Date.now();
        if (cached && expires && now < expires) {
          setRate(parseFloat(cached));
          setLoading(false);
          return;
        }
      } catch {}
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await res.json();
        const rub = data?.rates?.RUB;
        if (rub) {
          setRate(rub);
          try {
            localStorage.setItem(RATE_KEY, String(rub));
            localStorage.setItem(RATE_EXPIRES_KEY, String(Date.now() + 3600000));
          } catch {}
        }
      } catch (e) {
        try {
          const cached = localStorage.getItem(RATE_KEY);
          if (cached) {
            setRate(parseFloat(cached));
            setStale(true);
          }
        } catch {}
      } finally {
        setLoading(false);
      }
    };
    tryLoad();
  }, []);

  // Convert USD to display currency (USD or RUB)
  const convert = useCallback((usdAmount, lang) => {
    const amt = Number(usdAmount || 0);
    if (lang === 'ru') return amt * rate;
    return amt;
  }, [rate]);

  // Convert display currency (USD or RUB) to USD for storage
  const convertToUSD = useCallback((displayAmount, lang) => {
    const amt = Number(displayAmount || 0);
    if (lang === 'ru') return amt / rate; // Convert RUB to USD
    return amt; // Already USD
  }, [rate]);

  const format = useCallback((usdAmount, lang) => {
    const isRU = lang === 'ru';
    const value = convert(usdAmount, lang);
    const currency = isRU ? 'RUB' : 'USD';
    const locale = isRU ? 'ru-RU' : 'en-US';
    try {
      return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
    } catch {
      const symbol = isRU ? '₽' : '$';
      return `${symbol}${value.toFixed(2)}`;
    }
  }, [convert]);

  const getSymbol = useCallback((lang) => {
    return lang === 'ru' ? '₽' : '$';
  }, []);

  return { rate, loading, stale, convert, convertToUSD, format, getSymbol };
}


