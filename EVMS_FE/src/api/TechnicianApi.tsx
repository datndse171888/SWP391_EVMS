import { api } from '../utils/Axios';

export interface TechnicianInfoResponse {
  success: boolean;
  data: {
    technician: {
      id: string;
      introduction: string;
      role: 'leader' | 'member';
      experience: number;
      startDate: string;
    };
  };
}

export interface TechnicianCertificatesResponse {
  success: boolean;
  data: {
    certificates: Array<{
      certificateID: string;
      issuedDate: string;
      expiryDate: string;
      status: string;
      note: string;
      certificateImage: string;
    }>;
  };
}

export const technicianApi = {
  getTechnicianInfo: (userId: string) => api.get<TechnicianInfoResponse>(`/technicians/${userId}/info`),
  getTechnicianCertificates: (userId: string) => api.get<TechnicianCertificatesResponse>(`/technicians/${userId}/certificates`),
};

export default technicianApi;


