export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface Payment {
  id: number;
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  amount: number;
  payment_method: string;
  payment_status: PaymentStatus;
  paid_at?: string;
  patient_name?: string;
  doctor_name?: string;
}

export interface PatientReport {
  id: number;
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  report_name: string;
  file_path: string;
  uploaded_at?: string;
  doctor_name?: string;
  patient_name?: string;
}