export interface Medicine {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
}

export interface Prescription {
  id: number;
  appointment_id: number;
  doctor_id?: number;
  patient_id?: number;
  doctor_name?: string;
  patient_name?: string;
  diagnosis: string;
  medicines: Medicine[] | string;
  advice?: string;
  created_at?: string;
}