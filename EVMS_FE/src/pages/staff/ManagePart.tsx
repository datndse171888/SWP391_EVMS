import React, { useState } from 'react';
import { PartApi } from '../../api/PartApi';
import { InventoryApi } from '../../api/Inventory';
import type { InventoryItemResponse } from '../../api/Inventory';
import type { AxiosError } from 'axios';

interface Part {
  id: string;
  inventoryId?: string;
  name: string;
  description?: string;
  manufacturer?: string;
  partNumber?: string;
  price: number;
  status: 'active' | 'inactive';
  category?: 'tires' | 'oil' | 'filters' | 'brakes' | 'electrical' | 'cooling' | 'suspension' | 'transmission' | 'accessories';
  warrantyPeriod?: number;
  warrantyCondition?: string;
  stockQuantity?: number;
  createdAt: string;
  updatedAt: string;
}

interface PartFormData {
  name: string;
  description: string;
  manufacturer: string;
  partNumber: string;
  price: string;
  status: 'active' | 'inactive';
  category: 'tires' | 'oil' | 'filters' | 'brakes' | 'electrical' | 'cooling' | 'suspension' | 'transmission' | 'accessories';
  warrantyPeriod: string;
  warrantyCondition: string;
  quantity: string;
}

// Removed PartUsage since the 'Lịch sử sử dụng' tab was replaced by 'Đang hoạt động'

const ManagePart: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'inventory' | 'low-stock' | 'active'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  // Filters
  const [filterManufacturer, setFilterManufacturer] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [priceCap, setPriceCap] = useState<number>(50000000); // 50,000,000đ
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiParts, setApiParts] = useState<Part[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPart, setImportPart] = useState<Part | null>(null);
  const [importQuantity, setImportQuantity] = useState<string>('');
  const [importError, setImportError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState<PartFormData>({
    name: '',
    description: '',
    manufacturer: '',
    partNumber: '',
    price: '',
    status: 'active',
    category: 'accessories',
    warrantyPeriod: '',
    warrantyCondition: '',
    quantity: '0',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PartFormData, string>>>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Bỏ mock data: toàn bộ dữ liệu lấy từ API

  // Lịch sử sử dụng tab được thay bằng tab Đang hoạt động

  // Load inventory from API (with full Part) and map to Part card data
  const fetchKey = `${currentPage}-${itemsPerPage}`;

  React.useEffect(() => {
    let isCancelled = false;

    const fetchParts = async () => {
      try {
        setLoading(true);
        setApiError(null);
        console.log('[ManagePart] Fetch inventories start', { page: currentPage, limit: itemsPerPage });
        const { items } = await InventoryApi.getWithParts({ page: currentPage, limit: itemsPerPage });
        console.log('[ManagePart] Fetch inventories success', { itemsCount: items?.length, firstItem: items?.[0] });
        if (isCancelled) return;
        const mapped: Part[] = items.map((inv: InventoryItemResponse) => ({
          id: inv.partID?._id || inv._id,
          inventoryId: inv._id,
          name: inv.partID?.name || '—',
          description: inv.partID?.description,
          manufacturer: inv.partID?.manufacturer,
          partNumber: inv.partID?.partNumber,
          price: inv.partID?.price ?? 0,
          status: (inv.partID?.status as Part['status']) || 'active',
          category: inv.partID?.category as Part['category'],
          warrantyPeriod: inv.partID?.warrantyPeriod,
          warrantyCondition: inv.partID?.warrantyCondition,
          stockQuantity: inv.quantity,
          createdAt: inv.partID?.createdAt || '',
          updatedAt: inv.partID?.updatedAt || '',
        }));
        console.log('[ManagePart] Mapped parts', { mappedCount: mapped.length, firstMapped: mapped[0] });
        setApiParts(mapped);
      } catch (e) {
        console.error('[ManagePart] Load inventory failed:', e);
        setApiError('Không tải được dữ liệu kho từ server. Đang hiển thị dữ liệu mẫu.');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    fetchParts();
    return () => { isCancelled = true; };
  }, [currentPage, itemsPerPage, fetchKey]);

  // Dữ liệu nguồn: lấy từ API; không còn fallback mock
  const baseParts: Part[] = apiParts;

  React.useEffect(() => {
    console.log('[ManagePart] State updated: apiParts', { count: apiParts.length, first: apiParts[0] });
  }, [apiParts]);

  // Filter function
  const partCategoryEq = (part: Part, cat: string) => {
    return (part.category || '') === cat;
  };

  const priceWithin = (price: number, min: number | undefined, max: number | undefined) => {
    const minVal = min;
    const maxVal = max;
    if (minVal !== undefined && price < minVal) return false;
    if (maxVal !== undefined && price > maxVal) return false;
    return true;
  };

  const formatCurrency = (value: number) => value.toLocaleString('vi-VN') + 'đ';

  const filterParts = React.useCallback((parts: Part[]) => {
    const result = parts.filter(part => {
      const matchesSearch = searchTerm === '' || 
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === '' || partCategoryEq(part, filterCategory);
      const withinPrice = priceWithin(part.price, 0, priceCap);
      const matchesManufacturer = filterManufacturer === '' || part.manufacturer === filterManufacturer;
      
      return matchesSearch && matchesCategory && withinPrice && matchesManufacturer;
    });
    console.log('[ManagePart] Filter parts', {
      sourceCount: parts.length,
      searchTerm,
      filterCategory,
      priceCap,
      filterManufacturer,
      filteredCount: result.length,
    });
    return result;
  }, [searchTerm, filterManufacturer, filterCategory, priceCap]);

  const filteredParts = React.useMemo(() => filterParts(baseParts), [baseParts, filterParts]);
  // Theo BE: 0 => out_of_stock, 1..10 => low_stock, >10 => in_stock
  const lowStockParts = React.useMemo(() => filteredParts.filter(part => {
    const q = part.stockQuantity || 0;
    return q > 0 && q <= 10;
  }), [filteredParts]);
  const activeParts = React.useMemo(() => filteredParts.filter(part => part.status === 'active'), [filteredParts]);

  // Pagination logic
  const getCurrentData = React.useCallback(() => {
    let data = [];
    switch (selectedTab) {
      case 'inventory':
        data = filteredParts;
        break;
      case 'low-stock':
        data = lowStockParts;
        break;
      case 'active':
        data = activeParts;
        break;
      default:
        data = filteredParts;
    }
    return data;
  }, [filteredParts, lowStockParts, activeParts, selectedTab]);

  const currentData = React.useMemo(() => getCurrentData(), [getCurrentData]);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = currentData.slice(startIndex, endIndex);


  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterManufacturer, filterCategory, priceCap, selectedTab]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { text: 'Hoạt động', color: 'bg-blue-100 text-blue-800' },
      inactive: { text: 'Ngừng hoạt động', color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-200 text-red-900">Hết hàng</span>;
    }
    if (quantity <= 10) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Sắp hết</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Đủ hàng</span>;
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (formErrors[name as keyof PartFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof PartFormData, string>> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Tên linh kiện là bắt buộc';
    }
    
    const priceValue = parseFloat(formData.price);
    if (!formData.price || isNaN(priceValue) || priceValue < 1000) {
      errors.price = 'Giá phải từ 1.000 VNĐ trở lên';
    }
    
    const quantityValue = parseFloat(formData.quantity);
    if (formData.quantity && (isNaN(quantityValue) || quantityValue < 0)) {
      errors.quantity = 'Số lượng không thể âm';
    }
    
    if (formData.warrantyPeriod && (!formData.warrantyCondition || !formData.warrantyCondition.trim())) {
      errors.warrantyCondition = 'Cần nhập điều kiện bảo hành nếu có thời hạn bảo hành';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Detect changes in edit mode to prevent no-op updates
  const isEditMode = modalMode === 'edit';
  const isFormDirty = React.useMemo(() => {
    if (!isEditMode || !editingPart) return true; // create always allowed
    const toNumberOrUndefined = (v: string) => (v === '' ? undefined : Number(v));
    const original = {
      description: editingPart.description || undefined,
      manufacturer: editingPart.manufacturer || undefined,
      price: editingPart.price,
      status: editingPart.status,
      category: editingPart.category,
      warrantyPeriod: editingPart.warrantyPeriod,
      warrantyCondition: editingPart.warrantyCondition || undefined,
    };
    const current = {
      description: formData.description.trim() || undefined,
      manufacturer: formData.manufacturer.trim() || undefined,
      price: parseFloat(formData.price || '0'),
      status: formData.status,
      category: formData.category,
      warrantyPeriod: toNumberOrUndefined(formData.warrantyPeriod),
      warrantyCondition: formData.warrantyCondition.trim() || undefined,
    };
    return JSON.stringify(original) !== JSON.stringify(current);
  }, [isEditMode, editingPart, formData.description, formData.manufacturer, formData.price, formData.status, formData.category, formData.warrantyPeriod, formData.warrantyCondition]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('[ManagePart] Form submission started');
    console.log('[ManagePart] Form data:', formData);
    
    if (!validateForm()) {
      console.log('[ManagePart] Form validation failed:', formErrors);
      return;
    }
    
    if (modalMode === 'edit' && !isFormDirty) {
      setNotification({ type: 'error', message: 'Không có nội dung thay đổi' });
      setTimeout(() => setNotification(null), 2500);
      return;
    }

    setIsSubmitting(true);
    
    // Prepare request data
    const requestData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      manufacturer: formData.manufacturer.trim() || undefined,
      partNumber: formData.partNumber.trim() || undefined,
      price: parseFloat(formData.price),
      status: formData.status || 'active',
      category: formData.category,
      warrantyPeriod: formData.warrantyPeriod ? parseFloat(formData.warrantyPeriod) : undefined,
      warrantyCondition: formData.warrantyCondition.trim() || undefined,
      quantity: formData.quantity !== undefined && formData.quantity !== null && formData.quantity !== '' 
        ? parseFloat(formData.quantity) 
        : 0,
    };
    
    console.log('[ManagePart] Submitting form with data:', requestData);
    
    try {
      if (modalMode === 'edit' && editingPart) {
        const updatePayload = {
          description: requestData.description,
          manufacturer: requestData.manufacturer,
          price: requestData.price,
          status: requestData.status,
          category: requestData.category,
          warrantyPeriod: requestData.warrantyPeriod,
          warrantyCondition: requestData.warrantyCondition,
        };
        console.log('[ManagePart] Calling PartApi.updatePart with data:', updatePayload);
        const resp = await PartApi.updatePart(editingPart.id, updatePayload);
        const updatedAny = resp.data.part as unknown as Record<string, unknown>;
        setApiParts(prev => prev.map(p => p.id === editingPart.id ? {
          ...p,
          description: (updatedAny.description as string | undefined) ?? p.description,
          manufacturer: (updatedAny.manufacturer as string | undefined) ?? p.manufacturer,
          price: (updatedAny.price as number | undefined) ?? p.price,
          status: ((updatedAny.status as 'active' | 'inactive' | undefined)) ?? p.status,
          category: (updatedAny.category as Part['category'] | undefined) ?? p.category,
          warrantyPeriod: (updatedAny.warrantyPeriod as number | undefined) ?? p.warrantyPeriod,
          warrantyCondition: (updatedAny.warrantyCondition as string | undefined) ?? p.warrantyCondition,
          updatedAt: (updatedAny.updatedAt as string | undefined) ?? p.updatedAt,
        } : p));
        setNotification({ type: 'success', message: resp.data.message || 'Cập nhật linh kiện thành công!' });
      } else {
        console.log('[ManagePart] Calling PartApi.createPartWithInventory with data:', requestData);
        const response = await PartApi.createPartWithInventory(requestData);
        const createdUnknown = response.data as unknown;
        const created = createdUnknown as { message: string; part: Record<string, unknown>; inventory?: Record<string, unknown> };
        const rp = created.part;
        const ri = created.inventory || {};
        const newPart: Part = {
          id: String((rp.id as string) ?? (rp._id as string) ?? ''),
          inventoryId: String((ri._id as string) ?? ''),
          name: (rp.name as string) || '',
          description: rp.description as string | undefined,
          manufacturer: rp.manufacturer as string | undefined,
          partNumber: rp.partNumber as string | undefined,
          price: Number(rp.price ?? 0),
          status: ((rp.status as string) as 'active' | 'inactive') || 'active',
          category: rp.category as Part['category'] | undefined,
          warrantyPeriod: rp.warrantyPeriod as number | undefined,
          warrantyCondition: rp.warrantyCondition as string | undefined,
          stockQuantity: Number((ri.quantity as number | undefined) ?? 0),
          createdAt: (rp.createdAt as string) || new Date().toISOString(),
          updatedAt: (rp.updatedAt as string) || new Date().toISOString(),
        };
        setApiParts(prev => [newPart, ...prev]);
        setNotification({ type: 'success', message: created.message || 'Thêm linh kiện thành công!' });
      }

      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        manufacturer: '',
        partNumber: '',
        price: '',
        status: 'active',
        category: 'accessories',
        warrantyPeriod: '',
        warrantyCondition: '',
        quantity: '0',
      });
      setFormErrors({});
      setIsAddModalOpen(false);
      setModalMode('create');
      setEditingPart(null);
      
      console.log('[ManagePart] Form submitted successfully.');
      
      // Auto hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
      
      // Không reload lại trang để tránh chớp màn hình
      
    } catch (error: unknown) {
      console.error('[ManagePart] Error submitting form:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi thêm linh kiện';
      let showNotification = true;
      const newFormErrors: Partial<Record<keyof PartFormData, string>> = {};
      
      // Handle Axios error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosError<{ 
          message?: string; 
          error?: string; 
          errors?: string[] | { name?: string; partNumber?: string; price?: string; quantity?: string } 
        }>;
        console.error('[ManagePart] Axios error response:', axiosError.response);
        
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          errorMessage = errorData.message || errorData.error || `HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`;
          const collected: string[] = [];
          
          // Parse validation errors - hiển thị trong form
          // Nếu BE trả về errors object với field cụ thể
          if (errorData.errors && typeof errorData.errors === 'object' && !Array.isArray(errorData.errors)) {
            // BE trả về { name: "...", partNumber: "..." }
            const fieldErrors = errorData.errors as { name?: string; partNumber?: string; price?: string; quantity?: string };
            if (fieldErrors.name) {
              newFormErrors.name = fieldErrors.name;
              showNotification = false;
              collected.push(fieldErrors.name);
            }
            if (fieldErrors.partNumber) {
              newFormErrors.partNumber = fieldErrors.partNumber;
              showNotification = false;
              collected.push(fieldErrors.partNumber);
            }
            if (fieldErrors.price) {
              newFormErrors.price = fieldErrors.price;
              showNotification = false;
              collected.push(fieldErrors.price);
            }
            if (fieldErrors.quantity) {
              newFormErrors.quantity = fieldErrors.quantity;
              showNotification = false;
              collected.push(fieldErrors.quantity);
            }
            if (collected.length) setSubmitErrors(collected);
          } else if (errorData.message) {
            // Fallback: Parse từ message nếu BE chưa trả về errors object
            const message = errorData.message.toLowerCase();
            
            // Kiểm tra lỗi trùng tên (chỉ về tên)
            if (message.includes('tên linh kiện đã tồn tại') || (message.includes('tên') && message.includes('tồn tại') && !message.includes('mã'))) {
              newFormErrors.name = 'Tên linh kiện đã tồn tại';
              showNotification = false;
              setSubmitErrors(['Tên linh kiện đã tồn tại']);
            }
            
            // Kiểm tra lỗi trùng mã (chỉ về mã)
            if (message.includes('mã linh kiện đã tồn tại') || (message.includes('mã') && message.includes('tồn tại') && !message.includes('tên'))) {
              newFormErrors.partNumber = 'Mã linh kiện đã tồn tại';
              showNotification = false;
              setSubmitErrors(['Mã linh kiện đã tồn tại']);
            }
            
            // Kiểm tra lỗi trùng cả tên và mã
            if (message.includes('tên và mã') || (message.includes('tên') && message.includes('mã') && message.includes('tồn tại'))) {
              newFormErrors.name = 'Tên linh kiện đã tồn tại';
              newFormErrors.partNumber = 'Mã linh kiện đã tồn tại';
              showNotification = false;
              setSubmitErrors(['Tên linh kiện đã tồn tại', 'Mã linh kiện đã tồn tại']);
            }
            
            // Kiểm tra lỗi giá
            if (message.includes('giá') && message.includes('1.000')) {
              newFormErrors.price = 'Giá phải từ 1.000 VNĐ trở lên';
              showNotification = false;
              setSubmitErrors(['Giá phải từ 1.000 VNĐ trở lên']);
            }
            
            // Kiểm tra lỗi số lượng
            if (message.includes('số lượng') && (message.includes('âm') || message.includes('không thể'))) {
              newFormErrors.quantity = 'Số lượng không thể âm';
              showNotification = false;
              setSubmitErrors(['Số lượng không thể âm']);
            }
            
            // Kiểm tra validation errors từ BE (array)
            if (errorData.errors && Array.isArray(errorData.errors)) {
              const arrMsgs: string[] = [];
              errorData.errors.forEach((err: string) => {
                const errLower = err.toLowerCase();
                if (errLower.includes('name') || (errLower.includes('tên') && !errLower.includes('mã'))) {
                  newFormErrors.name = err;
                } else if (errLower.includes('partnumber') || (errLower.includes('mã') && !errLower.includes('tên'))) {
                  newFormErrors.partNumber = err;
                } else if (errLower.includes('price') || errLower.includes('giá')) {
                  newFormErrors.price = err;
                } else if (errLower.includes('quantity') || errLower.includes('số lượng')) {
                  newFormErrors.quantity = err;
                }
                arrMsgs.push(err);
              });
              showNotification = false;
              setSubmitErrors(arrMsgs);
            }
          }
          
          console.error('[ManagePart] Error data:', errorData);
        } else if (axiosError.response?.status) {
          errorMessage = `HTTP ${axiosError.response.status}: ${axiosError.response.statusText || 'Lỗi không xác định'}`;
          setSubmitErrors([errorMessage]);
        } else if (axiosError.request) {
          errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
          console.error('[ManagePart] Network error - no response received');
          setSubmitErrors([errorMessage]);
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
        console.error('[ManagePart] Error message:', error.message);
        console.error('[ManagePart] Error stack:', error.stack);
      } else {
        console.error('[ManagePart] Unknown error type:', typeof error, error);
      }
      
      // Set form errors nếu có
      if (Object.keys(newFormErrors).length > 0) {
        setFormErrors(newFormErrors);
        // Scroll to first error field
        const firstErrorField = Object.keys(newFormErrors)[0];
        const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (errorElement as HTMLElement).focus();
        }
      }
      
      console.error('[ManagePart] Final error message:', errorMessage);
      
      // Chỉ hiện notification nếu không phải lỗi validation (đã hiện trong form)
      if (showNotification) {
        setNotification({
          type: 'error',
          message: errorMessage
        });
        
        // Auto hide notification after 5 seconds
        setTimeout(() => {
          setNotification(null);
        }, 5000);
      }
    } finally {
      setIsSubmitting(false);
      console.log('[ManagePart] Form submission process completed');
    }
  };

  // Reset form when modal closes
  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setNotification(null);
    setSubmitErrors([]);
    setFormData({
      name: '',
      description: '',
      manufacturer: '',
      partNumber: '',
      price: '',
      status: 'active',
      category: 'accessories',
      warrantyPeriod: '',
      warrantyCondition: '',
      quantity: '0',
    });
    setFormErrors({});
  };

  // Pagination component
  const renderPagination = () => {
    // Always show pagination if there are items
    if (currentData.length === 0) return null;

    const totalPages = Math.ceil(currentData.length / itemsPerPage);
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }







    return (
      <div className="flex items-center justify-between mt-3 p-2 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Hiển thị:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={8}>8</option>
            <option value={16}>16</option>
            <option value={24}>24</option>
            <option value={32}>32</option>
          </select>
          <span className="text-sm text-gray-600">
            {startIndex + 1}-{Math.min(endIndex, currentData.length)} trong {currentData.length} linh kiện
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {/* Previous button */}
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* First page */}
          {startPage > 1 && (
            <>
              <button
                onClick={() => setCurrentPage(1)}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100"
              >
                1
              </button>
              {startPage > 2 && <span className="px-2 text-gray-400">...</span>}
            </>
          )}

          {/* Page numbers */}
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${currentPage === page
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
            >
              {page}
            </button>
          ))}

          {/* Last page */}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2 text-gray-400">...</span>}
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100"
              >
                {totalPages}
              </button>
            </>
          )}

          {/* Next button */}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  const renderPartCard = (part: Part) => {
    return (
      <div key={part.id} className="bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow h-56">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">{part.name}</h3>
            <p className="text-xs text-gray-600 mb-1 truncate">{part.description}</p>
            <div className="flex items-center space-x-1 mb-1">
              <span className="text-xs text-gray-500">Mã:</span>
              <span className="text-xs font-medium text-gray-700 truncate">{part.partNumber}</span>
            </div>
            <div className="flex items-center space-x-1 mb-1">
              <span className="text-xs text-gray-500">NSX:</span>
              <span className="text-xs font-medium text-gray-700 truncate">{part.manufacturer}</span>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1 ml-2">
            {getStatusBadge(part.status)}
            {getStockBadge(part.stockQuantity || 0)}
          </div>
        </div>

        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Giá:</span>
            <span className="text-sm font-bold" style={{ color: '#f6ae2d' }}>
              {part.price.toLocaleString('vi-VN')}đ
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Tồn kho:</span>
            <span className="text-xs font-medium text-gray-700">
              {part.stockQuantity || 0} sp
            </span>
          </div>
        </div>

        {part.warrantyPeriod && (
          <div className="mb-2 p-1.5 rounded text-xs" style={{ backgroundColor: '#8dcdfa', color: '#014091' }}>
            BH: {part.warrantyPeriod} {part.warrantyCondition}
          </div>
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              setModalMode('edit');
              setEditingPart(part);
              setFormData({
                name: part.name,
                description: part.description || '',
                manufacturer: part.manufacturer || '',
                partNumber: part.partNumber || '',
                price: String(part.price || ''),
                status: part.status || 'active',
                category: part.category || 'accessories',
                warrantyPeriod: part.warrantyPeriod !== undefined ? String(part.warrantyPeriod) : '',
                warrantyCondition: part.warrantyCondition || '',
                quantity: '',
              });
              setSubmitErrors([]);
              setIsAddModalOpen(true);
            }}
            className="px-2 py-1 bg-white text-gray-700 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 transition-colors"
            aria-label="Sửa"
            title="Sửa"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
          </button>

          <div className="flex space-x-1">
            <button 
              className="px-2 py-1 text-white rounded text-xs font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: '#f6ae2d' }}
            onClick={() => {
                setImportPart(part);
                setImportQuantity('');
              setImportError('');
                setIsImportModalOpen(true);
              }}
            >
              Nhập
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Notification component
  const NotificationToast = () => {
    if (!notification) return null;
    
    return (
      <div 
        className="fixed top-4 right-4 z-50 transition-all duration-300 ease-out"
        style={{
          transform: 'translateX(0)',
          animation: 'slideInRight 0.3s ease-out'
        }}
      >
        <style>{`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}</style>
        <div
          className={`px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-[300px] max-w-md ${
            notification.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <p
            className={`flex-1 text-sm font-medium ${
              notification.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {notification.message}
          </p>
          <button
            onClick={() => setNotification(null)}
            className={`text-gray-400 hover:text-gray-600 transition-colors ${
              notification.type === 'success' ? 'hover:text-green-600' : 'hover:text-red-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen space-y-2 pb-8">
      {/* Notification Toast */}
      <NotificationToast />
      {/* API status banner */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs px-3 py-2 rounded">
          Đang tải dữ liệu kho...
        </div>
      )}
      {apiError && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-3 py-2 rounded">
          {apiError}
        </div>
      )}
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold" style={{ color: '#014091' }}>
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
                className="w-80 px-3 py-1.5 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <svg className="absolute left-2 top-2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-1.5 text-white rounded-lg transition-colors text-sm font-medium hover:opacity-90"
              style={{ backgroundColor: '#014091' }}
            >
              Thêm linh kiện
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white rounded-lg shadow-sm p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: '#5f6777' }}>Tổng linh kiện</p>
              <p className="text-lg font-bold" style={{ color: '#014091' }}>{baseParts.length}</p>
            </div>
            <div className="p-2 rounded-full" style={{ backgroundColor: '#8dcdfa' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#014091' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: '#5f6777' }}>Sắp hết hàng</p>
              <p className="text-lg font-bold" style={{ color: '#fd8c40' }}>{lowStockParts.length}</p>
            </div>
            <div className="p-2 rounded-full" style={{ backgroundColor: '#f6ae2d' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#014091' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: '#5f6777' }}>Đang hoạt động</p>
              <p className="text-lg font-bold" style={{ color: '#0991f3' }}>{activeParts.length}</p>
            </div>
            <div className="p-2 rounded-full" style={{ backgroundColor: '#0991f3' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'white' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: '#5f6777' }}>Tổng giá trị</p>
              <p className="text-lg font-bold" style={{ color: '#014091' }}>
                {baseParts.reduce((sum, part) => sum + (part.price * (part.stockQuantity || 0)), 0).toLocaleString('vi-VN')}đ
              </p>
            </div>
            <div className="p-2 rounded-full" style={{ backgroundColor: '#8abdfe' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#014091' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>


      {/* Tabs and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-2">
        <div className="flex items-center justify-between mb-2">
          <nav className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setSelectedTab('inventory')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${selectedTab === 'inventory'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Tất cả linh kiện ({filteredParts.length})
            </button>
            <button
              onClick={() => setSelectedTab('low-stock')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${selectedTab === 'low-stock'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Sắp hết hàng ({lowStockParts.length})
            </button>
            <button
              onClick={() => setSelectedTab('active')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'active'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Đang hoạt động ({activeParts.length})
            </button>
          </nav>

          {/* Filters on the right */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <label className="text-xs font-medium text-gray-700">Danh mục:</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-xs"
              >
                <option value="">Tất cả</option>
                <option value="tires">Lốp xe</option>
                <option value="oil">Dầu nhớt</option>
                <option value="filters">Lọc</option>
                <option value="brakes">Phanh</option>
                <option value="electrical">Điện</option>
                <option value="cooling">Làm mát</option>
                <option value="suspension">Giảm xóc</option>
                <option value="transmission">Truyền động</option>
                <option value="accessories">Phụ kiện</option>
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <label className="text-xs font-medium text-gray-700">NSX:</label>
              <select
                value={filterManufacturer}
                onChange={(e) => setFilterManufacturer(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-xs"
              >
                <option value="">Tất cả</option>
                {Array.from(new Set(baseParts.map(p => p.manufacturer).filter(Boolean))).sort().map((mfr) => (
                  <option key={String(mfr)} value={String(mfr)}>{String(mfr)}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-xs font-medium text-gray-700">Giá:</label>
              <div className="relative w-64">
                <input
                  type="range"
                  min={0}
                  max={50000000}
                  step={50000}
                  value={priceCap}
                  onChange={(e) => setPriceCap(Number(e.target.value))}
                  className="w-full"
                />
                <div
                  className="absolute -top-6 transform -translate-x-1/2 bg-white border border-gray-300 text-gray-700 text-[10px] px-2 py-0.5 rounded"
                  style={{ left: `${(priceCap / 50000000) * 100}%` }}
                >
                  {formatCurrency(priceCap)}
                </div>
              </div>
              <span className="text-xs text-gray-500">0đ - 50.000.000đ</span>
            </div>

            <button
              onClick={() => {
                setSearchTerm('');
                setFilterManufacturer('');
                setFilterCategory('');
                setPriceCap(50000000);
              }}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
            >
              Xóa
            </button>
          </div>
        </div>

        {/* Content Grid */}
         <div 
           className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${
             itemsPerPage > 8 ? 'overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100' : ''
           }`}
           style={{
             height: itemsPerPage > 8 ? '455px' : '455px',
             scrollbarWidth: itemsPerPage > 8 ? 'thin' : 'auto',
             scrollbarColor: itemsPerPage > 8 ? '#d1d5db #f3f4f6' : 'auto'
           }}
         >
           {selectedTab === 'inventory' && (paginatedData as Part[]).map(renderPartCard)}
           {selectedTab === 'low-stock' && (paginatedData as Part[]).map(renderPartCard)}
           {selectedTab === 'active' && (paginatedData as Part[]).map(renderPartCard)}
        </div>

        {/* Pagination */}
        {renderPagination()}

        {/* Empty State - centered in content area */}
        {currentData.length === 0 && (
          <div className="flex items-center justify-center min-h-[460px]">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {selectedTab === 'inventory' && 'Không tìm thấy linh kiện nào'}
                {selectedTab === 'low-stock' && 'Không có linh kiện nào sắp hết hàng'}
                {selectedTab === 'active' && 'Không có linh kiện đang hoạt động'}
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                {selectedTab === 'inventory' && 'Thử thay đổi bộ lọc hoặc tìm kiếm khác.'}
                {selectedTab === 'low-stock' && 'Tất cả linh kiện đều có đủ hàng.'}
                {selectedTab === 'active' && 'Không có linh kiện nào đang hoạt động.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Part Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" style={{ backdropFilter: 'blur(2px)' }} onClick={handleCloseModal}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ color: '#014091' }}>
                  {modalMode === 'edit' ? 'Cập nhật linh kiện' : 'Thêm linh kiện mới'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-3">
              {submitErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded">
                  <ul className="list-disc pl-4 space-y-1">
                    {submitErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Name - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên linh kiện <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={modalMode === 'edit'}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  } ${modalMode === 'edit' ? 'bg-red-50 cursor-not-allowed text-gray-600' : ''}`}
                  placeholder="Nhập tên linh kiện"
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Nhập mô tả linh kiện"
                />
              </div>

              {/* Two columns: Manufacturer and Part Number */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nhà sản xuất
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Nhập tên nhà sản xuất"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã linh kiện
                  </label>
                  <input
                    type="text"
                    name="partNumber"
                    value={formData.partNumber}
                    onChange={handleInputChange}
                    disabled={modalMode === 'edit'}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      formErrors.partNumber ? 'border-red-500' : 'border-gray-300'
                    } ${modalMode === 'edit' ? 'bg-red-50 cursor-not-allowed text-gray-600' : ''}`}
                    placeholder="Nhập mã linh kiện"
                  />
                  {formErrors.partNumber && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.partNumber}</p>
                  )}
                </div>
              </div>

              {/* Two columns: Price and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="1000"
                    step="1000"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      formErrors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập giá (tối thiểu 1.000 VNĐ)"
                  />
                  {formErrors.price && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.price}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="tires">Lốp xe</option>
                    <option value="oil">Dầu nhớt</option>
                    <option value="filters">Lọc</option>
                    <option value="brakes">Phanh</option>
                    <option value="electrical">Điện</option>
                    <option value="cooling">Làm mát</option>
                    <option value="suspension">Giảm xóc</option>
                    <option value="transmission">Truyền động</option>
                    <option value="accessories">Phụ kiện</option>
                  </select>
                </div>
              </div>

              {/* Two columns: Status and Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Ngừng hoạt động</option>
                  </select>
                </div>
                {modalMode === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng tồn kho
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      formErrors.quantity ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập số lượng"
                  />
                  {formErrors.quantity && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.quantity}</p>
                  )}
                </div>
                )}
              </div>

              {/* Warranty Section */}
              <div className="border-t border-gray-200 pt-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Thông tin bảo hành</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thời hạn bảo hành
                    </label>
                    <input
                      type="number"
                      name="warrantyPeriod"
                      value={formData.warrantyPeriod}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Nhập số"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đơn vị <span className={formData.warrantyPeriod ? 'text-red-500' : 'text-gray-400'}>*</span>
                    </label>
                    <input
                      type="text"
                      name="warrantyCondition"
                      value={formData.warrantyCondition}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        formErrors.warrantyCondition ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ví dụ: tháng"
                    />
                    {formErrors.warrantyCondition && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.warrantyCondition}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Hủy
                </button>

                <div className="flex items-center space-x-3">
                  {isEditMode && !isFormDirty && (
                    <span className="text-xs text-gray-500">Không có nội dung thay đổi</span>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting || (isEditMode && !isFormDirty)}
                    className="px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#014091' }}
                  >
                    {isSubmitting ? (modalMode === 'edit' ? 'Đang cập nhật...' : 'Đang thêm...') : (modalMode === 'edit' ? 'Cập nhật' : 'Thêm linh kiện')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Quantity Modal */}
      {isImportModalOpen && importPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" style={{ backdropFilter: 'blur(2px)' }} onClick={() => { setIsImportModalOpen(false); setNotification(null); setImportError(''); }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold" style={{ color: '#014091' }}>Nhập số lượng</h2>
                <button onClick={() => { setIsImportModalOpen(false); setNotification(null); setImportError(''); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <div className="text-sm text-gray-700">{importPart.name}</div>
              <div className="text-xs text-gray-500">Tồn hiện tại: {importPart.stockQuantity || 0} sp</div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng cần nhập thêm</label>
              <input
                type="number"
                min={1}
                value={importQuantity}
                onChange={(e) => setImportQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Nhập số lượng tăng thêm (>= 1)"
              />
              <p className="text-xs text-gray-500">Số lượng nhập sẽ được cộng dồn. Hiện tại: <span className="font-semibold">{importPart.stockQuantity || 0}</span> sp.</p>
              {importError && (
                <p className="text-xs text-red-600 mt-1">{importError}</p>
              )}
            </div>
            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => { setIsImportModalOpen(false); setNotification(null); }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={async () => {
                  const addVal = Number(importQuantity);
                  if (!Number.isFinite(addVal) || addVal <= 0) {
                    setImportError('Số lượng nhập thêm phải > 0');
                    return;
                  }
                  try {
                    const currentQty = importPart.stockQuantity || 0;
                    const newQty = currentQty + addVal;
                    if (!importPart.inventoryId) {
                      setImportError('Không tìm thấy kho cho linh kiện này. Vui lòng tải lại danh sách.');
                      return;
                    }
                    const resp = await InventoryApi.updateQuantity(importPart.inventoryId, newQty);
                    setApiParts(prev => prev.map(p => p.id === importPart.id ? { ...p, stockQuantity: newQty } : p));
                    setNotification({ type: 'success', message: resp.data?.message || 'Cập nhật số lượng thành công' });
                    setIsImportModalOpen(false);
                    setImportError('');
                  } catch (e) {
                    console.error('[ManagePart] Import quantity failed:', e);
                    let msg = 'Cập nhật số lượng thất bại';
                    if (e && typeof e === 'object' && 'response' in e) {
                      const axiosErr = e as { response?: { data?: { message?: string } } };
                      msg = axiosErr?.response?.data?.message || msg;
                    }
                    setImportError(msg);
                  }
                }}
                className="px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium hover:opacity-90"
                style={{ backgroundColor: '#014091' }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePart;
