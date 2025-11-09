export type Role = 'admin' | 'staff' | 'technician' | 'customer';
export type Gender = 'Male' | 'Female';

export interface AccountLogin {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  email: string;
  userName: string;
  fullName: string;
  phoneNumber: string;
  photoURL: string;
  role: Role;
  gender: Gender;
  isDisabled: boolean;
  isVerified: boolean;
};

export interface AccountRegister {
  email: string;
  userName: string;
  fullName: string;
  password: string;
  phoneNumber: string;
  gender: Gender;
  photoURL: string;
  role: Role;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface Profile {
  id: string;
  email: string;
  userName: string;
  fullName: string;
  phoneNumber: string;
  photoURL: string;
  gender: string;

};

export interface Appointment {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  appointment_date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  location: string | null;
  created_at: string;
  updated_at: string;
};

export interface UserIDObject {
  _id: string;
  userName: string;
  email: string;
  fullName: string;
  phoneNumber: number;
}
