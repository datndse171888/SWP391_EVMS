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

    const [errors, setErrors] = useState<Record<string, string>>({});

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
        setErrors({});
    }, [part, mode, isOpen]);

    // allow unicode letters, numbers, space, hyphen and underscore only
    const validateField = (key: keyof Part, value: any): string => {
        const allowRegex = /^[\p{L}\d _-]+$/u;

        switch (key) {
            case 'name':
                if (!value || String(value).trim().length < 2) return 'Tên phụ tùng là bắt buộc (ít nhất 2 ký tự).';
                if (!allowRegex.test(String(value))) return 'Tên không được chứa ký tự đặc biệt.';
                return '';
            case 'partNumber':
                if (!value || String(value).trim() === '') return 'Mã phụ tùng là bắt buộc.';
                if (!allowRegex.test(String(value))) return 'Mã phụ tùng không được chứa ký tự đặc biệt.';
                return '';
            case 'description':
                if (value && !allowRegex.test(String(value))) return 'Mô tả không được chứa ký tự đặc biệt.';
                return '';
            case 'price':
                if (value === '' || value === null || Number.isNaN(Number(value))) return 'Giá là bắt buộc.';
                if (Number(value) < 0) return 'Giá phải lớn hơn hoặc bằng 0.';
                return '';
            case 'warrantyPeriod':
                if (value === '' || value === null || Number.isNaN(Number(value))) return '';
                if (!Number.isInteger(Number(value)) || Number(value) < 0) return 'Thời gian bảo hành phải là số nguyên >= 0.';
                return '';
            case 'status':
                if (!['active', 'inactive', 'hidden'].includes(value)) return 'Trạng thái không hợp lệ.';
                return '';
            case 'manufacturer':
                if (value && !allowRegex.test(String(value))) return 'Hãng không được chứa ký tự đặc biệt.';
                return '';
            case 'warrantyCondition':
                if (value && !allowRegex.test(String(value))) return 'Điều kiện bảo hành không được chứa ký tự đặc biệt.';
                return '';
            case 'createdAt':
            case 'updatedAt':
                if (!value) return '';
                // basic date validity
                if (isNaN(Date.parse(value))) return 'Ngày không hợp lệ.';
                return '';
            default:
                return '';
        }
    };


    const validateAll = (): Record<string, string> => {
        const nextErrors: Record<string, string> = {};
        (Object.keys(formData) as (keyof Part)[]).forEach((key) => {
            const err = validateField(key, (formData as any)[key]);
            if (err) nextErrors[key] = err;
        });

        // check date relation: updatedAt >= createdAt if both provided
        if (formData.createdAt && formData.updatedAt) {
            const created = Date.parse(formData.createdAt);
            const updated = Date.parse(formData.updatedAt);
            if (!isNaN(created) && !isNaN(updated) && updated < created) {
                nextErrors.updatedAt = 'Ngày cập nhật phải lớn hơn hoặc bằng ngày tạo.';
            }
        }

        setErrors(nextErrors);
        return nextErrors;
    };

    
    const handleChange = (key: keyof Part, value: any) => {
        // sanitize text fields to remove special characters for specific keys
        const sanitizeText = (v: any) => String(v ?? '').replace(/[^\p{L}\d _-]/gu, '');

        // normalize numeric fields
        if (key === 'price') {
            const v = value === '' ? '' : parseFloat(value);
            setFormData(prev => ({ ...prev, price: v as any }));
            setErrors(prev => ({ ...prev, price: validateField('price', v) }));
            return;
        }
        if (key === 'warrantyPeriod') {
            const v = value === '' ? '' : parseInt(value);
            setFormData(prev => ({ ...prev, warrantyPeriod: v as any }));
            setErrors(prev => ({ ...prev, warrantyPeriod: validateField('warrantyPeriod', v) }));
            return;
        }

        // sanitize certain text fields
        if (['name', 'manufacturer', 'partNumber', 'warrantyCondition', 'description'].includes(key)) {
            const sanitized = sanitizeText(value);
            setFormData(prev => ({ ...prev, [key]: sanitized } as Part));
            setErrors(prev => ({ ...prev, [key]: validateField(key, sanitized) }));
            return;
        }

        setFormData(prev => ({ ...prev, [key]: value } as Part));
        setErrors(prev => ({ ...prev, [key]: validateField(key, value) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const nextErrors = validateAll();
        if (Object.keys(nextErrors).length > 0) {
            // focus first invalid input
            const firstKey = Object.keys(nextErrors)[0];
            const el = document.querySelector(`[name="${firstKey}"]`) as HTMLElement | null;
            if (el) el.focus();
            return;
        }

        onSave({
            id: formData.id,
            name: formData.name.trim(),
            description: formData.description,
            manufacturer: formData.manufacturer,
            partNumber: formData.partNumber,
            price: Number(formData.price),
            status: formData.status,
            warrantyPeriod: Number(formData.warrantyPeriod),
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
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
                            placeholder="Tên phụ tùng..."
                        />
                        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mô tả
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
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
                                name="manufacturer"
                                type="text"
                                value={formData.manufacturer}
                                onChange={(e) => handleChange('manufacturer', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                placeholder="Hãng..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mã phụ tùng *
                            </label>
                            <input
                                name="partNumber"
                                type="text"
                                value={formData.partNumber}
                                onChange={(e) => handleChange('partNumber', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${errors.partNumber ? 'border-red-400' : 'border-gray-300'}`}
                                placeholder="Mã phụ tùng..."
                            />
                            {errors.partNumber && <p className="text-red-600 text-sm mt-1">{errors.partNumber}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giá (VND) *
                            </label>
                            <input
                                name="price"
                                type="number"
                                required
                                step="0.01"
                                min="0"
                                value={formData.price as any}
                                onChange={(e) => handleChange('price', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${errors.price ? 'border-red-400' : 'border-gray-300'}`}
                                placeholder="0.00"
                            />
                            {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Trạng thái *
                            </label>
                            <select
                                name="status"
                                required
                                value={formData.status}
                                onChange={(e) => handleChange('status', e.target.value as any)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${errors.status ? 'border-red-400' : 'border-gray-300'}`}
                            >
                                <option value="active">Hoạt động</option>
                                <option value="inactive">Không hoạt động</option>
                                <option value="hidden">Ẩn</option>
                            </select>
                            {errors.status && <p className="text-red-600 text-sm mt-1">{errors.status}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thời gian bảo hành (tháng)
                            </label>
                            <input
                                name="warrantyPeriod"
                                type="number"
                                min="0"
                                value={formData.warrantyPeriod as any}
                                onChange={(e) => handleChange('warrantyPeriod', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${errors.warrantyPeriod ? 'border-red-400' : 'border-gray-300'}`}
                                placeholder="Số tháng bảo hành..."
                            />
                            {errors.warrantyPeriod && <p className="text-red-600 text-sm mt-1">{errors.warrantyPeriod}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Điều kiện bảo hành
                            </label>
                            <input
                                name="warrantyCondition"
                                type="text"
                                value={formData.warrantyCondition}
                                onChange={(e) => handleChange('warrantyCondition', e.target.value)}
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
                                name="createdAt"
                                type="date"
                                value={formData.createdAt}
                                onChange={(e) => handleChange('createdAt', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${errors.createdAt ? 'border-red-400' : 'border-gray-300'}`}
                            />
                            {errors.createdAt && <p className="text-red-600 text-sm mt-1">{errors.createdAt}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ngày cập nhật
                            </label>
                            <input
                                name="updatedAt"
                                type="date"
                                value={formData.updatedAt}
                                onChange={(e) => handleChange('updatedAt', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${errors.updatedAt ? 'border-red-400' : 'border-gray-300'}`}
                            />
                            {errors.updatedAt && <p className="text-red-600 text-sm mt-1">{errors.updatedAt}</p>}
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