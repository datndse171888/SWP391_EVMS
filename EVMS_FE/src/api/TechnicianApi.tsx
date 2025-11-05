import type { CheckingResponse } from '../types/DataResponse';
import type { TechnicianResponse } from '../types/Technician';
import { api } from '../utils/Axios';

export const technicianApi = {
  getTechnicianInfo: (userId: string) => api.get<CheckingResponse<TechnicianResponse>>(`/technicians/${userId}/info`),
  getTechnicianCertificates: (userId: string) => api.get<CheckingResponse<TechnicianResponse>>(`/technicians/${userId}/certificates`),
};

export default technicianApi;


