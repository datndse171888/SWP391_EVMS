import type { CheckingResponse } from '../types/DataResponse'
import type { VehicleRequest, VehicleResponse } from '../types/Vehicle'
import type { MaintenanceMyResponse, MaintenanceItem } from '../types/Maintenance'
import { api } from '../utils/Axios'

export const VehicleApi = {
    getAllVehiclesByToken: () => {
        return api.get<CheckingResponse<VehicleResponse[]>>('/vehicles/user')
    },
    
    createVehicle: (data: VehicleRequest) => {
        return api.post<CheckingResponse<VehicleResponse>>('/vehicles', data)
    },

    getVehicleById: (vehicleId: string) => {
        return api.get<VehicleResponse>(`/vehicles/${vehicleId}`)
    },

    // Maintenance
    getMyMaintenance: () => {
        return api.get<MaintenanceMyResponse>('/vehicles/maintenance/my')
    },

    getVehicleMaintenance: (vehicleId: string) => {
        return api.get<MaintenanceItem>(`/vehicles/${vehicleId}/maintenance`)
    },

    getVehiclePeriodicStatus: (vehicleId: string, params: { serviceId?: string; servicePackageId?: string }) => {
        const query = new URLSearchParams();
        if (params.serviceId) query.set('serviceId', params.serviceId);
        if (params.servicePackageId) query.set('servicePackageId', params.servicePackageId);
        return api.get(`/vehicles/${vehicleId}/periodic-status?${query.toString()}`)
    },

    getMyPeriodicSubscriptions: () => {
        return api.get<{ items: any[]; count: number }>(`/vehicles/periodic/my`)
    }
}
