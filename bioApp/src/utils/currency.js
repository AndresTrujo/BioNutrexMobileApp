export function formatCurrencyMXN(value) {
  try {
    const base = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value));
    return `${base} MXN`;
  } catch (e) {
    const s = Number(value).toFixed(2);
    const [intPart, decPart] = s.split('.');
    const withComma = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `$${withComma}.${decPart} MXN`;
  }
}

export function amountColor(value) {
  return Number(value) < 0 ? '#ef4444' : '#10b981';
}