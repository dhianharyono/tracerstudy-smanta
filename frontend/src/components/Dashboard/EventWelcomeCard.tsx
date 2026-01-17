import React from 'react';
import { LuCalendar, LuArrowRight } from 'react-icons/lu';

interface EventWelcomeCardProps {
  event: any;
  onRegister: () => void;
  isRegistered: boolean;
}

const EventWelcomeCard: React.FC<EventWelcomeCardProps> = ({
  event,
  onRegister,
  isRegistered,
}) => {
  if (!event) return null;

  return (
    <div className='relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 shadow-xl mb-8 animate-fade-in-up'>
      <div className='absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl' />
      <div className='absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-pink-500 opacity-10 blur-3xl' />

      <div className='relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
        <div className='text-white max-w-2xl'>
          <div className='flex items-center gap-2 mb-3'>
            <span className='px-3 py-1 rounded-full bg-white/20 text-xs font-medium backdrop-blur-sm'>
              Event Terbaru
            </span>
            <div className='flex items-center gap-1 text-sm text-indigo-100'>
              <LuCalendar size={16} />
              <span>
                {new Date(event.date).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          <h2 className='text-xl md:text-2xl font-bold mb-3 leading-tight'>
            {event.name}
          </h2>
          <p className='text-indigo-100/90 text-sm leading-relaxed mb-6'>
            {event.description}
          </p>

          <div className='flex flex-wrap gap-4'>
            {!isRegistered ? (
              <button
                onClick={onRegister}
                className='text-xs group relative inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl active:scale-95'
              >
                Daftar Sekarang
                <LuArrowRight
                  size={18}
                  className='transition-transform group-hover:translate-x-1'
                />
              </button>
            ) : (
              <div className='inline-flex text-sm items-center gap-2 px-6 py-3 bg-green-500/20 border border-green-500/30 text-white rounded-xl font-bold backdrop-blur-sm'>
                <span>Anda Sudah Terdaftar</span>
              </div>
            )}
          </div>
        </div>

        {/* Decorative Element or Illustration could go here */}
        <div className='hidden md:block opacity-80 mix-blend-overlay'>
          {/* SVG or Image place holder if needed, sticking to CSS shapes for now */}
          <svg
            width='120'
            height='120'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='text-white'
          >
            <rect x='3' y='4' width='18' height='18' rx='2' ry='2'></rect>
            <line x1='16' y1='2' x2='16' y2='6'></line>
            <line x1='8' y1='2' x2='8' y2='6'></line>
            <line x1='3' y1='10' x2='21' y2='10'></line>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default EventWelcomeCard;
