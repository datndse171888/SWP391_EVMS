import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Part } from '../types/Part';

interface PartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (part: Partial<Part>) => void;
    part?: Part | null;
    mode: 'create' | 'edit';
}

export const PartModal: React.FC<PartModalProps> = ({ isOpen, onClose, onSave, part, mode }: PartModalProps) => {

    const [formData, setFormData] = useState<Part>({
        id: '',
        name: '',
        description: '',
        manufacturer: '',
        partNumber: '',
        price: 0,
        status: 'active',
        warrantyPeriod: 0,
        warrantyCondition: '',
        createdAt: '',
        updatedAt: '',
    });

    useEffect(() => {
        if (part && mode === 'edit') {
            setFormData({
                id: part.id,
                name: part.name,
                description: part.description,
                manufacturer: part.manufacturer,
                partNumber: part.partNumber,
                price: part.price,
                status: part.status,
                warrantyPeriod: part.warrantyPeriod,
                warrantyCondition: part.warrantyCondition,
                createdAt: part.createdAt,
                updatedAt: part.updatedAt,
            });
        } else {
            setFormData({
                id: '',
                name: '',
                description: '',
                manufacturer: '',
                partNumber: '',
                price: 0,
                status: 'active',
                warrantyPeriod: 0,
                warrantyCondition: '',
                createdAt: '',
                updatedAt: '',
            });
        }
    }, [part, mode, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: formData.id,
            name: formData.name,
            description: formData.description,
            manufacturer: formData.manufacturer,
            partNumber: formData.partNumber,
            price: formData.price,
            status: formData.status,
            warrantyPeriod: formData.warrantyPeriod,
            warrantyCondition: formData.warrantyCondition,
            createdAt: formData.createdAt,
            updatedAt: formData.updatedAt,

        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {mode === 'create' ? 'Tạo phụ tùng mới' : 'Chỉnh sửa phụ tùng'}
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
                            Tên phụ tùng *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            placeholder="Tên phụ tùng..."
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
                            placeholder="Mô tả phụ tùng..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hãng
                            </label>
                            <input
                                type="text"
                                value={formData.manufacturer}
                                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                placeholder="Hãng..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mã phụ tùng *
                            </label>
                            <input
                                type="text"
                                value={formData.partNumber}
                                onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                placeholder="Mã phụ tùng..."
                            />
                        </div>
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
                                Trạng thái *
                            </label>
                            <select
                                required
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'hidden' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            >
                                <option value="active">Hoạt động</option>
                                <option value="inactive">Không hoạt động</option>
                                <option value="hidden">Ẩn</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thời gian bảo hành (tháng)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.warrantyPeriod}
                                onChange={(e) => setFormData({ ...formData, warrantyPeriod: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                placeholder="Số tháng bảo hành..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Điều kiện bảo hành
                            </label>
                            <input
                                type="text"
                                value={formData.warrantyCondition}
                                onChange={(e) => setFormData({ ...formData, warrantyCondition: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                placeholder="Điều kiện bảo hành..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ngày tạo
                            </label>
                            <input
                                type="date"
                                value={formData.createdAt}
                                onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ngày cập nhật
                            </label>
                            <input
                                type="date"
                                value={formData.updatedAt}
                                onChange={(e) => setFormData({ ...formData, updatedAt: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            />
                        </div>


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
            </div >
        </div >
    );
}
export default PartModal;
