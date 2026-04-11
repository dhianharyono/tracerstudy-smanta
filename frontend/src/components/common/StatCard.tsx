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
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className='bg-[color:var(--bg-card)] p-5 md:p-8 rounded-2xl md:rounded-3xl border border-[color:var(--border-color)] shadow-xl shadow-black/5 hover:-translate-y-2 transition-transform duration-300'
    >
      <div
        className={`w-10 h-10 md:w-14 md:h-14 ${bgColor} rounded-lg md:rounded-2xl flex items-center justify-center ${color} mb-4 md:mb-6`}
      >
        <Icon size={20} className='md:w-[28px] md:h-[28px]' />
      </div>
      <h4 className='text-2xl md:text-5xl font-black text-[color:var(--text-primary)] mb-1 md:mb-2 tracking-tight'>
        {value || 0}
      </h4>
      <p className='font-bold text-[color:var(--text-secondary)] uppercase text-[9px] md:text-xs tracking-widest'>
        {label}
      </p>
    </motion.div>
  );
};

export default StatCard;
