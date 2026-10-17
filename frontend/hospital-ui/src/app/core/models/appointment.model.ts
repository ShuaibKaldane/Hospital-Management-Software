export type AppointmentStatus = 'Pending' | 'Approved' | 'Completed' | 'Cancelled';

export interface Appointment {
  id: number;
  appointment_date: string;        // YYYY-MM-DD
  appointment_time: string;        // HH:MM:SS
  status: AppointmentStatus;
  created_at?: string;
  doctor_id?: number;
  patient_id?: number;
  doctor_name?: string;
  patient_name?: string;
  patient_email?: string;
  category_name?: string;
}