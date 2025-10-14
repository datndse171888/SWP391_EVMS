import type { Part } from '../types/Part'

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

  const response = await fetch(`http://localhost:4000/api/parts?${query.toString()}`)
  if (!response.ok) {
    throw new Error('Không thể tải danh sách phụ tùng')
  }
  const raw = await response.json() as { items: any[]; page: number; limit: number; total: number }

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


