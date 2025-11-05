export type Role = 'leader' | 'member';

export interface TechnicianInfo {
  id: string
  introduction: string
  experience: number
  startDate: string
}

export interface TechnicianCertificate {
  certificateID: string
  issuedDate: string
  expiryDate: string
  status: string
  note: string
  certificateImage: string
}

export interface TechnicianResponse {
  _id: string;
  userID: string;
  description?: string;
  role: Role;
}
