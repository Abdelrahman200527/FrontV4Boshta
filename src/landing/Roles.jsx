import { User, UserRoundPen, UsersRound, ArrowLeft, CheckCircle2 } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from "framer-motion";
import { pageVariants } from "../motion";

const Roles = () => {
    const navigate = useNavigate();

    const roles = [
        {
            label: 'الطالب',
            role: 'student',
            Icon: User,
            borderColor: 'hover:border-[#D4B45C]/50',
            description: 'تعلم وتابع تقدمك وامتحاناتك',
            features: ['دورات تفاعلية', 'امتحانات أونلاين', 'متابعة الدرجات']
        },
        {
            label: 'المعلم',
            role: 'teacher',
            Icon: UserRoundPen,
            borderColor: 'hover:border-[#D4B45C]/50',
            description: 'أدر طلابك ومحتواك التعليمي',
            features: ['إدارة الطلاب', 'إنشاء امتحانات', 'تقارير متقدمة']
        },
        {
            label: 'المساعد',
            role: 'assistant',
            Icon: UsersRound,
            borderColor: 'hover:border-[#D4B45C]/50',
            description: 'ساعد في الإدارة والمتابعة',
            features: ['متابعة الحضور', 'إدارة المدفوعات', 'تنظيم الفيديوهات']
        }
    ];

    return (
        <motion.section variants={pageVariants} initial="hidden" animate="show" className='w-full bg-[#234A32] py-16 sm:py-24 px-4 sm:px-6'>
            <div className='max-w-7xl mx-auto flex flex-col gap-12 sm:gap-16'>
                {/* Header */}
                <div className='w-full flex flex-col items-center gap-4 text-center'>
                    <h2 className='font-bold text-2xl sm:text-4xl text-[#FFA900] font-lalezar'>
                        بوابة واحدة للجميع
                    </h2>
                    <span className='text-white text-sm sm:text-base max-w-2xl leading-relaxed'>
                        مصممة لثلاثة أدوار أساسية في منظومة التعليم — الكل له
                        بيئته الخاصة وأدواته المخصصة
                    </span>
                </div>

                {/* Roles Grid */}
                <div className='w-full grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8'>
                    {roles.map(({ label, Icon, description, features, role }) => (
                        <div 
                            key={role} 
                            className={`group bg-gray-300 border border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-[1.02] cursor-pointer`}
                        >
                            {/* Icon & Label */}
                            <div className='flex flex-col gap-4'>
                                <div className='rounded-lg p-2 w-fit bg-[#d8e7c6]'>
                                    <Icon className="text-[#1a5d1a]" size={25} />
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <span className='text-[#1a5d1a] font-bold text-xl sm:text-2xl font-lalezar'>{label}</span>
                                    <span className='text-[#1a5d1a] text-sm'>{description}</span>
                                </div>
                            </div>

                            {/* Features */}
                            <ul className='flex flex-col gap-3'>
                                {features.map((feature) => (
                                    <li key={feature} className='flex items-center gap-2 text-[#1a5d1a] text-sm'>
                                        <CheckCircle2 size={16} className='text-green-400' />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {/* Button */}
                            <button 
                                onClick={() => navigate(`/login?role=${label}`)}
                                className='mt-auto w-full bg-[#1a5d1a] hover:scale-[1.03] text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer font-semibold text-sm'
                            >
                                <span>تسجيل الدخول</span>
                                <ArrowLeft size={16} className='transition-transform group-hover:-translate-x-1' />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </motion.section>
    )
}

export default Roles