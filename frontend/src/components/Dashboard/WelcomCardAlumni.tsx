import { FaEdit, FaUser, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import React from 'react';

interface User {
  username?: string;
}

interface Profile {
  questionnaireCompleted?: boolean;
}

interface WelcomeCardAlumniProps {
  user: User | null;
  profile: Profile | null;
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
        <FaUser className='text-5xl' style={{ color: 'var(--primary)' }} />
        <div>
          <h2 className='mb-1 text-xl text-[color:var(--text-)]'>
            Selamat Datang, {user?.username || 'Alumni'}!
          </h2>
          <p className='text-sm text-[color:var(--text-tertiary)]'>
            Jelajahi data alumni dan informasi terkini. Kelola data dan profil
            Anda!
          </p>
        </div>
      </div>

      {!profile?.questionnaireCompleted ? (
        // Kuesioner Belum Lengkap
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
      ) : (
        // Kuesioner Lengkap
        !hideQuestionnaireCard && (
          <div className='card relative mt-5 rounded-xl border border-[color:var(--success)] p-6'>
            <button
              onClick={handleCloseQuestionnaireCard}
              className='absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md border-none bg-transparent p-1 text-xl text-[color:var(--text-tertiary)] transition-all hover:bg-[color:var(--bg-tertiary)] hover:text-[color:var(--text-primary)] focus:outline-none'
            >
              <FaTimes />
            </button>
            <div className='mb-4 flex items-center gap-3'>
              <FaCheckCircle className='text-3xl text-[color:var(--success)]' />
              <div>
                <h3 className='mb-1'>Kuesioner Lengkap</h3>
                <p className='text-sm text-[color:var(--text-secondary)]'>
                  Data kuesioner Anda sudah lengkap
                </p>
              </div>
            </div>
            <div className='flex flex-wrap gap-3'>
              <Link
                to='/alumni/profile'
                className='btn btn-success flex items-center gap-2'
              >
                <FaUser />
                <span>Lihat Profil</span>
              </Link>
              <Link
                to='/alumni/questionnaire'
                className='btn btn-primary flex items-center gap-2'
              >
                <FaEdit />
                <span>Edit Kuesioner</span>
              </Link>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default WelcomCardAlumni;
