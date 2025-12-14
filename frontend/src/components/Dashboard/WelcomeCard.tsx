import { FaGraduationCap } from 'react-icons/fa';

const WelcomeCard = ({ username }: { username: string }) => {
  return (
    <div
      className='card max-w-sm md:max-w-md lg:max-w-full'
      style={{
        background:
          'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
        border: '2px solid rgba(102, 126, 234, 0.3)',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <FaGraduationCap
          style={{ fontSize: '48px', color: 'var(--primary)' }}
        />
        <div>
          <h2
            style={{
              fontSize: '20px',
              marginBottom: '4px',
              color: 'var(--text-primary)',
            }}
          >
            Selamat Datang, {username}!
          </h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
            Jelajahi data alumni dan informasi terkini
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
