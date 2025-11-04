import { api } from "../utils/Axios";

export interface SlotTimeResponse {
  _id: string;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  status: 'available';
  createdAt: string;
  updatedAt: string;
  availableTechnicians: {
    leaders: number;
    supports: number;
  };
  suggestedTechnicians?: {
    leaders: string[];
    supports: string[];
  };
  spanInfo?: {
    durationMinutes: number;
    crossesLunch: boolean;
    adjustedDurationMinutes: number;
  };
}

export interface GetAvailableSlotTimesRequest {
  date: string; // Format: YYYY-MM-DD
  vehicleCategory: 'CAR' | 'MOTOBIKE' | 'BICYCLE';
  serviceId?: string;
  servicePackageId?: string;
}

export const SlotTimeApi = {
  getAvailableSlotTimes: (params: GetAvailableSlotTimesRequest) => {
    const queryParams = new URLSearchParams();
    queryParams.append('date', params.date);
    queryParams.append('vehicleCategory', params.vehicleCategory);
    if (params.serviceId) queryParams.append('serviceId', params.serviceId);
    if (params.servicePackageId) queryParams.append('servicePackageId', params.servicePackageId);
    return api.get<SlotTimeResponse[]>(`/slottimes/available?${queryParams.toString()}`);
  }
};

