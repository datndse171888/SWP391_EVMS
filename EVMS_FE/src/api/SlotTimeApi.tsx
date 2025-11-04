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
}

export interface GetAvailableSlotTimesRequest {
  date: string; // Format: YYYY-MM-DD
  vehicleCategory: 'CAR' | 'MOTOBIKE' | 'BICYCLE';
}

export const SlotTimeApi = {
  getAvailableSlotTimes: (params: GetAvailableSlotTimesRequest) => {
    const queryParams = new URLSearchParams();
    queryParams.append('date', params.date);
    queryParams.append('vehicleCategory', params.vehicleCategory);
    return api.get<SlotTimeResponse[]>(`/slottimes/available?${queryParams.toString()}`);
  }
};

