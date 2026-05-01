export const formatCurrency = (amount, currency = "E") => {
  if (amount === null || amount === undefined || isNaN(amount))
    return `${currency}0.00`;
  const num = parseFloat(amount);
  return `${currency}${num.toLocaleString("en-SZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};