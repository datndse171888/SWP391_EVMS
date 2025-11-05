import type { Part } from '../types/Part'
import { api } from '../utils/Axios'

interface FetchPartsParams {
  page: number
  limit: number
  search?: string
}

interface PartsApiResponse {
  success: boolean
  data: {
    parts: Part[]
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

export async function fetchParts(params: FetchPartsParams): Promise<PartsApiResponse> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    ...(params.search ? { q: params.search } : {})
  })

  const response = await api.get(`/parts?${query.toString()}`)
  const raw = response.data as { items: unknown[]; page: number; limit: number; total: number }

  const mapped: Part[] = (raw.items || []).map((it) => {
    const obj = it as Record<string, unknown>
    return {
      id: obj._id as string,
      name: obj.name as string,
      description: obj.description as string,
      manufacturer: obj.manufacturer as string,
      partNumber: obj.partNumber as string,
      price: obj.price as number,
      status: ((obj.status as string) as 'active' | 'inactive') ?? 'active',
      warrantyPeriod: obj.warrantyPeriod as number,
      warrantyCondition: obj.warrantyCondition as string,
      createdAt: obj.createdAt as string,
      updatedAt: obj.updatedAt as string
    }
  })

  const totalPages = Math.max(1, Math.ceil((raw.total || 0) / (raw.limit || params.limit)))

  return {
    success: true,
    data: {
      parts: mapped,
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

interface CreatePartWithInventoryParams {
  // Part fields
  name: string
  description?: string
  manufacturer?: string
  partNumber?: string
  price: number
  status?: 'active' | 'inactive'
  category: 'tires' | 'oil' | 'filters' | 'brakes' | 'electrical' | 'cooling' | 'suspension' | 'transmission' | 'accessories'
  warrantyPeriod?: number
  warrantyCondition?: string
  // Inventory fields
  quantity?: number
  inventoryStatus?: 'in_stock' | 'low_stock' | 'out_of_stock'
}

interface UpdatePartParams {
  name?: string
  description?: string
  manufacturer?: string
  partNumber?: string
  price?: number
  status?: 'active' | 'inactive'
  category?: 'tires' | 'oil' | 'filters' | 'brakes' | 'electrical' | 'cooling' | 'suspension' | 'transmission' | 'accessories'
  warrantyPeriod?: number
  warrantyCondition?: string
}

export const PartApi = {
  getParts: async (params: { page: number; limit: number; search?: string }) => {
    return fetchParts({ page: params.page, limit: params.limit, search: params.search })
  },
  getPartById: (id: string) => {
    return api.get<{ part: Part }>(`/parts/${id}`)
  },
  createPart: (params: Part) => {
    return api.post('/parts', params)
  },
  createPartWithInventory: (params: CreatePartWithInventoryParams) => {
    return api.post<{ message: string; part: Part; inventory: unknown }>('/parts/with-inventory', params)
  },
  updatePart: (id: string, params: UpdatePartParams) => {
    return api.put<{ message: string; part: Part }>(`/parts/${id}`, params)
  },
  deletePart: (id: string) => {
    return api.delete(`/parts/${id}`)
  }
}
