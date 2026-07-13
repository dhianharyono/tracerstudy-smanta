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
      <div className='relative animate-bounce mb-2'>
        <img
          src='/logo.png'
          alt='Loading...'
          className='w-14 h-14 md:w-20 md:h-20'
        />
      </div>

      <div className='h-8 overflow-hidden relative w-full text-center px-4'>
        {messages.map((msg, idx) => (
          <p
            key={idx}
            className={`absolute text-[10px] md:text-sm w-full left-0 transition-all duration-500 transform font-medium text-[color:var(--text-secondary)] ${idx === currentIndex
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
