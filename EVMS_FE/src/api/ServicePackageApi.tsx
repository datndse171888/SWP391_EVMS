import type { VehicleCategory } from '../types/Vehicle'
import { api } from '../utils/Axios'
import type { DataResponse } from '../types/DataResponse'
import type { ServicePackageResponse } from '../types/ServicePackage'

export const ServicePackageApi = {
  getServicePackage: (vehicleCategory?: VehicleCategory) => {
    return api.get<DataResponse<ServicePackageResponse>>(`/service-packages${vehicleCategory ? `?vehicleCategory=${vehicleCategory}` : ''}`);
  },

  getServicePackageById: (servicePackageId: string) => {
    return api.get<ServicePackageResponse>(`/service-packages/${servicePackageId}`);
  },

  getAllServicePackagesByVehicleCategory: async (vehicleCategory: VehicleCategory) => {
    const response = await api.get<{ message: string; data: { packages: any[]; count: number; vehicleCategory: string } }>(`/service-packages/category/${vehicleCategory}`);
    return {
      success: true,
      data: {
        items: response.data.data.packages || [],
        total: response.data.data.count || 0
      }
    };
  }
}
