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
  const raw = response.data as { items: any[]; page: number; limit: number; total: number }

  const mapped: Part[] = (raw.items || []).map((it) => ({
    id: it._id,
    name: it.name,
    description: it.description,
    manufacturer: it.manufacturer,
    partNumber: it.partNumber,
    price: it.price,
    status: it.status,
    warrantyPeriod: it.warrantyPeriod,
    warrantyCondition: it.warrantyCondition,
    createdAt: it.createdAt,
    updatedAt: it.updatedAt
  }))

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

export const PartApi = {
  getPartById: (id: string) => {
    return api.get<{ part: Part }>(`/parts/${id}`)
  },
  createPart: (params: Part) => {
    return api.post('/parts', params)
  },
  updatePart: (id: string, params: Part) => {
    return api.put(`/parts/${id}`, params)
  },
  deletePart: (id: string) => {
    return api.delete(`/parts/${id}`)
  }
}
