import { FaGraduationCap } from 'react-icons/fa';

const WelcomeCard = ({
  username,
  fullName,
}: {
  username: string;
  fullName?: string;
}) => {
  const name = fullName || username || 'Pengguna';

  return (
    <div className='relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 shadow-xl shadow-blue-500/20 mb-6'>
      <div className='absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute right-4 top-4 opacity-10 text-white pointer-events-none'>
        <FaGraduationCap size={140} />
      </div>

      <div className='relative z-10 flex items-center gap-4 sm:gap-6'>
        <div>
          <p className='text-lg sm:text-2xl font-black text-white leading-tight'>
            Selamat Datang, {name}!
          </p>
          <p className='text-xs sm:text-sm text-blue-100/90 mt-1 font-medium'>
            Jelajahi data alumni dan informasi terkini SMAN 1 Tawangsari.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
