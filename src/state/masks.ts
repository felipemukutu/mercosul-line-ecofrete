/** Input masks (SPEC §7.1). Every mask receives the raw typed text. */

const digitsOf = (value: string) => value.replace(/\D/g, '');

/** 00.000.000/0000-00 */
export function maskCnpj(value: string): string {
  const d = digitsOf(value).slice(0, 14);
  let out = d.slice(0, 2);
  if (d.length > 2) out += '.' + d.slice(2, 5);
  if (d.length > 5) out += '.' + d.slice(5, 8);
  if (d.length > 8) out += '/' + d.slice(8, 12);
  if (d.length > 12) out += '-' + d.slice(12, 14);
  return out;
}

/** CNPJ check digits (Receita Federal algorithm). */
export function isValidCnpj(value: string): boolean {
  const d = digitsOf(value);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const calc = (len: number) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = weights.reduce((acc, w, i) => acc + Number(d[i]) * w, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  return calc(12) === Number(d[12]) && calc(13) === Number(d[13]);
}

/** R$ 0.000,00 — digits are read as cents. */
export function maskCurrency(value: string): string {
  const d = digitsOf(value).replace(/^0+/, '').slice(0, 11);
  if (!d) return '';
  const cents = d.padStart(3, '0');
  const int = cents.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${int},${cents.slice(-2)}`;
}

/** Temperature in °C — accepts a leading minus and one decimal (e.g. -18,5). */
export function maskTemperature(value: string): string {
  const negative = value.trim().startsWith('-');
  const [intRaw = '', ...decParts] = value.replace(/[^\d,]/g, '').split(',');
  const int = intRaw.slice(0, 3);
  const hasComma = value.includes(',') && int.length > 0;
  const dec = decParts.join('').slice(0, 1);
  return `${negative ? '-' : ''}${int}${hasComma ? ',' + dec : ''}`;
}

/** Variation ± °C — non-negative, one decimal. */
export function maskVariation(value: string): string {
  return maskTemperature(value.replace('-', ''));
}

/** Weight in kg — integer with thousands separator. */
export function maskWeight(value: string): string {
  const d = digitsOf(value).replace(/^0+/, '').slice(0, 7);
  return d.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Positive integer (no leading zeros), optionally capped. */
export function maskInteger(value: string, max?: number, maxDigits = 6): string {
  const d = digitsOf(value).replace(/^0+/, '').slice(0, maxDigits);
  if (!d) return '';
  if (max !== undefined && Number(d) > max) return String(max);
  return d;
}
