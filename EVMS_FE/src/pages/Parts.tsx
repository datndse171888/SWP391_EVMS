import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Part } from '../types/Part';
import { fetchParts } from '../api/PartApi';
import PartCard from '../components/PartCard';
import RecentlyViewed from '../components/RecentlyViewed';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import Clean from '../assets/images/clean.png';

export const Parts: React.FC = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');
  const limit = 12;
  const { recentlyViewed, removeFromRecentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }),
    []
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchParts({ page: currentPage, limit, search: searchTerm });
      if (res?.success) {
        let sortedParts = res.data.parts || [];
        
        // Apply sorting
        if (sortBy === 'price-asc') {
          sortedParts = [...sortedParts].sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-desc') {
          sortedParts = [...sortedParts].sort((a, b) => b.price - a.price);
        } else {
          sortedParts = [...sortedParts].sort((a, b) => a.name.localeCompare(b.name));
        }
        
        setParts(sortedParts);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } else {
        setParts([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách linh kiện:', err);
      setParts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm, sortBy]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as 'name' | 'price-asc' | 'price-desc');
    setCurrentPage(1);
  };

  return (
    <div className="relative min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="py-20 pt-32 pb-16 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage: `url(${Clean})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-6xl font-bold text-blue-900 mb-6 drop-shadow-lg">
            Linh Kiện
          </h1>
          <p className="text-xl text-blue-300 mb-8 max-w-3xl mx-auto">
            Cung cấp linh kiện chính hãng chất lượng cao cho tất cả các loại phương tiện điện.
            Đảm bảo độ bền, hiệu suất và an toàn cho xe của bạn.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filter Bar */}
          <div className="mb-12 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Form */}
              <form onSubmit={handleSearch} className="w-full md:flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm linh kiện..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full px-6 py-3 pl-12 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </form>

              {/* Sort Dropdown */}
              <div className="w-full md:w-auto flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors bg-white"
                >
                  <option value="name">Sắp xếp: Tên A-Z</option>
                  <option value="price-asc">Sắp xếp: Giá thấp đến cao</option>
                  <option value="price-desc">Sắp xếp: Giá cao đến thấp</option>
                </select>
              </div>
            </div>

            {/* Results Info */}
            <div className="text-sm text-gray-600">
              Tìm thấy <span className="font-semibold text-gray-900">{parts.length}</span> linh kiện
              {searchTerm && ` cho từ khóa "${searchTerm}"`}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          )}

          {/* Parts Grid */}
          {!loading && parts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {parts.map((part) => (
                <PartCard key={part.id} part={part} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && parts.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy linh kiện</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? `Không có linh kiện nào phù hợp với từ khóa "${searchTerm}"`
                  : 'Hiện tại chưa có linh kiện nào trong hệ thống'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                >
                  Xóa tìm kiếm
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && parts.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border-2 border-gray-200 hover:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      currentPage === page
                        ? 'bg-orange-500 text-white'
                        : 'border-2 border-gray-200 hover:border-orange-500 text-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border-2 border-gray-200 hover:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Recently Viewed Section */}
          {recentlyViewed.length > 0 && (
            <RecentlyViewed
              items={recentlyViewed}
              onRemove={removeFromRecentlyViewed}
              onClear={clearRecentlyViewed}
            />
          )}

          {/* Info Section */}
          <div className="mt-20 bg-gradient-to-r from-orange-50 to-blue-50 rounded-2xl p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h3 className="text-3xl font-bold text-blue-900 mb-6">Tại sao chọn linh kiện của chúng tôi?</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Chính hãng 100%</h4>
                      <p className="text-gray-600">Tất cả linh kiện đều là hàng chính hãng, có chứng chỉ bảo hành</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Giá cạnh tranh</h4>
                      <p className="text-gray-600">Cung cấp giá tốt nhất trên thị trường với chất lượng đảm bảo</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Bảo hành toàn diện</h4>
                      <p className="text-gray-600">Bảo hành dài hạn, hỗ trợ kỹ thuật 24/7</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Linh kiện chất lượng"
                  className="rounded-lg shadow-lg w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Parts;

