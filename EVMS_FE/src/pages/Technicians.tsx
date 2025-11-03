import { Award, Mail, Phone, Shield } from 'lucide-react';
import TeamMemberCard from '../components/TechnicianCard';
import {
  Zap,
  Users,
  Battery,
  Settings,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import schedule from '../assets/images/schedule.png'

interface Certificate {
  name: string;
  issuer: string;
  year: number;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  image: string;
  certificates: Certificate[];
  specialization: string;
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: 'Nguyễn Văn An',
    role: 'Giám đốc Vận hành',
    email: 'nguyenvanan@evservice.com',
    phone: '+84 (0) 123-4567',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    specialization: 'Kiến trúc hệ thống xe điện & Công nghệ pin',
    certificates: [
      { name: 'Kỹ thuật viên xe điện được chứng nhận cấp 3', issuer: 'Hiệp hội xe điện quốc tế', year: 2023 },
      { name: 'Hệ thống quản lý pin nâng cao', issuer: 'Viện Tesla', year: 2022 },
      { name: 'Quản lý chất lượng ISO 9001', issuer: 'Hội đồng chứng nhận ISO', year: 2021 },
    ],
  },
  {
    id: 2,
    name: 'Trần Minh Tuấn',
    role: 'Kỹ sư kỹ thuật chính',
    email: 'tranminhuan@evservice.com',
    phone: '+84 (0) 234-5678',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    specialization: 'Hệ thống điện áp cao & Chẩn đoán',
    certificates: [
      { name: 'Chứng chỉ kỹ thuật viên xe điện chính', issuer: 'Viện quốc gia về dịch vụ ô tô xuất sắc', year: 2023 },
      { name: 'Chuyên gia an toàn điện áp cao', issuer: 'Hội đồng an toàn xe điện', year: 2022 },
      { name: 'Chẩn đoán hệ thống truyền động nâng cao', issuer: 'Viện đào tạo ô tô', year: 2021 },
    ],
  },
  {
    id: 3,
    name: 'Phạm Thị Hương',
    role: 'Quản lý dịch vụ',
    email: 'phamhuong@evservice.com',
    phone: '+84 (0) 345-6789',
    image: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=400',
    specialization: 'Quan hệ khách hàng & Đảm bảo chất lượng',
    certificates: [
      { name: 'Quản lý dịch vụ được chứng nhận', issuer: 'Hiệp hội dịch vụ chuyên nghiệp', year: 2023 },
      { name: 'Dây chuyền xanh Six Sigma', issuer: 'Hiệp hội Mỹ về chất lượng', year: 2022 },
      { name: 'Dịch vụ khách hàng xe điện xuất sắc', issuer: 'Học viện đào tạo xe điện', year: 2021 },
    ],
  },
  {
    id: 4,
    name: 'Lê Văn Hùng',
    role: 'Chuyên gia pin cấp cao',
    email: 'levanhuong@evservice.com',
    phone: '+84 (0) 456-7890',
    image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400',
    specialization: 'Sức khỏe pin & Hệ thống lưu trữ năng lượng',
    certificates: [
      { name: 'Kỹ sư hệ thống pin được chứng nhận', issuer: 'Viện công nghệ pin', year: 2023 },
      { name: 'Chứng chỉ an toàn Lithium-Ion', issuer: 'Hiệp hội pin quốc tế', year: 2022 },
      { name: 'Quản lý lưu trữ năng lượng', issuer: 'Học viện năng lượng sạch', year: 2021 },
    ],
  },
  {
    id: 5,
    name: 'Đỗ Thị Linh',
    role: 'Trưởng nhóm hệ thống điện',
    email: 'dothilinh@evservice.com',
    phone: '+84 (0) 567-8901',
    image: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=400',
    specialization: 'Điện tử công suất & Cơ sở hạ tầng sạc',
    certificates: [
      { name: 'Kỹ sư điện được chứng nhận', issuer: 'Viện kỹ sư điện', year: 2023 },
      { name: 'Chuyên gia hệ thống sạc xe điện', issuer: 'Viện ChargePoint', year: 2022 },
      { name: 'Điện tử công suất nâng cao', issuer: 'Liên minh đại học kỹ thuật', year: 2021 },
    ],
  },
  {
    id: 6,
    name: 'Hoàng Văn Kiên',
    role: 'Chuyên gia hệ thống chẩn đoán',
    email: 'hoangkien@evservice.com',
    phone: '+84 (0) 678-9012',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    specialization: 'Chẩn đoán nâng cao & Hệ thống phần mềm',
    certificates: [
      { name: 'Kỹ thuật viên chẩn đoán chính', issuer: 'Hiệp hội chẩn đoán ô tô', year: 2023 },
      { name: 'Chứng chỉ phần mềm OEM', issuer: 'Nhiều nhà sản xuất xe điện', year: 2022 },
      { name: 'Phân tích mạng CAN Bus', issuer: 'Viện mạng xe', year: 2021 },
    ],
  },
];

function TeamPage() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {teamMembers.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Tại sao chọn đội ngũ được chứng nhận của chúng tôi?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-emerald-50 rounded-xl">
              <Award className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Chứng chỉ hàng đầu ngành
              </h3>
              <p className="text-slate-600">
                Các kỹ thuật viên của chúng tôi sở hữu những chứng chỉ cao nhất từ các tổ chức ô tô và xe điện được công nhận.
              </p>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Tiếp cận ưu tiên an toàn
              </h3>
              <p className="text-slate-600">
                Đào tạo chuyên biệt về hệ thống điện áp cao đảm bảo xe của bạn và đội ngũ của chúng tôi luôn an toàn.
              </p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-xl">
              <Mail className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Luôn sẵn sàng phục vụ
              </h3>
              <p className="text-slate-600">
                Đội ngũ của chúng tôi sẵn sàng hỗ trợ các câu hỏi và nhu cầu dịch vụ của bạn bất kỳ lúc nào.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-6 bg-white px-8 py-4 rounded-xl shadow-md border border-slate-200">
            <div className="flex items-center text-slate-700">
              <Phone className="w-5 h-5 mr-2 text-emerald-600" />
              <span className="font-medium">Thông tin chung: +84 (0) 000-0000</span>
            </div>
            <div className="flex items-center text-slate-700">
              <Mail className="w-5 h-5 mr-2 text-emerald-600" />
              <span className="font-medium">info@evservice.vn</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamPage;
