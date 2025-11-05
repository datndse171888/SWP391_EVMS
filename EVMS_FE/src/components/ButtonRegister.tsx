import { CalendarCheck2 } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FixedRegisterButton: React.FC = () => {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    return (
        <div
            aria-hidden={!visible}
            className="fixed inset-x-4 md:inset-x-auto md:right-6 bottom-6 z-50 flex justify-center md:justify-end "
        >
            <div className="relative w-full md:w-auto  hover:scale-105 transition-transform duration-300 hover:rotate-z-10 animate-bounce">
                {/* decorative colorful pings */}
                <span className="absolute -left-2 -top-1 w-3 h-3 rounded-full bg-pink-400/90 animate-ping opacity-70" />
                <span className="absolute -right-3 -top-2 w-2 h-2 rounded-full bg-yellow-400/90 animate-ping delay-75" />
                <span className="absolute -right-1 -bottom-1 w-2 h-2 rounded-full bg-emerald-400/90 animate-ping delay-150" />

                <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 via-pink-500 to-yellow-400 text-white rounded-2xl shadow-xl ring-1 ring-black/5 px-4 py-3 md:px-5">
                    <Link
                        to="/booking"
                        className="flex items-center gap-3 text-sm md:text-base font-medium"
                        aria-label="Đăng ký"
                        title="Đăng ký"
                    >


                        <span className="flex items-center gap-2 text-[20px] ">
                            <span className=" bg-white text-indigo-600 rounded-full px-2 py-0.5 font-bold animate-pulse"><CalendarCheck2 /></span>
                            <span className='font-bold'>ĐẶT LỊCH</span>
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FixedRegisterButton;