import React from 'react';
import { IconType } from 'react-icons';
import { motion } from 'framer-motion';

interface StatCardProps {
  icon: IconType;
  label: string;
  value: number | string;
  color: string;
  bgColor: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className='bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300'
    >
      <div
        className={`w-12 h-12 md:w-14 md:h-14 ${bgColor} rounded-2xl flex items-center justify-center ${color} mb-6`}
      >
        <Icon size={22} className='md:w-[28px] md:h-[28px]' />
      </div>
      <h4 className='text-3xl md:text-5xl font-bold text-slate-900 mb-1 md:mb-2 tracking-tight'>
        {value || 0}
      </h4>
      <p className='font-bold text-slate-400 uppercase text-[9px] md:text-xs tracking-widest mt-1.5'>
        {label}
      </p>
    </motion.div>
  );
};

export default StatCard;
