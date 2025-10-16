export interface AccountLogin {
    email: string;
    password: string;
}

export interface AccountRegister {
    email: string;
    userName: string;
    fullName: string;
    password: string;
    phoneNumber: string;
    gender: string;
    photoURL: string;
    role: ' admin' | 'staff' | 'technician' | 'customer';
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
  userName: string;
  email: string;
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