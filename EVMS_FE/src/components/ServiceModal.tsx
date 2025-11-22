import { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import type { ServiceResponse } from '../types/Service';
import type { VehicleCategory } from '../types/Vehicle';
import { compressImage, uploadImageApi } from '../api/UploadApi';

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (service: Partial<ServiceResponse>) => void;
    service?: ServiceResponse | null;
    mode: 'create' | 'edit';
}

export const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, onSave, service, mode }: ServiceModalProps) => {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [uploading, setUploading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    const [formData, setFormData] = useState<ServiceResponse>({
        _id: '',
        name: '',
        description: '',
        price: 0,
        duration: 0,
        image: '',
        vehicleCategory: 'BICYCLE',
        periodicEnabled: false,
        intervalMonths: undefined,
        defaultTotalVisits: undefined,
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
                periodicEnabled: service.periodicEnabled || false,
                intervalMonths: service.intervalMonths,
                defaultTotalVisits: service.defaultTotalVisits,
            });
            setImagePreview(service.image || '');
        } else {
            setFormData({
                _id: '',
                name: '',
                description: '',
                price: 0,
                duration: 0,
                image: '',
                vehicleCategory: 'BICYCLE',
                periodicEnabled: false,
                intervalMonths: undefined,
                defaultTotalVisits: undefined,
            });
            setImagePreview('');
        }
        setImageFile(null);
        setErrors({});
    }, [service, mode, isOpen]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setErrors(prev => ({ ...prev, image: 'Chỉ được upload file ảnh' }));
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, image: 'Kích thước file không được vượt quá 5MB' }));
            return;
        }

        setErrors(prev => ({ ...prev, image: '' }));
        setImageFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);

        try {
            let imageUrl = formData.image;

            // Upload image if file is selected
            if (imageFile) {
                try {
                    // Compress image before upload
                    const compressedFile = await compressImage(
                        imageFile,
                        1920, // maxWidth
                        1920, // maxHeight
                        0.7, // quality
                        500 // maxFileSizeKB
                    );

                    // Upload to Cloudinary
                    imageUrl = await uploadImageApi(compressedFile);
                    console.log('✅ Image uploaded successfully:', imageUrl);
                } catch (uploadError: any) {
                    console.error('Lỗi khi upload ảnh:', uploadError);
                    setErrors({ image: uploadError?.message || 'Lỗi khi upload ảnh. Vui lòng thử lại.' });
                    setUploading(false);
                    return;
                }
            }

            onSave({
                _id: formData._id,
                name: formData.name,
                description: formData.description,
                price: formData.price,
                duration: formData.duration,
                image: imageUrl,
                vehicleCategory: formData.vehicleCategory,
                periodicEnabled: formData.periodicEnabled,
                intervalMonths: formData.periodicEnabled ? formData.intervalMonths : undefined,
                defaultTotalVisits: formData.periodicEnabled ? formData.defaultTotalVisits : undefined,
            });
        } catch (error: any) {
            console.error('Error saving service:', error);
            setErrors({ submit: error?.message || 'Có lỗi xảy ra. Vui lòng thử lại.' });
        } finally {
            setUploading(false);
        }
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
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {mode === 'create' ? 'Tạo dịch vụ mới' : 'Chỉnh sửa dịch vụ'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {mode === 'create' ? 'Thêm dịch vụ mới vào hệ thống' : 'Cập nhật thông tin dịch vụ'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                            <span className="w-1 h-4 bg-orange-500 rounded"></span>
                            Thông tin cơ bản
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tên dịch vụ <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                placeholder="VD: Bảo dưỡng định kỳ xe điện"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mô tả
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none transition-all"
                                placeholder="Mô tả chi tiết về dịch vụ..."
                            />
                        </div>
                    </div>

                    {/* Pricing & Duration */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                            <span className="w-1 h-4 bg-blue-500 rounded"></span>
                            Giá & Thời gian
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Giá (VND) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        step="1000"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                        placeholder="500000"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₫</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Thời gian (phút) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.duration}
                                        onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                        placeholder="30"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">phút</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle & Image */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                            <span className="w-1 h-4 bg-purple-500 rounded"></span>
                            Phân loại & Hình ảnh
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Loại phương tiện <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.vehicleCategory}
                                onChange={(e) => setFormData({ ...formData, vehicleCategory: e.target.value as VehicleCategory })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-white"
                            >
                                <option value="BICYCLE">🚲 Xe đạp điện</option>
                                <option value="MOTOBIKE">🛵 Xe máy điện</option>
                                <option value="CAR">🚗 Xe ô tô điện</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hình ảnh dịch vụ
                            </label>

                            {/* Upload from local */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <label className="flex-1 cursor-pointer">
                                        <div className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all">
                                            <Upload size={20} className="text-gray-400" />
                                            <span className="text-sm text-gray-600">
                                                {imageFile ? imageFile.name : 'Chọn ảnh từ máy'}
                                            </span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {/* OR divider */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-gray-300"></div>
                                    <span className="text-xs text-gray-500 font-medium">HOẶC</span>
                                    <div className="flex-1 h-px bg-gray-300"></div>
                                </div>

                                {/* URL input */}
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={(e) => {
                                        handleChange('image', e.target.value);
                                        setImagePreview(e.target.value);
                                        setImageFile(null);
                                    }}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Hoặc dán URL ảnh: https://example.com/image.jpg"
                                />

                                {errors.image && (
                                    <p className="text-sm text-red-500">{errors.image}</p>
                                )}

                                {/* Image preview */}
                                {imagePreview && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-start gap-3">
                                            <ImageIcon size={20} className="text-gray-400 mt-1" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-600 mb-2">Xem trước:</p>
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full max-w-xs h-auto rounded-lg border border-gray-300"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Invalid+Image';
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Periodic Service Settings */}
                    <div className="space-y-4 bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="periodicEnabled"
                                checked={formData.periodicEnabled}
                                onChange={(e) => setFormData({ ...formData, periodicEnabled: e.target.checked })}
                                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                            />
                            <label htmlFor="periodicEnabled" className="text-sm font-semibold text-gray-900 cursor-pointer flex items-center gap-2">
                                <span className="text-lg">🔄</span>
                                <span>Dịch vụ định kỳ</span>
                            </label>
                        </div>

                        {formData.periodicEnabled && (
                            <div className="space-y-4 pl-8 animate-fadeIn">
                                <p className="text-xs text-gray-600 bg-white/60 p-3 rounded-lg border border-green-100">
                                    💡 Dịch vụ định kỳ sẽ tự động nhắc nhở khách hàng theo chu kỳ đã đặt
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
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white"
                                                placeholder="6"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">tháng</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1.5">Khoảng cách giữa các lần (1-24 tháng)</p>
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
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white"
                                                placeholder="12"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">lần</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1.5">Tổng số lần bảo dưỡng (1-60 lần)</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Error message */}
                    {errors.submit && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{errors.submit}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={uploading}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            ✕ Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? '⏳ Đang upload ảnh...' : mode === 'create' ? '✓ Tạo mới' : '✓ Cập nhật'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default ServiceModal;
