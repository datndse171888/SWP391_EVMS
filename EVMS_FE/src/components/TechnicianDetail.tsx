 import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Phone, Award, ArrowLeft } from 'lucide-react';

type Certificate = {
  certificateID: string;
  certificateImage?: string;
  issuedDate?: string;
  expiryDate?: string;
  status?: string;
  note?: string;
};

type Technician = {
  _id: string;
  fullName: string;
  userName?: string;
  email?: string;
  phoneNumber?: string;
  photoURL?: string;
  role?: string;
  specialization?: string;
  introduction?: string;
  certificates?: Certificate[];
};

export default function TechnicianDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tech, setTech] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchOne = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/technicians/${encodeURIComponent(id)}`);
        const data = await res.json();
        if (res.ok) setTech(data.data || data);
        else setTech(null);
      } catch (err) {
        console.error(err);
        setTech(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
  }, [id]);

  if (loading) return <div className="p-8">Đang tải...</div>;
  if (!tech) return <div className="p-8">Không tìm thấy kỹ thuật viên.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600">
        <ArrowLeft /> Quay lại
      </button>

      <div className="bg-white rounded-2xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 flex flex-col items-center">
          <div className="w-40 h-40 rounded-xl overflow-hidden bg-slate-100">
            {tech.photoURL ? (
              <img src={tech.photoURL} alt={tech.fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-400">
                {String(tech.fullName || '').slice(0,2).toUpperCase()}
              </div>
            )}
          </div>
          <h2 className="mt-4 text-xl font-bold">{tech.fullName}</h2>
          <p className="text-sm text-slate-500">{tech.role}</p>

          <div className="mt-4 w-full space-y-2">
            <a href={`mailto:${tech.email}`} className="flex items-center gap-2 text-sm text-slate-700">
              <Mail /> {tech.email || '—'}
            </a>
            <a href={`tel:${tech.phoneNumber}`} className="flex items-center gap-2 text-sm text-slate-700">
              <Phone /> {tech.phoneNumber || '—'}
            </a>
          </div>
        </div>

        <div className="md:col-span-2">
          <section>
            <h3 className="text-lg font-semibold mb-2">Giới thiệu</h3>
            <p className="text-sm text-slate-700">{tech.introduction || 'Chưa có thông tin.'}</p>
            <div className="mt-4 text-sm text-slate-500">Chuyên môn: {tech.specialization || '—'}</div>
          </section>

          <section className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Chứng chỉ</h3>
              <div className="text-sm text-slate-500">{(tech.certificates || []).length} items</div>
            </div>

            <div className="mt-3 space-y-3">
              {(tech.certificates || []).length === 0 && (
                <div className="text-sm text-slate-500">Chưa có chứng chỉ</div>
              )}

              {(tech.certificates || []).map((c) => (
                <div key={c.certificateID} className="flex items-start gap-4 p-3 border rounded-lg">
                  <div className="w-20 h-14 bg-slate-100 rounded-md overflow-hidden flex items-center justify-center">
                    {c.certificateImage ? <img src={c.certificateImage} alt={c.certificateID} className="w-full h-full object-cover" /> : <Award className="text-amber-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{c.certificateID}</div>
                    <div className="text-xs text-slate-500">{c.issuedDate} → {c.expiryDate} • {c.status}</div>
                    {c.note && <div className="text-sm text-slate-600 mt-1">{c.note}</div>}
                  </div>
                  <div className="flex-shrink-0 flex flex-col gap-2">
                    <button className="px-3 py-1 border rounded text-sm">Sửa</button>
                    <button className="px-3 py-1 bg-red-600 text-white rounded text-sm">Xóa</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <button className="px-4 py-2 bg-green-600 text-white rounded">Thêm chứng chỉ</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}