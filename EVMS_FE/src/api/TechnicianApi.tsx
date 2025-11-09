import type { CheckingResponse } from '../types/DataResponse';
import type { TechnicianInfo, TechnicianCertificate } from '../types/Technician';
import { api } from '../utils/Axios';

export const technicianApi = {
  getTechnicianInfo: (userId: string) => api.get<CheckingResponse<{ technician: TechnicianInfo }>>(`/technicians/${userId}/info`),
  getTechnicianCertificates: (userId: string) => api.get<CheckingResponse<{ certificates: TechnicianCertificate[] }>>(`/technicians/${userId}/certificates`),
  getTechnicianById: (technicianId: string) => api.get<CheckingResponse<{ technician: { id: string; userID: any; user: any; introduction: string; role: string; experience: number; startDate: Date } }>>(`/technicians/id/${technicianId}`),
};

export default technicianApi;


