import { FaEdit, FaGraduationCap } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import React from 'react';

interface User {
  username?: string;
}

interface Profile {
  questionnaireCompleted?: boolean;
  fullName?: string;
}

interface WelcomeCardAlumniProps {
  user: User | null;
  profile: {
    profile: Profile;
    questionnaireCompleted: boolean;
  };
}

const WelcomCardAlumni: React.FC<WelcomeCardAlumniProps> = ({
  user,
  profile,
}) => {
  const name = profile?.profile?.fullName || user?.username || 'Alumni';

  return (
    <div className='relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 shadow-xl shadow-blue-500/20 mb-6'>
      <div className='absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute right-4 top-4 opacity-10 text-white pointer-events-none'>
        <FaGraduationCap size={160} />
      </div>

      <div className='relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
        <div className='flex items-center gap-4'>
          <div>
            <p className='text-xl sm:text-2xl font-black text-white leading-tight'>
              Selamat Datang, {name}!
            </p>
            <p className='text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl font-medium'>
              Jelajahi jaringan alumni, bursa kerja, event terbaru, dan informasi terkini.
            </p>
          </div>
        </div>

        {!profile?.questionnaireCompleted && (
          <Link
            to='/alumni/questionnaire'
            className='inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-amber-950 px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all duration-200 shrink-0'
          >
            <FaEdit className='text-base' />
            <span>Isi Kuesioner Sekarang</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default WelcomCardAlumni;
