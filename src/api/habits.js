import { API_BASE } from '../utils/constants';

export async function fetchHabits() {
  const res = await fetch(`${API_BASE}/api/habits`);
  if (!res.ok) throw new Error('Failed to fetch habits');
  return res.json();
}






