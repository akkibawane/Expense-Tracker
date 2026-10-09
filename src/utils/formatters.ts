import { CurrencyCode } from '../types';
import { CURRENCIES } from './constants';

export const formatCurrency = (
  amountInINR: number,
  currencyCode: CurrencyCode = 'INR',
  options: { showSymbol?: boolean; decimals?: number; allowNegative?: boolean } = {}
): string => {
  const { showSymbol = true, decimals = 0, allowNegative = false } = options;
  const config = CURRENCIES[currencyCode] || CURRENCIES.INR;
  const nonNegative = allowNegative ? (amountInINR || 0) : Math.max(0, amountInINR || 0);
  const converted = nonNegative * config.rateAgainstINR;

  const formatted = new Intl.NumberFormat(
    currencyCode === 'INR' ? 'en-IN' : 'en-US',
    {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }
  ).format(converted);

  return showSymbol ? `${config.symbol}${formatted}` : formatted;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatShortMonth = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short' });
};

export const getDaysRemaining = (targetDateString: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDateString);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const exportToCSV = (filename: string, rows: Record<string, any>[]) => {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          let val = row[header];
          if (val === null || val === undefined) val = '';
          val = String(val).replace(/"/g, '""');
          return `"${val}"`;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (filename: string, data: any) => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const link = document.createElement('a');
  link.setAttribute('href', jsonString);
  link.setAttribute('download', `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
