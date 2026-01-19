export function formatCurrency(value) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value);
  } catch {
    return `$${Number(value || 0).toFixed(2)}`;
  }
}






