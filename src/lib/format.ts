const symbol = (c: "USD" | "EUR") => (c === "USD" ? "$" : "€");

/** Número con separador de miles siempre (es-ES lo omite en números de 4 cifras). */
function fmt(n: number): string {
  return n.toLocaleString("es-ES", {
    maximumFractionDigits: n < 1 ? 3 : n < 100 ? 2 : 0,
    useGrouping: "always",
  } as Intl.NumberFormatOptions);
}

/** «1.200 $» */
export function money(n: number, currency: "USD" | "EUR" = "USD"): string {
  return `${fmt(n)} ${symbol(currency)}`;
}

/** Rango compacto: «1.200–4.800 $» */
export function moneyRange(min: number, max: number, currency: "USD" | "EUR" = "USD"): string {
  if (fmt(min) === fmt(max)) return money(min, currency);
  return `${fmt(min)}–${fmt(max)} ${symbol(currency)}`;
}

export function num(n: number): string {
  return Math.round(n).toLocaleString("es-ES", {
    useGrouping: "always",
  } as Intl.NumberFormatOptions);
}
