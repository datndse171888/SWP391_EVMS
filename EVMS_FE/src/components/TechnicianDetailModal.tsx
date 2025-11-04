import React, { useEffect } from 'react';
import { X, Mail, Phone, Award } from 'lucide-react';
import type { TechnicianInfo, TechnicianCertificate } from '../types/Technician';

interface TechnicianUser {
  _id: string;
  fullName?: string;
  userName?: string;
  email?: string;
  phoneNumber?: string;
  photoURL?: string;
  role?: string;
}

export interface TechnicianWithMeta {
  user: TechnicianUser;
  info?: TechnicianInfo | null;
  certificates: TechnicianCertificate[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  technician: TechnicianWithMeta | null;
}


export const TechnicianDetailModal: React.FC<Props> = ({ isOpen, onClose, technician }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !technician) return null;

  const { user, info, certificates } = technician;
  const name = user.fullName || user.userName || 'Không tên';
  const avatar = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=fff`;

// mock data (tạm) — sẽ dùng khi technician.certificates rỗng
  const MOCK_CERTS: TechnicianCertificate[] = [
    {
      certificateID: 'EV-TECH-2023-01',
      issuedDate: '2023-02-15',
      expiryDate: '2026-02-14',
      status: 'Active',
      note: 'Chứng chỉ an toàn cao áp',
      certificateImage: ''
    },
    {
      certificateID: 'BAT-MAINT-2022-07',
      issuedDate: '2022-08-01',
      expiryDate: '2025-07-31',
      status: 'Active',
      note: 'Bảo trì hệ thống pin Li-ion',
      certificateImage: ''
    },
    {
      certificateID: 'SW-UPDATE-2021-11',
      issuedDate: '2021-11-10',
      expiryDate: '2024-11-09',
      status: 'Expired',
      note: 'Cập nhật firmware & chuẩn hóa',
      certificateImage: ''
    }
  ];

  const displayCertificates = (certificates && certificates.length > 0) ? certificates : MOCK_CERTS;

  const viewImage = (url?: string) => { if (url) window.open(url, '_blank'); else alert('Không có ảnh'); };
  const copyId = async (id: string) => {
    try { await navigator.clipboard.writeText(id); alert('Đã sao chép mã chứng chỉ'); } catch { alert('Không thể sao chép'); }
  };
  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString() : '—';
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Chi tiết kỹ thuật viên"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-auto max-h-[85vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Chi tiết kỹ thuật viên</h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col items-center">
            <div className="w-36 h-36 rounded-xl overflow-hidden bg-slate-100">
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            </div>
            <h4 className="mt-4 text-xl font-bold">{name}</h4>
            <div className="text-sm text-slate-500">{user.role || info?.id}</div>

            <div className="mt-4 w-full space-y-2">
              <a href={`mailto:${user.email}`} className="flex items-center gap-2 text-sm text-slate-700">
                <Mail /> {user.email ?? '—'}
              </a>
              <a href={`tel:${user.phoneNumber}`} className="flex items-center gap-2 text-sm text-slate-700">
                <Phone /> {user.phoneNumber ?? '—'}
              </a>
            </div>
          </div>

          <div className="md:col-span-2">
            <section>
              <h5 className="text-md font-semibold mb-2">Giới thiệu</h5>
              <p className="text-sm text-slate-700">{info?.introduction ?? 'Chưa có thông tin.'}</p>
              <div className="mt-3 text-sm text-slate-500">Kinh nghiệm: <span className="font-medium text-slate-800">{info?.experience ?? '—'} năm</span></div>
            </section>

            <section className="mt-6">
              <div className="flex items-center justify-between">
                <h5 className="text-md font-semibold">Chứng chỉ ({displayCertificates.length})</h5>
              </div>

              <div className="mt-3">
                {displayCertificates.length === 0 ? (
                  <div className="text-sm text-slate-500">Chưa có chứng chỉ</div>
                ) : (
                  <ul className="space-y-3">
                    {displayCertificates.map((c, idx) => (
                      <li key={c.certificateID} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="w-20 h-14 bg-slate-100 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
                          {c.certificateImage ? (
                            <img src={c.certificateImage} alt={c.certificateID} className="w-full h-full object-cover" />
                          ) : (
                            <Award className="text-amber-500" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <div className="truncate">
                              <div className="font-semibold text-sm">{idx + 1}. {c.certificateID}</div>
                              <div className="text-xs text-slate-500 truncate">{c.note || c.status || '—'}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-slate-400">{formatDate(c.issuedDate)}</div>
                            </div>
                          </div>

                          {c.note && <div className="mt-2 text-xs text-slate-500">Note: {c.note}</div>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDetailModal;