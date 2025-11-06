import React, { useRef } from 'react';
import dayjs from 'dayjs';
import type { MaintenanceItem } from '../types/Maintenance';
import './maintenance-timeline.css';

function viCategoryLabel(cat: 'CAR' | 'MOTOBIKE' | 'BICYCLE') {
  switch (cat) {
    case 'CAR': return 'Ô tô điện';
    case 'MOTOBIKE': return 'Xe máy điện';
    case 'BICYCLE': return 'Xe đạp điện';
    default: return String(cat);
  }
}

export function MaintenanceTimeline({ item, onBook }: { item: MaintenanceItem; onBook: (url: string) => void; }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dx: number) => {
    scrollerRef.current?.scrollBy({ left: dx, behavior: 'smooth' });
  };
  return (
    <div className="mtl-card">
      <div className="mtl-header">
        <div className="mtl-title">{item.plateNumber} · {viCategoryLabel(item.vehicleCategory)}</div>
        <div className="mtl-sub">
          Lần gần nhất: {item.lastMaintenanceDate ? dayjs(item.lastMaintenanceDate).format('DD/MM/YYYY') : '—'} ·
          Kế tiếp: {item.nextMaintenanceDate ? dayjs(item.nextMaintenanceDate).format('DD/MM/YYYY') : '—'}
          {typeof item.daysUntilDue === 'number' && (
            <span className={`mtl-due-chip ${item.daysUntilDue < 0 ? 'over' : 'soon'}`}>
              {item.daysUntilDue < 0 ? `Quá hạn ${Math.abs(item.daysUntilDue)} ngày` : `Còn ${item.daysUntilDue} ngày`}
            </span>
          )}
        </div>
      </div>

      <div className="mtl-row">
        <button className="mtl-arrow" aria-label="Prev" onClick={() => scrollBy(-220)}>{'<'}</button>
        <div className="mtl-grid" ref={scrollerRef}>
        {item.timeline.map((s, idx) => {
          const label = dayjs(s.date).format('DD/MM');
          const year = dayjs(s.date).format('YYYY');
          return (
            <div key={idx} className={`mtl-slot ${s.status}`}>
              <div className="mtl-date">{label}</div>
              <div className="mtl-year">{year}</div>
              {s.status === 'dueToday' && item.nextMaintenanceDate &&
               dayjs(s.date).isSame(dayjs(item.nextMaintenanceDate), 'day') && (
                <button className="mtl-book" onClick={() => onBook(item.bookingUrl)}>
                  Đặt lịch
                </button>
              )}
            </div>
          );
        })}
        </div>
        <button className="mtl-arrow" aria-label="Next" onClick={() => scrollBy(220)}>{'>'}</button>
      </div>

      <div className="mtl-legend">
        <span className="dot completed" /> Đã bảo dưỡng
        <span className="dot upcoming" /> Sắp đến
        <span className="dot dueToday" /> Hôm nay
        <span className="dot overdue" /> Quá hạn
        <span className="dot future" /> Tương lai
      </div>
    </div>
  );
}


