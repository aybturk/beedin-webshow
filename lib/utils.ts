export function formatPrice(price: number, currencyDisplay = "TRY"): string {
  if (!price) return "";
  if (currencyDisplay === "TRY") {
    return `${Math.round(price).toLocaleString("tr-TR")} ₺`;
  }
  if (currencyDisplay === "EUR") {
    return `€${price.toLocaleString("en-EU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${price.toLocaleString()} ${currencyDisplay}`;
}
