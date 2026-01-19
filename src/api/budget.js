import { API_BASE } from '../utils/constants';

export async function fetchBudget() {
  const res = await fetch(`${API_BASE}/api/budget`);
  if (!res.ok) throw new Error('Failed to fetch budget');
  return res.json();
}






