import { FaEdit, FaUser, FaCheckCircle, FaTimes } from 'react-icons/fa';
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
  hideQuestionnaireCard: boolean;
  handleCloseQuestionnaireCard: () => void;
}

const WelcomCardAlumni: React.FC<WelcomeCardAlumniProps> = ({
  user,
  profile,
  hideQuestionnaireCard,
  handleCloseQuestionnaireCard,
}) => {
  return (
    <div
      className='card mb-6 border-2 border-[rgba(102,126,234,0.3)]'
      style={{
        background:
          'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
      }}
    >
      <div className='flex items-center gap-4'>
        <FaUser
          className='text-4xl md:text-5xl'
          style={{ color: 'var(--primary)' }}
        />
        <div>
          <h2 className='mb-1 text-sm md:text-xl text-[color:var(--text-)]'>
            Selamat Datang,{' '}
            {profile?.profile?.fullName || user?.username || 'Alumni'}!
          </h2>
          <p className='text-xs md:text-sm text-[color:var(--text-tertiary)]'>
            Jelajahi data alumni dan informasi terkini. Kelola data dan profil
            Anda!
          </p>
        </div>
      </div>

      {!profile?.questionnaireCompleted && (
        <div className='mt-5 rounded-xl border-2 border-dashed border-[color:var(--warning)] bg-[color:var(--bg-tertiary)] p-6'>
          <div className='mb-4 flex items-center gap-3'>
            <FaEdit className='text-3xl text-[color:var(--warning)]' />
            <div>
              <h3 className='mb-1'>Kuesioner Belum Lengkap</h3>
              <p className='text-sm text-[color:var(--text-secondary)]'>
                Silakan isi kuesioner untuk melengkapi data Anda
              </p>
            </div>
          </div>
          <Link
            to='/alumni/questionnaire'
            className='btn btn-primary flex items-center gap-2'
          >
            <FaEdit />
            <span>Isi Kuesioner Sekarang</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default WelcomCardAlumni;
