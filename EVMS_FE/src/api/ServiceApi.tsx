import type { DataResponse } from '../types/DataResponse'
import type { ServiceResponse } from '../types/Service'
import type { VehicleCategory } from '../types/Vehicle'
import { api } from '../utils/Axios'

interface FetchServicesParams {
  page: number
  limit: number
  search?: string
  vehicleCategory?: string
}

interface ServicesApiResponse {
  success: boolean
  data: {
    services: ServiceResponse[]
    pagination: {
      currentPage: number
      totalPages: number
      totalItems?: number
      limit: number
      hasNextPage?: boolean
      hasPrevPage?: boolean
    }
  }
}

export async function fetchServices(params: FetchServicesParams): Promise<ServicesApiResponse> {
  // BE expects 'q' for search and returns shape: { items, page, limit, total }
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    ...(params.search ? { q: params.search } : {}),
    ...(params.vehicleCategory ? { vehicleCategory: params.vehicleCategory } : {})
  })

  const response = await api.get(`/services?${query.toString()}`)
  const raw = response.data as { items: any[]; page: number; limit: number; total: number }

  // Ensure unique items by _id to prevent duplicates
  const uniqueItemsMap = new Map<string, any>();
  (raw.items || []).forEach((it: any) => {
    const id = it._id ? String(it._id) : (it.id ? String(it.id) : null);
    if (id && !uniqueItemsMap.has(id)) {
      uniqueItemsMap.set(id, it);
    }
  });

  const mapped: ServiceResponse[] = Array.from(uniqueItemsMap.values()).map((it) => ({
    // Use _id as the primary identifier
    _id: it._id ? String(it._id) : (it.id ? String(it.id) : ''),
    name: it.name || '',
    description: it.description || '',
    price: typeof it.price === 'number' ? it.price : 0,
    duration: typeof it.duration === 'number' ? it.duration : 0,
    image: it.image || '',
    vehicleCategory: it.vehicleCategory || it.vehicleType || 'CAR',
    periodicEnabled: it.periodicEnabled || false,
    intervalMonths: it.intervalMonths,
    defaultTotalVisits: it.defaultTotalVisits,
  }))

  const totalPages = Math.max(1, Math.ceil((raw.total || 0) / (raw.limit || params.limit)))

  return {
    success: true,
    data: {
      services: mapped,
      pagination: {
        currentPage: raw.page || params.page,
        totalPages,
        totalItems: raw.total,
        limit: raw.limit || params.limit,
        hasNextPage: (raw.page || 1) < totalPages,
        hasPrevPage: (raw.page || 1) > 1
      }
    }
  }
}

// Service API methods
export const ServiceApi = {
  allServices: (params: ServiceResponse) => {
    return api.get('/services', { params });
  },

  createService: (params: ServiceResponse) => {
    return api.post('/services', params);
  },

  updateService: (id: string, params: Partial<ServiceResponse>) => {
    return api.put(`/services/${id}`, params);
  },

  deleteService: (id: string) => {
    return api.delete(`/services/${id}`);
  },

  getService: (vehicleCategory?: VehicleCategory) => {
    return api.get<DataResponse<ServiceResponse>>(`/services${vehicleCategory ? `?vehicleCategory=${vehicleCategory}` : ''}`);
  },

  getServiceById: (serviceId: string) => {
    return api.get<ServiceResponse>(`/services/${serviceId}`);
  },

  getServiceByVehicleCategory: async (vehicleCategory: VehicleCategory) => {
    try {
      const response = await api.get(`/services/category/${vehicleCategory}`);
      
      // BE returns: { message, data: { services, count, vehicleCategory } }
      const responseData = response.data;
      
      // Extract services from response
      let services: any[] = [];
      if (responseData?.data?.services && Array.isArray(responseData.data.services)) {
        services = responseData.data.services;
      } else if (responseData?.services && Array.isArray(responseData.services)) {
        services = responseData.services;
      }
      
      const count = responseData?.data?.count || responseData?.count || services.length;
      
      console.log(`Fetched ${services.length} services for ${vehicleCategory}:`, services);
      
      return {
        success: true,
        data: {
          items: services,
          total: count
        }
      };
    } catch (error: any) {
      console.error('Error in getServiceByVehicleCategory:', error);
      console.error('Error response:', error?.response?.data);
      throw error;
    }
  },
}

