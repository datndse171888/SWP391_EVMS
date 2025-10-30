import { useState, useEffect } from 'react';
import type { Part } from '../types/Part';

const STORAGE_KEY = 'recentlyViewedParts';
const MAX_ITEMS = 5; // Lưu tối đa 5 linh kiện gần đây

export interface RecentlyViewedPart extends Part {
  viewedAt: number; // Timestamp khi xem
}

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedPart[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load từ localStorage khi component mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as RecentlyViewedPart[];
        setRecentlyViewed(parsed);
      } catch (error) {
        console.error('Lỗi khi parse recently viewed:', error);
        setRecentlyViewed([]);
      }
    }
    setIsLoaded(true);
  }, []);

  // Thêm part vào lịch sử xem
  const addToRecentlyViewed = (part: Part) => {
    setRecentlyViewed((prev) => {
      // Loại bỏ part nếu đã tồn tại
      const filtered = prev.filter((p) => p.id !== part.id && p._id !== part._id);

      // Thêm part mới vào đầu
      const newPart: RecentlyViewedPart = {
        ...part,
        viewedAt: Date.now(),
      };

      // Giữ tối đa MAX_ITEMS
      const updated = [newPart, ...filtered].slice(0, MAX_ITEMS);

      // Lưu vào localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      return updated;
    });
  };

  // Xóa một part khỏi lịch sử
  const removeFromRecentlyViewed = (partId: string) => {
    setRecentlyViewed((prev) => {
      const updated = prev.filter((p) => p.id !== partId && p._id !== partId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Xóa tất cả lịch sử
  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    recentlyViewed,
    addToRecentlyViewed,
    removeFromRecentlyViewed,
    clearRecentlyViewed,
    isLoaded,
  };
};

