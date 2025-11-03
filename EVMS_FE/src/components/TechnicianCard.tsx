import { Award, Mail, Phone } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Certificate {
  name: string;
  issuer: string;
  year: number;
}

interface TeamMember {
  id: number | string;
  name: string;
  role: string;
  email: string;
  phone: string;
  image: string;
  certificates: Certificate[];
  specialization: string;
}

interface TeamMemberCardProps {
  member: TeamMember;
}

function TechnicianCard({ member }: TeamMemberCardProps) {
  const [showCertificates, setShowCertificates] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 transition-all duration-300 hover:shadow-xl hover:scale-105">
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300">
        <img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
          <p className="text-emerald-300 font-medium">{member.role}</p>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-700 mb-1">Specialization</p>
          <p className="text-slate-600 text-sm leading-relaxed">{member.specialization}</p>
        </div>

        <div className="space-y-2 mb-4">
          <a
            href={`mailto:${member.email}`}
            className="flex items-center text-slate-600 hover:text-emerald-600 transition-colors group"
          >
            <Mail className="w-4 h-4 mr-2 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-sm truncate">{member.email}</span>
          </a>
          <a
            href={`tel:${member.phone}`}
            className="flex items-center text-slate-600 hover:text-emerald-600 transition-colors group"
          >
            <Phone className="w-4 h-4 mr-2 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-sm">{member.phone}</span>
          </a>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowCertificates(!showCertificates)}
            className="flex-1 flex items-center justify-center space-x-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-3 px-4 rounded-lg transition-colors"
            aria-expanded={showCertificates}
            aria-controls={`certs-${member.id}`}
          >
            <Award className="w-5 h-5" />
            <span>{showCertificates ? 'Ẩn chứng chỉ' : `Chứng chỉ (${member.certificates.length})`}</span>
          </button>

          <button
            onClick={() => navigate(`/${member.id}`)}
            className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition"
            aria-label={`Xem chi tiết ${member.name}`}
          >
            Xem chi tiết
          </button>
        </div>

        {showCertificates && (
          <div id={`certs-${member.id}`} className="mt-4 space-y-3 animate-fadeIn">
            {member.certificates.length === 0 && (
              <div className="text-sm text-slate-500">Chưa có chứng chỉ</div>
            )}
            {member.certificates.map((cert, index) => (
              <div
                key={index}
                className="border-l-4 border-emerald-500 bg-slate-50 p-3 rounded-r-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-sm leading-tight mb-1">
                      {cert.name}
                    </p>
                    <p className="text-xs text-slate-600">{cert.issuer}</p>
                  </div>
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    {cert.year}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TechnicianCard;