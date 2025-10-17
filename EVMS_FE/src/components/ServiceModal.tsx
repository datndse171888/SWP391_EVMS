import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Service } from '../types/Service';

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (service: Partial<Service>) => void;
    service?: Service | null;
    mode: 'create' | 'edit';
}

export const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, onSave, service, mode }: ServiceModalProps) => {

    const [formData, setFormData] = useState<Service>({
        id: service?.id || 0,
        name: '',
        description: '',
        price: 0,
        duration: 0,
        image: '',
        vehicleType: service?.vehicleType || undefined,
    });

    useEffect(() => {
        if (service && mode === 'edit') {
            setFormData({
                id: service.id,
                name: service.name,
                description: service.description,
                price: service.price,
                duration: service.duration,
                image: service.image,
                vehicleType: service.vehicleType,
            });
        } else {
            setFormData({
                id: 0,
                name: '',
                description: '',
                price: 0,
                duration: 0,
                image: '',
                vehicleType: undefined,
            });
        }
    }, [service, mode, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: formData.id,
            name: formData.name,
            description: formData.description,
            price: formData.price,
            duration: formData.duration,
            image: formData.image,
            vehicleType: formData.vehicleType,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
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
                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
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
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loại phương tiện
                        </label>
                        <select
                            value={formData.vehicleType || ''}
                            onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as 'electric_bike' | 'electric_motorcycle' | 'electric_car' | undefined })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                        >
                            <option value="">Chọn loại phương tiện</option>
                            <option value="electric_bike">Xe đạp điện</option>
                            <option value="electric_motorcycle">Xe máy điện</option>
                            <option value="electric_car">Xe ô tô điện</option>
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
