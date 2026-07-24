import SmartLoader from '@/components/SmartLoader';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaCrown } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import TopUniversities from '@/components/Dashboard/TopUniversities';
import Statistic from '@/components/Dashboard/Statistic';
import PerguruanTinggi from '@/components/Dashboard/PerguruanTinggi';
import News from '@/components/Dashboard/News';
import Jurusan from '@/components/Dashboard/Jurusan';
import TahunLulus from '@/components/Dashboard/TahunLulus';
import AlumniDataProgress from '@/components/Dashboard/StatusAlumni';
import WelcomCardAlumni from '@/components/Dashboard/WelcomCardAlumni';
import RestrictedAccess from '@/components/RestrictedAccess';
import MentorshipPromoCard from '@/components/Dashboard/MentorshipPromoCard';
import { isUniversityIncomplete, isNameIncomplete } from '@/utils/validation';

const AlumniDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(900);
  const [hideMentorPromo, setHideMentorPromo] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, statsRes, newsRes] = await Promise.all([
          axios.get('/api/alumni/profile'),
          axios.get('/api/alumni/dashboard'),
          axios.get('/api/alumni/news?limit=3'),
          axios.get('/api/alumni/mutual-alumni').catch(() => ({ data: [] })),
        ]);
        setProfile(profileRes.data);
        setStats(statsRes.data);
        setNews(newsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const updateChartWidth = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setChartWidth(width - 40);
      } else if (width < 1024) {
        setChartWidth(Math.min(800, width - 80));
      } else {
        setChartWidth(Math.min(900, width - 120));
      }
    };

    updateChartWidth();
    window.addEventListener('resize', updateChartWidth);
    return () => window.removeEventListener('resize', updateChartWidth);
  }, []);

  useEffect(() => {
    const hiddenPromo = localStorage.getItem('hideMentorPromo');
    if (hiddenPromo === 'true') {
      setHideMentorPromo(true);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  const universityTypeData = stats?.universityTypes
    ? [
        { name: 'PTN', value: stats.universityTypes.negeri },
        { name: 'PTS', value: stats.universityTypes.swasta },
        { name: 'Kedinasan', value: stats.universityTypes.kedinasan },
      ]
    : [];

  const handleCloseMentorPromo = () => {
    setHideMentorPromo(true);
    localStorage.setItem('hideMentorPromo', 'true');
  };

  if (loading) {
    return (
      <SmartLoader
        messages={[
          'Menyiapkan dashboard alumni...',
          'Mengambil data profil...',
          'Menghubungkan dengan alumnus lain...',
        ]}
      />
    );
  }

  if (user?.isHidden) {
    return <RestrictedAccess type='hidden_user' role='alumni' />;
  }

  if (!user?.questionnaireCompleted) {
    return <RestrictedAccess type='questionnaire_incomplete' role='alumni' />;
  }

  if (profile && isNameIncomplete(profile?.profile || profile)) {
    return <RestrictedAccess type='name_incomplete' role='alumni' />;
  }

  if (profile && isUniversityIncomplete(profile)) {
    return <RestrictedAccess type='university_incomplete' role='alumni' />;
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <div className='flex flex-col md:flex-row justify-between items-center mb-6 gap-4'>
        <div className='text-center md:text-left'>
          <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0 flex flex-wrap items-center justify-center md:justify-start gap-0 md:gap-3'>
            Dashboard Alumni
            <div className='flex flex-wrap items-center gap-2 justify-center md:justify-start mt-2 mb-1'>
              {profile?.isMentor && (
                <span className='ml-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/50'>
                  <FaCrown className='text-[10px]' /> Mentor
                </span>
              )}
              {profile?.badges &&
                profile.badges.map((badge: any) => (
                  <span
                    key={badge._id}
                    className='inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/50'
                    title={badge.description}
                  >
                    <FaCrown className='text-[10px]' /> {badge.name}
                  </span>
                ))}
            </div>
          </h1>
          <p className='text-[color:var(--text-secondary)] text-sm md:text-base mt-1 md:mt-0'>
            Selamat datang kembali di Tracer Study
          </p>
        </div>
      </div>

      <WelcomCardAlumni
        user={user}
        profile={profile}
      />

      {!hideMentorPromo && (
        <MentorshipPromoCard
          profile={profile}
          onClose={handleCloseMentorPromo}
        />
      )}

      <div className='mt-8'>
        <Statistic stats={stats} />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
        <PerguruanTinggi data={universityTypeData} />
        <News data={news} />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
        <TopUniversities data={stats?.universityStats || []} />
        <Jurusan data={stats} chartWidth={chartWidth} title='Jurusan Populer' />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <TahunLulus data={stats} chartWidth={chartWidth} />
        <AlumniDataProgress stats={stats} />
      </div>
    </div>
  );
};

export default AlumniDashboard;
