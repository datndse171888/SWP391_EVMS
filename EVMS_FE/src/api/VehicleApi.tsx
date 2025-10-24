import type { CheckingResponse } from '../types/DataResponse'
import type { VehicleRequest, VehicleResponse } from '../types/Vehicle'
import { api } from '../utils/Axios'

export const VehicleApi = {
    getAllVehiclesByToken: () => {
        return api.get<CheckingResponse<VehicleResponse[]>>('/vehicles/user')
    },
    
    createVehicle: (data: VehicleRequest) => {
        return api.post<CheckingResponse<VehicleResponse>>('/vehicles', data)
    }
}
