// Safe formatting helper functions

const safeFormatDate = (dateValue, fallback = 'Unknown') => {
  if (!dateValue) return fallback;
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return fallback;
    return date.toLocaleDateString();
  } catch (error) {
    return fallback;
  }
};

const safeFormatNumber = (numberValue, fallback = 0) => {
  if (numberValue === null || numberValue === undefined || isNaN(numberValue)) {
    return fallback;
  }
  return Number(numberValue);
};

const safeFormatCurrency = (amount, fallback = '0') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return fallback;
  }
  return Number(amount).toLocaleString();
};

module.exports = {
  safeFormatDate,
  safeFormatNumber,
  safeFormatCurrency
}; 
