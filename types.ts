
export type Currency = 'USD' | 'EUR' | 'GBP';

export interface Transaction {
  id: string;
  text: string;
  amount: number; // This will always be in the base currency (USD) for calculations
  type: 'add' | 'subtract';
  date: string;
  currency: Currency;
  originalAmount: number; // The amount in the original currency
  restored?: boolean;
}

export interface RecurringExpense {
  id: string;
  text: string;
  amount: number;
  currency: Currency;
  type?: 'add' | 'subtract';
  recurrenceType: 'days' | 'weeks' | 'months';
  recurrenceValue: number;
  startDate: string; // ISO String
  lastAddedDate?: string; // ISO String
}
