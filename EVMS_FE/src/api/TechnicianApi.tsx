import type { CheckingResponse } from '../types/DataResponse';
import type { TechnicianResponse } from '../types/Technician';
import { api } from '../utils/Axios';

export const technicianApi = {
  getTechnicianInfo: (userId: string) => api.get<CheckingResponse<TechnicianResponse>>(`/technicians/${userId}/info`),
  getTechnicianCertificates: (userId: string) => api.get<CheckingResponse<TechnicianResponse>>(`/technicians/${userId}/certificates`),
  getTechnicianById: (technicianId: string) => api.get<CheckingResponse<{ technician: { id: string; userID: any; user: any; introduction: string; role: string; experience: number; startDate: Date } }>>(`/technicians/id/${technicianId}`),
};

export default technicianApi;


