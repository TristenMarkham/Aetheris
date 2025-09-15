// src/utils/helpers.js
export const formatNumber = (value) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0';
  }
  return value.toLocaleString();
};

export const formatCurrency = (value) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '$0';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

export const formatDate = (date, options = {}) => {
  const {
    dateStyle = 'medium',
    timeStyle,
    includeTime = false
  } = options;

  if (!date) return 'Never';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const formatOptions = { dateStyle };
  if (includeTime && timeStyle) {
    formatOptions.timeStyle = timeStyle;
  }

  return new Intl.DateTimeFormat('en-US', formatOptions).format(dateObj);
};