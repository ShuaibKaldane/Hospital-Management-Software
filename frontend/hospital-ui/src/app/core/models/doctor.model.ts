export interface DoctorCategory {
  id: number;
  category_name: string;
  description?: string;
  created_at?: string;
}

export interface DoctorProfile {
  user_id: number;
  profile_id?: number;
  name: string;
  email: string;
  status?: string;
  category_id: number;
  category_name?: string;
  qualification: string;
  experience: number;
  consultation_fee: number;
  phone?: string;
  address?: string;
  profile_image?: string;
  created_at?: string;
  updated_at?: string;
}