export type SalaryTxnType = 'Salary' | 'Bonus' | 'Deduction' | 'Consultation';

export interface SalaryTransaction {
  /** `sal-{id}` or `pay-{id}` so the row id is unique across both sources. */
  id: string | number;
  doctor_id?: number;
  doctor_name?: string;
  amount: number;
  transaction_type: SalaryTxnType;
  reason?: string | null;
  created_at?: string;
  source?: 'salary' | 'payment';
  patient_name?: string | null;
}

export interface EarningsSummary {
  credits: number;
  debits: number;
  net: number;
  salaryCredits?: number;
  consultation?: number;
  transactions?: SalaryTransaction[];
}