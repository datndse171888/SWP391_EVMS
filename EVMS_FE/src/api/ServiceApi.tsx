import type { Service } from '../types/Service'
import { api } from '../utils/Axios'

interface FetchServicesParams {
  page: number
  limit: number
  search?: string
}

interface ServicesApiResponse {
  success: boolean
  data: {
    services: Service[]
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
    ...(params.search ? { q: params.search } : {})
  })

  const response = await fetch(`http://localhost:4000/api/services?${query.toString()}`)
  if (!response.ok) {
    throw new Error('Không thể tải danh sách dịch vụ')
  }
  const raw = await response.json() as { items: any[]; page: number; limit: number; total: number }

  const mapped: Service[] = (raw.items || []).map((it, idx) => ({
    // id in FE type is number; map from index to avoid type mismatch
    id: (raw.page - 1) * raw.limit + idx + 1,
    name: it.name,
    description: it.description,
    price: it.price,
    // BE duration is number (minutes), FE expects string
    duration: typeof it.duration === 'number' ? `${it.duration}` : (it.duration || ''),
    image: it.image,
    vehicleType: it.vehicleType,
    pricing: Array.isArray(it.pricing)
      ? it.pricing
        .filter((p: any) => p && typeof p.price === 'number' && ['CAR', 'BICYCLE', 'MOTOBIKE'].includes(String(p.category)))
        .map((p: any) => ({ category: String(p.category) as 'CAR' | 'BICYCLE' | 'MOTOBIKE', price: p.price }))
      : undefined
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
  createService: (params: Service) => {
    return api.post('/services', params);
  },

  updateService: (id: number, params: Partial<Service>) => {
    return api.put(`/services/${id}`, params);
  },

  deleteService: (id: number) => {
    return api.delete(`/services/${id}`);
  }
}

