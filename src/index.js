import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./main.css";
import { API_BASE } from "./utils/constants";

const originalFetch = window.fetch.bind(window);
window.fetch = (input, init = {}) => {
  const url = typeof input === 'string' ? input : input.url;
  const isApiRequest = url.startsWith('/api/') || (API_BASE && url.startsWith(API_BASE));
  if (!isApiRequest) {
    return originalFetch(input, init);
  }

  const token = localStorage.getItem('tgAuthToken');
  const headers = {
    ...(init.headers || {})
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return originalFetch(input, { ...init, headers });
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);






