import { useState, useEffect } from 'react';

interface SmartLoaderProps {
  messages?: string[];
  interval?: number;
  fullScreen?: boolean;
}

const DEFAULT_MESSAGES = [
  'Memuat informasi...',
  'Menyiapkan data...',
  'Mohon tunggu sebentar...',
  'Hampir selesai...',
];

const SmartLoader = ({
  messages = DEFAULT_MESSAGES,
  interval = 2000,
  fullScreen = true,
}: SmartLoaderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [messages, interval]);

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm'
    : 'flex flex-col items-center justify-center py-12';

  return (
    <div className={`${containerClasses} animate-fade-in`}>
      <div className='relative w-20 h-20 mb-6'>
        {/* Animated circles */}
        <div className='absolute inset-0 rounded-full border-4 border-t-[var(--primary)] border-r-transparent border-b-transparent border-l-transparent animate-spin'></div>
        <div className='absolute inset-2 rounded-full border-4 border-r-[var(--secondary)] border-b-transparent border-l-transparent border-t-transparent animate-spin-reverse'></div>
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse'></div>
        </div>
      </div>

      <div className='h-8 overflow-hidden relative w-full text-center px-4'>
        {messages.map((msg, idx) => (
          <p
            key={idx}
            className={`absolute text-xs md:text-sm w-full left-0 transition-all duration-500 transform font-medium text-[color:var(--text-secondary)] ${
              idx === currentIndex
                ? 'top-0 opacity-100 translate-y-0'
                : 'top-8 opacity-0 translate-y-4'
            }`}
          >
            {msg}
          </p>
        ))}
      </div>
    </div>
  );
};

export default SmartLoader;
