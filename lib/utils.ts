export function formatPrice(priceTry: number, currencyDisplay = "TRY"): string {
  if (!priceTry) return "";
  if (currencyDisplay === "TRY") {
    return `${Math.round(priceTry).toLocaleString("tr-TR")} ₺`;
  }
  return `${Math.round(priceTry).toLocaleString()} ${currencyDisplay}`;
}
