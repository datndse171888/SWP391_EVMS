import React, { useEffect, useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { TechnicianInfo, TechnicianCertificate } from '../types/Technician';
import schedule from '../assets/images/schedule.png'
import TechnicianDetailModal from '../components/TechnicianDetailModal';

type TechnicianUser = {
  _id: string;
  fullName?: string;
  userName?: string;
  email?: string;
  phoneNumber?: string;
  photoURL?: string;
  role?: string;
};

type TechnicianWithMeta = {
  user: TechnicianUser;
  info?: TechnicianInfo;
  certificates: TechnicianCertificate[];
};



export default function TechniciansPage() {
  const [items, setItems] = useState<TechnicianWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [selectedTech, setSelectedTech] = useState<TechnicianWithMeta | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  // Mock certificate data
  const mockCertificates: TechnicianCertificate[] = [
    {
      certificateID: '1',
      issuedDate: '2023-01-15',
      expiryDate: '2026-01-15',
      status: 'active',
      note: 'Renewal required every 3 years',
      certificateImage: 'https://example.com/cert1.jpg'
    },
    {
      certificateID: '2',
      issuedDate: '2023-03-20',
      expiryDate: '2026-03-20',
      status: 'active',
      note: 'Renewal required every 3 years',
      certificateImage: 'https://example.com/cert2.jpg'
    },
    {
      certificateID: '3',
      issuedDate: '2023-06-10',
      expiryDate: '2026-06-10',
      status: 'active',
      note: 'Renewal required every 3 years',
      certificateImage: 'https://example.com/cert3.jpg'
    }
  ];
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const usersRes = await fetch(`http://localhost:4000/api/users?role=technician&limit=100`);
        const usersJson = await usersRes.json();
        const users: TechnicianUser[] = usersJson?.data?.users ?? [];

        const promises = users.map(async (u) => {
          let info: TechnicianInfo | undefined = undefined;
          let certificates: TechnicianCertificate[] = [];

          try {
            const infoRes = await fetch(`http://localhost:4000/api/technicians/${u._id}/info`);
            if (infoRes.ok) {
              const j = await infoRes.json();
              info = j?.data?.technician ?? undefined;
            }
          } catch (e) {
          }

          try {
            const certRes = await fetch(`http://localhost:4000/api/technicians/${encodeURIComponent(u._id)}/certificates`);
            if (certRes.ok) {
              const j = await certRes.json();
              certificates = j?.data?.certificates ?? [];
            }
          } catch (e) {

          }

          return { user: u, info, certificates } as TechnicianWithMeta;
        });

        const results = await Promise.all(promises);
        if (!mounted) return;
        setItems(results);
      } catch (e) {
        console.error(e);
        if (mounted) setError('Không thể tải danh sách kỹ thuật viên.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative py-20 pt-20 pb-16 px-4 sm:px-6 lg:px-8" style={{ backgroundImage: `url(${schedule})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-6x md:text-6xl font-bold text-white mb-6 mt-10 drop-shadow-lg border-b-8 border-orange-500 inline-block px-4 py-2">
            Đội Ngũ Kỹ Thuật Viên
          </h1>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto drop-shadow-md">
            Gặp gỡ các chuyên gia được chứng nhận đứng sau Trung Tâm Dịch Vụ Xe Điện của chúng tôi. Đội ngũ của chúng tôi mang đến hàng thập kỷ kinh nghiệm kết hợp trong việc bảo trì xe điện, chẩn đoán và xuất sắc trong dịch vụ khách hàng.
          </p>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {loading && <div className="py-16 text-center text-slate-500">Đang tải danh sách...</div>}
        {error && <div className="text-red-600 py-4">{error}</div>}

        {!loading && !error && (
          <>
            {items.length === 0 ? (
              <div className="py-12 text-center text-slate-500">Chưa có kỹ thuật viên để hiển thị.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(({ user, info, certificates }) => {
                  const name = user.fullName || user.userName || 'Không tên';
                  const photo = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=fff`;
                  return (
                    <article key={user._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                      <div className="h-44 bg-slate-100 flex items-center justify-center overflow-hidden">
                        <img src={photo} alt={name} className="w-full h-full object-cover" />
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="text-lg font-semibold text-slate-900 truncate">{name}</h3>
                            <div className="text-sm text-slate-500 truncate">{info?.introduction ?? info?.id ?? user.role}</div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm text-slate-500">Kinh nghiệm</div>
                            <div className="font-bold text-slate-900">{info?.experience ?? '—'} năm</div>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          <a href={`mailto:${user.email}`} className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="w-4 h-4 text-slate-400" /> <span className="truncate">{user.email ?? '—'}</span>
                          </a>
                          <a href={`tel:${user.phoneNumber}`} className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="w-4 h-4 text-slate-400" /> <span>{user.phoneNumber ?? '—'}</span>
                          </a>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedTech({ user, info, certificates });
                              setIsDetailOpen(true);
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-700"
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
      <TechnicianDetailModal
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedTech(null); }}
        technician={selectedTech}
      />
    </div>

  );
}