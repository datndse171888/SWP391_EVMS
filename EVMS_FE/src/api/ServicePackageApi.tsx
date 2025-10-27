import type { VehicleCategory } from '../types/Vehicle'
import { api } from '../utils/Axios'
import type { DataResponse } from '../types/DataResponse'
import type { ServicePackageResponse } from '../types/ServicePackage'

export const ServicePackageApi = {
  getAllServicePackagesByVehicleCategory: (vehicleCategory: VehicleCategory) => {
    return api.get<DataResponse<ServicePackageResponse>>(`/service-packages?vehicleCategory=${vehicleCategory}`);
  },


}
