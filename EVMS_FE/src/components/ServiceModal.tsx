import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { ServiceResponse } from '../types/Service';
import type { VehicleCategory } from '../types/Vehicle';

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (service: Partial<ServiceResponse>) => void;
    service?: ServiceResponse | null;
    mode: 'create' | 'edit';
}

export const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, onSave, service, mode }: ServiceModalProps) => {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<ServiceResponse>({
        _id: '',
        name: '',
        description: '',
        price: 0,
        duration: 0,
        image: '',
        vehicleCategory: 'BICYCLE',
    });

    useEffect(() => {
        if (service && mode === 'edit') {
            setFormData({
                _id: service._id,
                name: service.name,
                description: service.description,
                price: service.price,
                duration: service.duration,
                image: service.image,
                vehicleCategory: service.vehicleCategory,
            });
        } else {
            setFormData({
                _id: '',
                name: '',
                description: '',
                price: 0,
                duration: 0,
                image: '',
                vehicleCategory: 'BICYCLE',
            });
        }
    }, [service, mode, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            _id: formData._id,
            name: formData.name,
            description: formData.description,
            price: formData.price,
            duration: formData.duration,
            image: formData.image,
            vehicleCategory: formData.vehicleCategory,
        });
    };

    if (!isOpen) return null;


     // allow unicode letters, numbers, space, hyphen and underscore only
        const validateField = (key: keyof ServiceResponse, value: any): string => {
            const allowRegex = /^[\p{L}\d _-]+$/u;
            switch (key) {
                case 'name':
                    if (!value || String(value).trim().length < 2) return 'Tên dịch vụ là bắt buộc (ít nhất 2 ký tự).';
                    if (!allowRegex.test(String(value))) return 'Tên không được chứa ký tự đặc biệt.';
                    return '';
                case 'description':
                    if (value && !allowRegex.test(String(value))) return 'Mô tả không được chứa ký tự đặc biệt.';
                    return '';
                case 'price':
                    if (value === '' || value === null || Number.isNaN(Number(value))) return 'Giá là bắt buộc.';
                    if (Number(value) < 0) return 'Giá phải lớn hơn hoặc bằng 0.';
                    return '';
                case 'duration':
                    if (value === '' || value === null || Number.isNaN(Number(value))) return '';
                    if (!Number.isInteger(Number(value)) || Number(value) < 0) return 'Thời gian dịch vụ phải là số nguyên >= 0.';
                    return '';
                case 'image':
                    if (!value || String(value).trim().length === 0) return 'Hình ảnh là bắt buộc.';
                    return '';
            
                default:
                    return '';
            }
        };

        const handleChange = (key: keyof ServiceResponse, value: any) => {
                // sanitize text fields to remove special characters for specific keys
                const sanitizeText = (v: any) => String(v ?? '').replace(/[^\p{L}\d _-]/gu, '');
        
                // normalize numeric fields
                if (key === 'price') {
                    const v = value === '' ? '' : parseFloat(value);
                    setFormData(prev => ({ ...prev, price: v as any }));
                    setErrors(prev => ({ ...prev, price: validateField('price', v) }));
                    return;
                }
              
        
                // sanitize certain text fields
                if (['name','description', 'duration', 'price'].includes(key)) {
                    const sanitized = sanitizeText(value);
                    setFormData(prev => ({ ...prev, [key]: sanitized } as ServiceResponse));
                    setErrors(prev => ({ ...prev, [key]: validateField(key, sanitized) }));
                    return;
                }

                setFormData(prev => ({ ...prev, [key]: value } as ServiceResponse));
                setErrors(prev => ({ ...prev, [key]: validateField(key, value) }));
            };

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {mode === 'create' ? 'Tạo dịch vụ mới' : 'Chỉnh sửa dịch vụ'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên dịch vụ *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            placeholder="Tên dịch vụ..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mô tả
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                            placeholder="Mô tả dịch vụ..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giá (VND) *
                            </label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thời gian (phút) *
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.duration}
                                onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                placeholder="30"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Image URL
                        </label>
                        <input
                            type="text"
                            value={formData.image}
                            onChange={(e) => handleChange('image', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loại phương tiện
                        </label>
                        <select
                            value={formData.vehicleCategory}
                            onChange={(e) => setFormData({ ...formData, vehicleCategory: e.target.value as VehicleCategory })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                        >
                            <option value="BICYCLE">Xe đạp điện</option>
                            <option value="MOTOBIKE">Xe máy điện</option>
                            <option value="CAR">Xe ô tô điện</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                        >
                            {mode === 'create' ? 'Tạo mới' : 'Cập nhật'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default ServiceModal;
