import type { Attendee } from '../types';

export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  const digits = phoneNumber.replace(/\D/g, '');
  if (digits.length !== 11) return phoneNumber;
  return `(${digits.substring(0, 4)}) ${digits.substring(4, 7)}-${digits.substring(7)}`;
};

export const calculateDueAmount = (attendee: Attendee, calculateCostByAge: (age: number) => number): number => {
  let total = 0;
  const userBirthdate = attendee.user.birthdate;
  if (userBirthdate) {
    const age = new Date().getFullYear() - new Date(userBirthdate).getFullYear();
    total += calculateCostByAge(age);
  }
  (attendee.plus_ones ?? []).forEach((plusOne) => {
    if (plusOne.age !== undefined) {
      total += calculateCostByAge(plusOne.age);
    }
  });
  return total;
};

export const agePassesFilter = (
  age: number | null,
  minAge: number,
  maxAge: number
): boolean => {
  if (age === null) return false;
  return age >= minAge && age <= maxAge;
};

export const buildCSVContent = (
  headers: string[],
  rows: string[][],
  exportDate: string
): string => {
  const csvHeaders = headers.map((h) => `"${h}"`).join(',');
  const csvRows = rows
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  return [csvHeaders, csvRows, '', `Exported on: ${exportDate}`].join('\n');
};

export const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
