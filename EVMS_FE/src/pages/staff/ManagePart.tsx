import React, { useState } from 'react';

interface Part {
  id: string;
  name: string;
  description?: string;
  manufacturer?: string;
  partNumber?: string;
  price: number;
  status: 'active' | 'inactive' | 'hidden';
  warrantyPeriod?: number;
  warrantyCondition?: string;
  stockQuantity?: number;
  createdAt: string;
  updatedAt: string;
}

interface PartUsage {
  id: string;
  appointmentID: string;
  partID: string;
  quantity: number;
  priceAtUsage: number;
  warrantyApplied: boolean;
  note?: string;
  warrantyExpiryDate?: string;
  createdAt: string;
}

const ManagePart: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'inventory' | 'usage' | 'low-stock'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterManufacturer, setFilterManufacturer] = useState('');

  // Mock data - thay thế bằng API calls
  const mockParts: Part[] = [
    {
      id: '1',
      name: 'Lốp xe máy 110/70-17',
      description: 'Lốp xe máy cao cấp, độ bền cao',
      manufacturer: 'Michelin',
      partNumber: 'MIC-110-70-17',
      price: 450000,
      status: 'active',
      warrantyPeriod: 12,
      warrantyCondition: 'tháng',
      stockQuantity: 25,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Dầu nhớt động cơ 10W-40',
      description: 'Dầu nhớt tổng hợp cho động cơ xe máy',
      manufacturer: 'Castrol',
      partNumber: 'CAS-10W40-1L',
      price: 120000,
      status: 'active',
      warrantyPeriod: 6,
      warrantyCondition: 'tháng',
      stockQuantity: 8,
      createdAt: '2024-01-08',
      updatedAt: '2024-01-12'
    },
    {
      id: '3',
      name: 'Phanh đĩa trước xe máy',
      description: 'Hệ thống phanh đĩa chất lượng cao',
      manufacturer: 'Brembo',
      partNumber: 'BRE-DISC-320',
      price: 850000,
      status: 'active',
      warrantyPeriod: 24,
      warrantyCondition: 'tháng',
      stockQuantity: 3,
      createdAt: '2024-01-05',
      updatedAt: '2024-01-10'
    },
    {
      id: '4',
      name: 'Bugi đánh lửa Iridium',
      description: 'Bugi đánh lửa hiệu suất cao',
      manufacturer: 'NGK',
      partNumber: 'NGK-IR-IX',
      price: 85000,
      status: 'active',
      warrantyPeriod: 12,
      warrantyCondition: 'tháng',
      stockQuantity: 1,
      createdAt: '2024-01-03',
      updatedAt: '2024-01-08'
    }
  ];

  const mockPartUsage: PartUsage[] = [
    {
      id: '1',
      appointmentID: 'apt-001',
      partID: '1',
      quantity: 2,
      priceAtUsage: 450000,
      warrantyApplied: false,
      note: 'Thay lốp cho xe Honda Wave',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      appointmentID: 'apt-002',
      partID: '2',
      quantity: 1,
      priceAtUsage: 120000,
      warrantyApplied: true,
      warrantyExpiryDate: '2024-07-15',
      note: 'Thay dầu nhớt định kỳ',
      createdAt: '2024-01-14'
    }
  ];

  // Filter function
  const filterParts = (parts: Part[]) => {
    return parts.filter(part => {
      const matchesSearch = searchTerm === '' || 
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === '' || part.status === filterStatus;
      const matchesManufacturer = filterManufacturer === '' || part.manufacturer === filterManufacturer;
      
      return matchesSearch && matchesStatus && matchesManufacturer;
    });
  };

  const filteredParts = filterParts(mockParts);
  const lowStockParts = filteredParts.filter(part => (part.stockQuantity || 0) <= 5);
  const activeParts = filteredParts.filter(part => part.status === 'active');

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { text: 'Hoạt động', color: 'bg-green-100 text-green-800' },
      inactive: { text: 'Ngừng hoạt động', color: 'bg-gray-100 text-gray-800' },
      hidden: { text: 'Ẩn', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getStockBadge = (quantity: number) => {
    if (quantity <= 5) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Sắp hết</span>;
    } else if (quantity <= 15) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Trung bình</span>;
    } else {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Đủ hàng</span>;
    }
  };

  const renderPartCard = (part: Part) => {
    return (
      <div key={part.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg mb-1">{part.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{part.description}</p>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm text-gray-500">Mã SP:</span>
              <span className="text-sm font-medium text-gray-700">{part.partNumber}</span>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm text-gray-500">NSX:</span>
              <span className="text-sm font-medium text-gray-700">{part.manufacturer}</span>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            {getStatusBadge(part.status)}
            {getStockBadge(part.stockQuantity || 0)}
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-sm text-gray-500">Giá:</span>
              <span className="ml-1 text-lg font-bold text-green-600">
                {part.price.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500">Tồn kho:</span>
              <span className="ml-1 text-sm font-medium text-gray-700">
                {part.stockQuantity || 0} sản phẩm
              </span>
            </div>
          </div>
        </div>

        {part.warrantyPeriod && (
          <div className="mb-3 p-2 rounded text-sm" style={{ backgroundColor: '#8dcdfa', color: '#014091' }}>
            Bảo hành: {part.warrantyPeriod} {part.warrantyCondition}
          </div>
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={() => console.log('Edit part:', part.id)}
            className="px-3 py-1.5 bg-white text-gray-700 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 transition-colors"
          >
            Chỉnh sửa
          </button>
          
          <div className="flex space-x-1">
            <button 
              className="px-3 py-1.5 text-white rounded text-xs font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: '#014091' }}
            >
              Xem chi tiết
            </button>
            <button 
              className="px-3 py-1.5 text-white rounded text-xs font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: '#16a34a' }}
            >
              Nhập kho
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#014091' }}>
              Quản lý linh kiện
            </h1>
            <p className="text-xs" style={{ color: '#5f6777' }}>
              Quản lý kho linh kiện và phụ tùng
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm linh kiện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <button
              onClick={() => console.log('Add part modal')}
              className="px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium hover:opacity-90"
              style={{ backgroundColor: '#014091' }}
            >
              Thêm linh kiện
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#5f6777' }}>Tổng linh kiện</p>
              <p className="text-2xl font-bold" style={{ color: '#014091' }}>{mockParts.length}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: '#8dcdfa' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#014091' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#5f6777' }}>Sắp hết hàng</p>
              <p className="text-2xl font-bold" style={{ color: '#fd8c40' }}>{lowStockParts.length}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: '#f6ae2d' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#014091' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#5f6777' }}>Đang hoạt động</p>
              <p className="text-2xl font-bold" style={{ color: '#16a34a' }}>{activeParts.length}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: '#0991f3' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'white' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#5f6777' }}>Tổng giá trị</p>
              <p className="text-2xl font-bold" style={{ color: '#014091' }}>
                {mockParts.reduce((sum, part) => sum + (part.price * (part.stockQuantity || 0)), 0).toLocaleString('vi-VN')}đ
              </p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: '#8abdfe' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#014091' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
              <option value="hidden">Ẩn</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Nhà sản xuất:</label>
            <select
              value={filterManufacturer}
              onChange={(e) => setFilterManufacturer(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="">Tất cả</option>
              <option value="Michelin">Michelin</option>
              <option value="Castrol">Castrol</option>
              <option value="Brembo">Brembo</option>
              <option value="NGK">NGK</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('');
              setFilterManufacturer('');
            }}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-3">
        <div className="mb-4">
          <nav className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setSelectedTab('inventory')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'inventory'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tất cả linh kiện ({filteredParts.length})
            </button>
            <button
              onClick={() => setSelectedTab('low-stock')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'low-stock'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sắp hết hàng ({lowStockParts.length})
            </button>
            <button
              onClick={() => setSelectedTab('usage')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'usage'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Lịch sử sử dụng ({mockPartUsage.length})
            </button>
          </nav>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedTab === 'inventory' && filteredParts.map(renderPartCard)}
          {selectedTab === 'low-stock' && lowStockParts.map(renderPartCard)}
          {selectedTab === 'usage' && (
            <div className="col-span-full">
              <p className="text-center text-gray-500 py-8">Lịch sử sử dụng linh kiện sẽ được hiển thị ở đây</p>
            </div>
          )}
        </div>

        {/* Empty State */}
        {((selectedTab === 'inventory' && filteredParts.length === 0) ||
          (selectedTab === 'low-stock' && lowStockParts.length === 0)) && (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {selectedTab === 'inventory' && 'Không tìm thấy linh kiện nào'}
              {selectedTab === 'low-stock' && 'Không có linh kiện nào sắp hết hàng'}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              {selectedTab === 'inventory' && 'Thử thay đổi bộ lọc hoặc tìm kiếm khác.'}
              {selectedTab === 'low-stock' && 'Tất cả linh kiện đều có đủ hàng.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePart;
