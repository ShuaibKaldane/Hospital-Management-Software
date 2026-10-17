export interface PatientProfile {
  user_id: number;
  profile_id?: number;
  name: string;
  email: string;
  status?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  blood_group?: string;
  phone?: string;
  address?: string;
}