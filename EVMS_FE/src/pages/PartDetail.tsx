import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PartApi } from '../api/PartApi';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import type { Part } from '../types/Part';

const PartDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [part, setPart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToRecentlyViewed } = useRecentlyViewed();
  const hasAddedToViewed = useRef<string | null>(null);

  useEffect(() => {
    const fetchPart = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!id) {
          setError('ID linh kiện không hợp lệ');
          setLoading(false);
          return;
        }
        
        const response = await PartApi.getPartById(id);
        if (response.data?.part) {
          const partData = response.data.part;
          // Map data to match Part interface
          const mappedPart: Part = {
            id: partData._id || partData.id || String(partData._id || partData.id),
            name: partData.name || '',
            description: partData.description || '',
            manufacturer: partData.manufacturer || '',
            partNumber: partData.partNumber || '',
            price: partData.price || 0,
            status: partData.status || 'active',
            warrantyPeriod: partData.warrantyPeriod,
            warrantyCondition: partData.warrantyCondition || '',
            createdAt: partData.createdAt || new Date().toISOString(),
            updatedAt: partData.updatedAt || new Date().toISOString()
          };
          setPart(mappedPart);
        } else {
          setError('Không tìm thấy linh kiện');
        }
      } catch (err: any) {
        console.error('Lỗi khi tải chi tiết linh kiện:', err);
        if (err.response?.status === 404) {
          setError('Không tìm thấy linh kiện');
        } else {
          setError('Lỗi khi tải chi tiết linh kiện');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPart();
    }
  }, [id]);

  // Lưu vào lịch sử xem riêng biệt để tránh infinite loop
  useEffect(() => {
    if (part && part.id && hasAddedToViewed.current !== part.id) {
      hasAddedToViewed.current = part.id;
      addToRecentlyViewed(part);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [part?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải chi tiết linh kiện...</p>
        </div>
      </div>
    );
  }

  if (error || !part) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">{error || 'Không tìm thấy linh kiện'}</h3>
          <button
            onClick={() => navigate('/parts')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { text: string; color: string }> = {
      active: { text: 'Có sẵn', color: 'bg-green-100 text-green-800' },
      inactive: { text: 'Tạm hết', color: 'bg-yellow-100 text-yellow-800' },
      hidden: { text: 'Ẩn', color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status] || { text: 'Không xác định', color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const currencyFormatter = new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/parts')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{part.name}</h1>
          <p className="text-gray-600 mt-2">Mã linh kiện: {part.partNumber}</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin chung</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên linh kiện</label>
                  <p className="text-gray-900 font-semibold">{part.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <p className="text-gray-700">{part.description || 'Không có mô tả'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hãng sản xuất</label>
                    <p className="text-gray-900">{part.manufacturer || 'Không xác định'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã linh kiện</label>
                    <p className="text-gray-900 font-mono">{part.partNumber || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  {getStatusBadge(part.status)}
                </div>
              </div>
            </div>

            {/* Warranty Info */}
            {part.warrantyPeriod && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin bảo hành</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian bảo hành</label>
                      <p className="text-gray-900 font-semibold">{part.warrantyPeriod} tháng</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Điều kiện bảo hành</label>
                      <p className="text-gray-700">{part.warrantyCondition || 'Không xác định'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Price & Actions */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Giá bán</h2>
              
              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-2">Giá hiện tại</p>
                <p className="text-4xl font-bold" style={{ color: '#f6ae2d' }}>
                  {currencyFormatter.format(part.price)}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/parts')}
                  className="w-full px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors hover:bg-gray-300"
                >
                  Quay lại
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày tạo:</span>
                    <span className="text-gray-900 font-medium">
                      {new Date(part.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cập nhật:</span>
                    <span className="text-gray-900 font-medium">
                      {new Date(part.updatedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartDetail;

