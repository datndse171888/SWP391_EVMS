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
    name: 'Dr. Sarah Chen',
    role: 'Director of Operations',
    email: 'sarah.chen@evservice.com',
    phone: '+1 (555) 123-4567',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    specialization: 'EV Systems Architecture & Battery Technology',
    certificates: [
      { name: 'Certified EV Technician Level 3', issuer: 'International EV Association', year: 2023 },
      { name: 'Advanced Battery Management Systems', issuer: 'Tesla Institute', year: 2022 },
      { name: 'ISO 9001 Quality Management', issuer: 'ISO Certification Board', year: 2021 },
    ],
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    role: 'Chief Technical Engineer',
    email: 'michael.r@evservice.com',
    phone: '+1 (555) 234-5678',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    specialization: 'High Voltage Systems & Diagnostics',
    certificates: [
      { name: 'Master EV Technician Certification', issuer: 'National Institute for Automotive Service Excellence', year: 2023 },
      { name: 'High Voltage Safety Specialist', issuer: 'EV Safety Council', year: 2022 },
      { name: 'Advanced Powertrain Diagnostics', issuer: 'Automotive Training Institute', year: 2021 },
    ],
  },
  {
    id: 3,
    name: 'Emily Thompson',
    role: 'Service Manager',
    email: 'emily.t@evservice.com',
    phone: '+1 (555) 345-6789',
    image: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=400',
    specialization: 'Customer Relations & Quality Assurance',
    certificates: [
      { name: 'Certified Service Manager', issuer: 'Professional Service Association', year: 2023 },
      { name: 'Six Sigma Green Belt', issuer: 'American Society for Quality', year: 2022 },
      { name: 'EV Customer Service Excellence', issuer: 'EV Training Academy', year: 2021 },
    ],
  },
  {
    id: 4,
    name: 'David Park',
    role: 'Senior Battery Specialist',
    email: 'david.p@evservice.com',
    phone: '+1 (555) 456-7890',
    image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400',
    specialization: 'Battery Health & Energy Storage Systems',
    certificates: [
      { name: 'Certified Battery Systems Engineer', issuer: 'Battery Technology Institute', year: 2023 },
      { name: 'Lithium-Ion Safety Certification', issuer: 'International Battery Association', year: 2022 },
      { name: 'Energy Storage Management', issuer: 'Clean Energy Academy', year: 2021 },
    ],
  },
  {
    id: 5,
    name: 'Jessica Martinez',
    role: 'Electrical Systems Lead',
    email: 'jessica.m@evservice.com',
    phone: '+1 (555) 567-8901',
    image: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=400',
    specialization: 'Power Electronics & Charging Infrastructure',
    certificates: [
      { name: 'Certified Electrical Engineer', issuer: 'Institute of Electrical Engineers', year: 2023 },
      { name: 'EV Charging Systems Specialist', issuer: 'ChargePoint Institute', year: 2022 },
      { name: 'Power Electronics Advanced', issuer: 'Technical University Consortium', year: 2021 },
    ],
  },
  {
    id: 6,
    name: 'Robert Kim',
    role: 'Diagnostic Systems Expert',
    email: 'robert.k@evservice.com',
    phone: '+1 (555) 678-9012',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    specialization: 'Advanced Diagnostics & Software Systems',
    certificates: [
      { name: 'Master Diagnostic Technician', issuer: 'Automotive Diagnostic Association', year: 2023 },
      { name: 'OEM Software Certification', issuer: 'Multiple EV Manufacturers', year: 2022 },
      { name: 'CAN Bus & Network Analysis', issuer: 'Vehicle Network Institute', year: 2021 },
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
            Why Choose Our Certified Team?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-emerald-50 rounded-xl">
              <Award className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Industry-Leading Certifications
              </h3>
              <p className="text-slate-600">
                Our technicians hold the highest certifications from recognized automotive and EV institutions.
              </p>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Safety First Approach
              </h3>
              <p className="text-slate-600">
                Specialized training in high-voltage systems ensures your vehicle and our team stay safe.
              </p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-xl">
              <Mail className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Always Available
              </h3>
              <p className="text-slate-600">
                Our team is ready to assist with your questions and service needs at any time.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-6 bg-white px-8 py-4 rounded-xl shadow-md border border-slate-200">
            <div className="flex items-center text-slate-700">
              <Phone className="w-5 h-5 mr-2 text-emerald-600" />
              <span className="font-medium">General Inquiries: +1 (555) 000-0000</span>
            </div>
            <div className="flex items-center text-slate-700">
              <Mail className="w-5 h-5 mr-2 text-emerald-600" />
              <span className="font-medium">info@evservice.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamPage;
