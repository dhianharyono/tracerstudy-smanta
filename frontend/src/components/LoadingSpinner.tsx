import { FaSpinner } from 'react-icons/fa';

const LoadingSpinner = () => {
  return (
    <div className='flex items-center justify-center h-[calc(100vh-64px)]'>
      <div className='flex items-center gap-3 rounded-2xl px-6 py-4 shadow-sm animate-fade-in'>
        <FaSpinner className='animate-spin text-xl' />
        <span className='font-medium text-xs md:text-sm text-[color:var(--text-secondary)]'>
          Loading...
        </span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
