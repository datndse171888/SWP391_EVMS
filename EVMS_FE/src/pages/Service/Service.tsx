import React from 'react';
import { Car, Zap, Shield, Clock, Bike, ArrowRight, Users } from 'lucide-react';
import ServiceBg from '../../assets/images/service.png';
import { Link } from 'react-router-dom';

export const ServicePage: React.FC = () => {
    return (
        <div className="relative min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
            {/* Hero */}
            {/* Hero Section */}
            <section className="relative py-20 pt-20 pb-16 px-4 sm:px-6 lg:px-8" style={{ backgroundImage: `url(${ServiceBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <h1 className="text-6x md:text-6xl font-bold text-white mb-6 mt-10 drop-shadow-lg border-b-8 border-orange-500 inline-block px-4 py-2">
                        Dịch vụ
                    </h1>
                    <p className="text-xl text-white mb-8 max-w-3xl mx-auto drop-shadow-md">
                        Dịch vụ chăm sóc chuyên nghiệp cho ô tô điện, xe máy điện và xe đạp điện với chẩn đoán tiên tiến,
                        kỹ thuật viên chuyên nghiệp và công nghệ tiên tiến để giữ cho phương tiện của bạn hoạt động ở hiệu suất tối ưu.
                    </p>
                </div>
            </section>

            <main className="max-w-7xl mx-auto mt-12">
                {/* Services cards */}
                <section id="services" className="bg-white rounded-2xl p-6 shadow-lg ring-1 ring-black/5">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Dịch vụ của chúng tôi</h2>
                    <p className="text-sm text-slate-500 mb-6 max-w-2xl">
                        Dịch vụ toàn diện, từ bảo dưỡng định kỳ đến sửa chữa chuyên sâu. Chúng tôi tối ưu chi phí và đảm bảo hiệu suất lâu dài.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link to="/carService" className="group">
                            <article className="p-6 rounded-xl border border-slate-100 shadow-md hover:shadow-xl transform hover:-translate-y-1 transition">
                                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full mb-4">
                                    <Car className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">Ô tô điện</h3>
                                <p className="text-sm text-slate-500 mb-4">Bảo trì hệ thống pin, kiểm tra ECU, và tối ưu hiệu suất cho ô tô điện.</p>
                                <div className="text-sm font-medium text-blue-600 inline-flex items-center gap-2 group-hover:underline">
                                    Chi tiết <ArrowRight className="w-4 h-4" />
                                </div>
                            </article>
                        </Link>

                        <Link to="/motoService" className="group">
                            <article className="p-6 rounded-xl border border-slate-100 shadow-md hover:shadow-xl transform hover:-translate-y-1 transition">
                                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-50 to-orange-100 rounded-full mb-4">
                                    <svg className="w-8 h-8 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <circle cx="6" cy="18" r="3" />
                                        <circle cx="18" cy="18" r="3" />
                                        <path d="M12 18h-2a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
                                        <path d="M10 12h4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">Xe máy điện</h3>
                                <p className="text-sm text-slate-500 mb-4">Từ kiểm tra hệ thống điện đến sửa chữa cơ bản — giữ phương tiện bạn an toàn.</p>
                                <div className="text-sm font-medium text-orange-600 inline-flex items-center gap-2 group-hover:underline">
                                    Chi tiết <ArrowRight className="w-4 h-4" />
                                </div>
                            </article>
                        </Link>

                        <Link to="/bikeService" className="group">
                            <article className="p-6 rounded-xl border border-slate-100 shadow-md hover:shadow-xl transform hover:-translate-y-1 transition">
                                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-50 to-amber-100 rounded-full mb-4">
                                    <Bike className="w-8 h-8 text-yellow-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">Xe đạp điện</h3>
                                <p className="text-sm text-slate-500 mb-4">Thay pin, bảo trì hệ thống điều khiển, và tối ưu dung lượng pin cho hành trình dài.</p>
                                <div className="text-sm font-medium text-yellow-600 inline-flex items-center gap-2 group-hover:underline">
                                    Chi tiết <ArrowRight className="w-4 h-4" />
                                </div>
                            </article>
                        </Link>
                    </div>
                </section>

                {/* Process / Steps */}
                <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-indigo-50 to-sky-50 rounded-2xl p-6 shadow-lg ring-1 ring-black/5">
                        <h3 className="text-xl font-bold text-slate-800 mb-3">Quy trình làm việc minh bạch</h3>
                        <ol className="space-y-4 text-sm text-slate-600">
                            <li className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-full bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-semibold">1</div>
                                <div>
                                    <div className="font-medium text-slate-800">Tiếp nhận & kiểm tra</div>
                                    <div className="mt-1">Tiếp nhận thông tin, kiểm tra nhanh và báo giá minh bạch trước khi thực hiện.</div>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-semibold">2</div>
                                <div>
                                    <div className="font-medium text-slate-800">Chẩn đoán chuyên sâu</div>
                                    <div className="mt-1">Dùng công cụ chuyên dụng để kiểm tra hệ thống pin, động cơ và điện tử.</div>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-full bg-orange-600/10 text-orange-600 flex items-center justify-center font-semibold">3</div>
                                <div>
                                    <div className="font-medium text-slate-800">Thực hiện & kiểm tra</div>
                                    <div className="mt-1">Sửa chữa hoặc thay thế linh kiện chính hãng, thử nghiệm sau sửa chữa.</div>
                                </div>
                            </li>
                        </ol>

                        <div className="mt-6">
                            <Link to="/booking" className="inline-flex items-center gap-3 bg-indigo-600 text-white px-4 py-2 rounded-md shadow hover:opacity-95">
                                <Users className="w-4 h-4" /> Đặt lịch bảo trì
                            </Link>
                        </div>
                    </div>

                    {/* Packages */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg ring-1 ring-black/5">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Gói dịch vụ & giá tham khảo</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { name: 'Tiêu chuẩn', price: '200k-650k', accent: 'from-sky-50 to-sky-100', features: ['Kiểm tra cơ bản', 'Bảo dưỡng nhỏ'] },
                                { name: 'Nâng cao', price: '650k-1.2M', accent: 'from-emerald-50 to-emerald-100', features: ['Chẩn đoán pin', 'Hiệu chỉnh phần mềm'] },
                                { name: 'Toàn diện', price: '1.2M-8M', accent: 'from-orange-50 to-orange-100', features: ['Thay linh kiện', 'Kiểm tra an toàn'] },
                            ].map((p, i) => (
                                <div key={i} className={`p-4 rounded-lg border ${i === 1 ? 'border-indigo-300 shadow-lg' : 'border-slate-100'} bg-gradient-to-br ${p.accent}`}>
                                    <div className="text-sm text-slate-700 font-semibold">{p.name}</div>
                                    <div className="text-2xl font-bold text-slate-900 my-3">{p.price}</div>
                                    <ul className="text-sm text-slate-600 space-y-2 mb-4">
                                        {p.features.map((f, idx) => <li key={idx}>• {f}</li>)}
                                    </ul>
                                    <Link to="/booking" className={`block text-center px-4 py-2 rounded-md font-medium ${i === 1 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}>
                                        Đặt lịch ngay
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Technology & features */}
                <section className="mt-8 bg-white rounded-2xl p-6 shadow-lg ring-1 ring-black/5">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Công nghệ & tiêu chuẩn</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[{
                            icon: <Zap className="w-6 h-6 text-yellow-500" />,
                            title: 'Chẩn đoán số',
                            desc: 'Phân tích nhanh bằng công cụ chuyên dụng'
                        }, {
                            icon: <Shield className="w-6 h-6 text-emerald-500" />,
                            title: 'Bảo hành',
                            desc: 'Linh kiện & dịch vụ đi kèm bảo hành'
                        }, {
                            icon: <Clock className="w-6 h-6 text-sky-500" />,
                            title: 'Nhanh chóng',
                            desc: 'Hoàn thành nhiều dịch vụ trong ngày'
                        }, {
                            icon: <Users className="w-6 h-6 text-purple-500" />,
                            title: 'Đội ngũ tay nghề',
                            desc: 'Kỹ thuật viên được đào tạo chuyên sâu'
                        }].map((f, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-slate-50">
                                <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm">{f.icon}</div>
                                <div>
                                    <div className="font-semibold text-slate-800">{f.title}</div>
                                    <div className="text-sm text-slate-600 mt-1">{f.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Testimonials */}
                <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-pink-500 text-white p-6 rounded-2xl shadow-xl">
                        <h3 className="text-xl font-bold mb-3">Khách hàng nói về chúng tôi</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Trần Văn D', text: 'Nhanh, chuyên nghiệp và minh bạch — xe hoạt động tốt hơn sau lần bảo dưỡng.' },
                                { name: 'Phạm Thị E', text: 'Đội kỹ thuật nhiệt tình, giải thích rõ ràng mọi hạng mục sửa chữa.' },
                            ].map((t, i) => (
                                <blockquote key={i} className="bg-white/10 p-4 rounded-lg">
                                    <p className="italic">“{t.text}”</p>
                                    <footer className="mt-2 text-sm font-medium">{t.name}</footer>
                                </blockquote>
                            ))}
                        </div>
                    </div>

                    {/* FAQ */}
                    <aside className="bg-white rounded-2xl p-6 shadow-lg ring-1 ring-black/5">
                        <h4 className="text-lg font-bold text-slate-800 mb-4">Câu hỏi thường gặp</h4>
                        <div className="space-y-3 text-sm text-slate-600">
                            <div>
                                <div className="font-medium">Bao lâu để hoàn thành dịch vụ?</div>
                                <div className="mt-1">Tùy gói, thường từ 1–3 giờ cho dịch vụ tiêu chuẩn, hoặc trong ngày cho gói nâng cao.</div>
                            </div>
                            <div>
                                <div className="font-medium">Có thể đặt trước linh kiện không?</div>
                                <div className="mt-1">Có — liên hệ trước nếu cần phụ tùng đặc thù để chúng tôi chuẩn bị.</div>
                            </div>
                            <div>
                                <div className="font-medium">Có hỗ trợ khẩn cấp không?</div>
                                <div className="mt-1">Có, chúng tôi cung cấp dịch vụ ưu tiên theo cuộc hẹn và hỗ trợ tình huống khẩn cấp.</div>
                            </div>
                        </div>
                    </aside>
                </section>

                {/* Final CTA */}
                <section className="mt-10 bg-gradient-to-r from-indigo-600 to-sky-500 text-white rounded-2xl p-8 shadow-2xl">
                    <div className="max-w-4xl mx-auto text-center">
                        <h3 className="text-2xl font-bold mb-3">Sẵn sàng để nâng cấp hiệu suất phương tiện?</h3>
                        <p className="mb-6 text-slate-100/90">Đặt lịch ngay để nhận ưu đãi và được tư vấn bởi kỹ thuật viên chuyên môn.</p>
                        <div className="flex gap-4 justify-center">
                            <Link to="/booking" className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg shadow hover:scale-105 transition">
                                Đặt lịch ngay
                            </Link>
                            <Link to="/contact" className="border border-white/30 text-white px-6 py-3 rounded-lg hover:bg-white/10 transition">
                                Liên hệ tư vấn
                            </Link>
                        </div>
                    </div>
                </section>

                <div className="h-16" />
            </main>
        </div>
    );
};

export default ServicePage;

