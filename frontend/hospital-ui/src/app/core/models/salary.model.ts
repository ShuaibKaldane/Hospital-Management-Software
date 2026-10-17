export type SalaryTxnType = 'Salary' | 'Bonus' | 'Deduction';

export interface SalaryTransaction {
  id: number;
  doctor_id: number;
  doctor_name?: string;
  amount: number;
  transaction_type: SalaryTxnType;
  reason?: string;
  created_at?: string;
}

export interface EarningsSummary {
  credits: number;
  debits: number;
  net: number;
}