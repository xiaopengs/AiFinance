export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME'
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  category: string;
  merchant: string; // or payer for income
  date: string; // ISO date string
  notes: string;
  type: TransactionType;
}

export interface DailyStats {
  date: string;
  total: number;
}

export interface CategoryStats {
  category: string;
  total: number;
  percentage: number;
  color: string;
}

// AI Parsing Response Schema
export interface ParsedTransaction {
  amount: number;
  currency: string;
  category: string;
  merchant: string;
  date: string;
  notes: string;
  type: string;
}