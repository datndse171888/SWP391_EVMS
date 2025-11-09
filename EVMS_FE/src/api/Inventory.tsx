import { api } from '../utils/Axios';

export interface PartResponse {
  _id: string;
  name: string;
  description?: string;
  manufacturer?: string;
  partNumber?: string;
  price: number;
  status: 'active' | 'inactive' | 'hidden';
  category?: string;
  warrantyPeriod?: number;
  warrantyCondition?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryItemResponse {
  _id: string;
  partID: PartResponse; // populated Part
  quantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedInventoryResponse {
  items: InventoryItemResponse[];
  page: number;
  limit: number;
  total: number;
}

export interface GetInventoriesWithPartsQuery {
  page?: number;
  limit?: number;
  partID?: string;
  status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  lowStock?: boolean;
}

// Use shared axios instance baseURL from utils/Axios

export const InventoryApi = {
  async getWithParts(query: GetInventoriesWithPartsQuery = {}): Promise<PaginatedInventoryResponse> {
    const params = new URLSearchParams();
    if (query.page !== undefined) params.set('page', String(query.page));
    if (query.limit !== undefined) params.set('limit', String(query.limit));
    if (query.partID) params.set('partID', query.partID);
    if (query.status) params.set('status', query.status);
    if (query.lowStock) params.set('lowStock', 'true');

    // Gọi endpoint không phân trang để FE tự phân trang
    const url = `/inventories/with-parts/all${params.toString() ? `?${params.toString()}` : ''}`;
    const { data } = await api.get<{ items: InventoryItemResponse[]; total: number }>(url);
    // Chuẩn hóa về định dạng paginated để không đổi code FE
    return {
      items: data.items,
      page: 1,
      limit: data.items.length,
      total: data.total,
    };
  },
  async updateQuantity(inventoryId: string, quantity: number) {
    return api.put(`/inventories/${inventoryId}`, { quantity });
  },
  async createOrUpdateInventory(partID: string, quantity: number, status?: 'in_stock' | 'low_stock' | 'out_of_stock') {
    return api.post('/inventories', { partID, quantity, status });
  },
};


