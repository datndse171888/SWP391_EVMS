import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator } from 'lucide-react';
import type { ServicePackageResponse } from '../types/ServicePackage';
import type { ServiceResponse } from '../types/Service';
import type { VehicleCategory } from '../types/Vehicle';
import axios from 'axios';

interface ServicePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (packageData: Partial<ServicePackageResponse>) => void;
  package?: ServicePackageResponse | null;
  mode: 'create' | 'edit';
}

interface ServiceItem {
  serviceID: string;
  name: string;
  price: number;
  duration: number;
}

export const ServicePackageModal: React.FC<ServicePackageModalProps> = ({
  isOpen,
  onClose,
  onSave,
  package: pkg,
  mode
}) => {
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    description: '',
    vehicleCategory: 'BICYCLE' as VehicleCategory,
    price: 0,
    discount: 0,
    status: 'active' as 'active' | 'inactive' | 'hidden',
    periodicEnabled: false,
    intervalMonths: undefined as number | undefined,
    defaultTotalVisits: undefined as number | undefined,
  });

  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [availableServices, setAvailableServices] = useState<ServiceResponse[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load available services when vehicle category changes
  useEffect(() => {
    if (isOpen) {
      loadAvailableServices(formData.vehicleCategory);
    }
  }, [formData.vehicleCategory, isOpen]);

  // Populate form when editing
  useEffect(() => {
    if (pkg && mode === 'edit' && isOpen) {
      setFormData({
        _id: pkg._id,
        name: pkg.name,
        description: pkg.description || '',
        vehicleCategory: pkg.vehicleCategory,
        price: pkg.price,
        discount: pkg.discount || 0,
        status: pkg.status,
        periodicEnabled: pkg.periodicEnabled || false,
        intervalMonths: pkg.intervalMonths,
        defaultTotalVisits: pkg.defaultTotalVisits,
      });

      // Convert services to ServiceItem format
      if (Array.isArray(pkg.services) && pkg.services.length > 0) {
        const items: ServiceItem[] = pkg.services.map((s: any) => ({
          serviceID: typeof s === 'string' ? s : s._id,
          name: typeof s === 'string' ? 'Loading...' : s.name,
          price: typeof s === 'string' ? 0 : s.price,
          duration: typeof s === 'string' ? 0 : s.duration,
        }));
        setSelectedServices(items);
      }
    } else if (mode === 'create') {
      // Reset form
      setFormData({
        _id: '',
        name: '',
        description: '',
        vehicleCategory: 'BICYCLE',
        price: 0,
        discount: 0,
        status: 'active',
        periodicEnabled: false,
        intervalMonths: undefined,
        defaultTotalVisits: undefined,
      });
      setSelectedServices([]);
    }
  }, [pkg, mode, isOpen]);

  const loadAvailableServices = async (category: VehicleCategory) => {
    try {
      setLoadingServices(true);
      const response = await axios.get(`http://localhost:4000/api/services`, {
        params: { vehicleCategory: category, limit: 100 }
      });
      setAvailableServices(response.data.items || []);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleAddService = (serviceId: string) => {
    const service = availableServices.find(s => s._id === serviceId);
    if (!service) return;

    // Check if already added
    if (selectedServices.some(s => s.serviceID === serviceId)) {
      alert('Dịch vụ này đã được thêm!');
      return;
    }

    const newService: ServiceItem = {
      serviceID: service._id,
      name: service.name,
      price: service.price,
      duration: service.duration,
    };

    setSelectedServices([...selectedServices, newService]);
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(selectedServices.filter(s => s.serviceID !== serviceId));
  };

  // Calculate totals
  const totalOriginalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
  const discountedPrice = formData.price;
  const savings = totalOriginalPrice - discountedPrice;
  const calculatedDiscount = totalOriginalPrice > 0 ? ((totalOriginalPrice - discountedPrice) / totalOriginalPrice * 100) : 0;

  // Auto-calculate price when discount % changes
  const handleDiscountChange = (discount: number) => {
    // Validate discount range
    if (discount < 0) {
      setErrors(prev => ({ ...prev, discount: 'Giảm giá không thể âm' }));
    } else if (discount > 80) {
      setErrors(prev => ({ ...prev, discount: 'Giảm giá tối đa 80%' }));
    } else {
      setErrors(prev => ({ ...prev, discount: '' }));
    }

    const newPrice = totalOriginalPrice * (1 - discount / 100);
    setFormData({
      ...formData,
      discount,
      price: Math.round(newPrice),
    });
  };

  // Auto-calculate discount % when final price changes
  const handleFinalPriceChange = (finalPrice: number) => {
    // Validate price
    if (finalPrice < 0) {
      setErrors(prev => ({ ...prev, price: 'Giá không thể âm' }));
    } else if (finalPrice > totalOriginalPrice) {
      setErrors(prev => ({ ...prev, price: 'Giá sau giảm không thể lớn hơn giá gốc' }));
    } else {
      setErrors(prev => ({ ...prev, price: '' }));
    }

    const newDiscount = totalOriginalPrice > 0 ? ((totalOriginalPrice - finalPrice) / totalOriginalPrice * 100) : 0;

    // Check if calculated discount exceeds 80%
    if (newDiscount > 80) {
      setErrors(prev => ({ ...prev, discount: 'Giảm giá tối đa 80%' }));
    } else {
      setErrors(prev => ({ ...prev, discount: '' }));
    }

    setFormData({
      ...formData,
      price: finalPrice,
      discount: Math.round(newDiscount * 10) / 10, // Round to 1 decimal
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if there are any errors
    if (errors.discount || errors.price) {
      alert('Vui lòng sửa các lỗi trước khi lưu');
      return;
    }

    // Validation
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên gói dịch vụ');
      return;
    }

    if (selectedServices.length < 2) {
      alert('Gói dịch vụ phải có ít nhất 2 dịch vụ');
      return;
    }

    if (formData.price > totalOriginalPrice) {
      alert('Giá sau giảm không thể lớn hơn giá gốc');
      return;
    }

    if (formData.price < 0) {
      alert('Giá không thể âm');
      return;
    }

    if (formData.discount < 0 || formData.discount > 80) {
      alert('Giảm giá phải từ 0% đến 80%');
      return;
    }

    if (formData.periodicEnabled) {
      if (!formData.intervalMonths || formData.intervalMonths < 1 || formData.intervalMonths > 24) {
        alert('Chu kỳ phải từ 1-24 tháng');
        return;
      }
      if (!formData.defaultTotalVisits || formData.defaultTotalVisits < 1 || formData.defaultTotalVisits > 60) {
        alert('Số lần phải từ 1-60');
        return;
      }
    }

    // Prepare data for backend
    const packageData: any = {
      _id: formData._id,
      name: formData.name,
      description: formData.description,
      vehicleCategory: formData.vehicleCategory,
      price: totalOriginalPrice, // Use calculated total
      discount: formData.discount,
      status: formData.status,
      serviceItems: selectedServices.map(s => ({ serviceID: s.serviceID })),
      periodicEnabled: formData.periodicEnabled,
      intervalMonths: formData.periodicEnabled ? formData.intervalMonths : undefined,
      defaultTotalVisits: formData.periodicEnabled ? formData.defaultTotalVisits : undefined,
    };

    onSave(packageData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Thêm gói dịch vụ' : 'Chỉnh sửa gói dịch vụ'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
              Thông tin cơ bản
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên gói dịch vụ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-0 focus:border-transparent outline-none transition-all"
                placeholder="VD: Gói bảo dưỡng toàn diện"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-0 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Mô tả chi tiết về gói dịch vụ..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại phương tiện <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.vehicleCategory}
                  onChange={(e) => {
                    setFormData({ ...formData, vehicleCategory: e.target.value as VehicleCategory });
                    setSelectedServices([]); // Clear selected services when changing category
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-0 focus:border-transparent outline-none transition-all"
                >
                  <option value="BICYCLE">Xe đạp điện</option>
                  <option value="MOTOBIKE">Xe máy điện</option>
                  <option value="CAR">Ô tô điện</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-0 focus:border-transparent outline-none transition-all"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Tạm dừng</option>
                  <option value="hidden">Ẩn</option>
                </select>
              </div>
            </div>
          </div>

          {/* Service Selection */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
              Chọn dịch vụ (tối thiểu 2)
            </h3>

            {/* Add Service Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thêm dịch vụ
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddService(e.target.value);
                    e.target.value = ''; // Reset selection
                  }
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-0 focus:border-transparent outline-none transition-all"
                disabled={loadingServices}
              >
                <option value="">
                  {loadingServices ? 'Đang tải...' : '-- Chọn dịch vụ để thêm --'}
                </option>
                {availableServices
                  .filter(s => !selectedServices.some(sel => sel.serviceID === s._id))
                  .map(service => (
                    <option key={service._id} value={service._id}>
                      {service.name} - {service.price.toLocaleString('vi-VN')}₫ - {service.duration}p
                    </option>
                  ))}
              </select>
            </div>

            {/* Selected Services List */}
            {selectedServices.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Đã chọn {selectedServices.length} dịch vụ
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedServices.map((service, index) => (
                    <div
                      key={service.serviceID}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">#{index + 1}</span>
                          <span className="font-medium text-gray-900">{service.name}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>{service.price.toLocaleString('vi-VN')}₫</span>
                          <span>{service.duration} phút</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(service.serviceID)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">Chưa có dịch vụ nào được chọn</p>
                <p className="text-sm text-gray-400 mt-1">Vui lòng chọn ít nhất 2 dịch vụ</p>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
              Giá & Giảm giá
            </h3>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Tổng giá gốc:</span>
                  <span className="font-semibold text-gray-900">
                    {totalOriginalPrice.toLocaleString('vi-VN')}₫
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Tổng thời gian:</span>
                  <span className="font-medium text-gray-900">{totalDuration} phút</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giảm giá (%) <span className="text-xs text-gray-500">(Tối đa 80%)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="80"
                    step="0.1"
                    value={formData.discount}
                    onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-azure-0 focus:border-transparent outline-none transition-all ${
                      errors.discount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
                {errors.discount ? (
                  <p className="text-xs text-red-500 mt-1">{errors.discount}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Tự động tính: {calculatedDiscount.toFixed(1)}%
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá sau giảm <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max={totalOriginalPrice}
                    step="1000"
                    value={formData.price}
                    onChange={(e) => handleFinalPriceChange(parseFloat(e.target.value) || 0)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-azure-0 focus:border-transparent outline-none transition-all ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₫</span>
                </div>
                {errors.price ? (
                  <p className="text-xs text-red-500 mt-1">{errors.price}</p>
                ) : savings > 0 ? (
                  <p className="text-xs text-green-600 mt-1">
                    Tiết kiệm: {savings.toLocaleString('vi-VN')}₫
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Periodic Service */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="periodicEnabled"
                checked={formData.periodicEnabled}
                onChange={(e) => setFormData({ ...formData, periodicEnabled: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-azure-0 cursor-pointer"
              />
              <label htmlFor="periodicEnabled" className="text-sm font-medium text-gray-900 cursor-pointer">
                Gói dịch vụ định kỳ
              </label>
            </div>

            {formData.periodicEnabled && (
              <div className="space-y-4 pl-7 animate-fadeIn">
                <p className="text-xs text-gray-600 bg-green-50 p-3 rounded-lg border border-green-100">
                  Gói định kỳ sẽ tự động nhắc nhở khách hàng theo chu kỳ đã đặt
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chu kỳ (tháng) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="24"
                        value={formData.intervalMonths || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          intervalMonths: e.target.value ? parseInt(e.target.value) : undefined
                        })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-0 focus:border-transparent outline-none transition-all"
                        placeholder="6"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">tháng</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">1-24 tháng</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số lần mặc định <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={formData.defaultTotalVisits || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          defaultTotalVisits: e.target.value ? parseInt(e.target.value) : undefined
                        })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-0 focus:border-transparent outline-none transition-all"
                        placeholder="12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">lần</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">1-60 lần</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-0 text-white rounded-lg hover:bg-azure-0 transition-colors shadow-md hover:shadow-lg"
            >
              {mode === 'create' ? 'Tạo gói dịch vụ' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};