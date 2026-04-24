import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import SmartLoader from '@/components/SmartLoader';
import { useAuth } from '../../contexts/AuthContext';
import TopUniversities from '@/components/Dashboard/TopUniversities';
import WelcomeCard from '@/components/Dashboard/WelcomeCard';
import Statistic from '@/components/Dashboard/Statistic';
import PerguruanTinggi from '@/components/Dashboard/PerguruanTinggi';
import News from '@/components/Dashboard/News';
import Jurusan from '@/components/Dashboard/Jurusan';
import TahunLulus from '@/components/Dashboard/TahunLulus';
import AlumniDataProgress from '@/components/Dashboard/StatusAlumni';
import RestrictedAccess from '@/components/RestrictedAccess';
import { isStudentProfileComplete } from '@/utils/helpers';
import { isNameIncomplete } from '@/utils/validation';
import EventWelcomeCard from '@/components/Dashboard/EventWelcomeCard';
import EventRegisterModal from '@/components/EventRegisterModal';
import GraduationConfirmationModal from '@/components/Dashboard/GraduationConfirmationModal';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartWidth, setChartWidth] = useState(900);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isGraduationModalOpen, setIsGraduationModalOpen] = useState(
    new Date().getMonth() === 4,
  );
  const notificationRef = useRef<HTMLDivElement>(null);
  console.log(stats);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, newsRes, eventsRes] = await Promise.all([
          axios.get('/api/student/dashboard'),
          axios.get('/api/student/news?limit=3'),
          axios.get('/api/events?limit=1'),
        ]);
        setStats(statsRes.data);
        setNews(newsRes.data);
        setEvents(eventsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const universityTypeData = stats?.universityTypes
    ? [
        { name: 'PTN', value: stats.universityTypes.negeri },
        { name: 'PTS', value: stats.universityTypes.swasta },
        { name: 'Kedinasan', value: stats.universityTypes.kedinasan },
      ]
    : [];

  if (loading) {
    return (
      <SmartLoader
        messages={[
          'Menyiapkan dashboard siswa...',
          'Mengambil statistik...',
          'Memuat berita terbaru...',
        ]}
      />
    );
  }

  if (user && isNameIncomplete(user.profile || user)) {
    return <RestrictedAccess type='name_incomplete' role='student' />;
  }

  if (!isStudentProfileComplete(user)) {
    return <RestrictedAccess type='profile_incomplete' role='student' />;
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <div className='flex flex-col md:flex-row justify-between items-center mb-6 gap-4'>
        <div className='text-center md:text-left'>
          <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
            Dashboard Siswa
          </h1>
          <p className='text-[color:var(--text-secondary)] text-sm md:text-base'>
            Selamat datang kembali di Tracer Study
          </p>
        </div>
      </div>

      <WelcomeCard
        username={user?.username || ''}
        fullName={user?.profile?.fullName}
      />

      {events.length > 0 && (
        <EventWelcomeCard
          event={events[0]}
          isRegistered={events[0].isRegistered}
          onRegister={() => {
            setSelectedEvent(events[0]);
            setIsRegisterModalOpen(true);
          }}
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

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
        <TahunLulus data={stats} chartWidth={chartWidth} />
        <AlumniDataProgress stats={stats} />
      </div>

      <EventRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        event={selectedEvent}
        onSuccess={() => {
          window.location.reload();
        }}
      />
      <GraduationConfirmationModal
        isOpen={isGraduationModalOpen}
        onClose={() => setIsGraduationModalOpen(false)}
        onSuccess={() => {
          window.location.href = '/alumni';
        }}
      />
    </div>
  );
};

export default StudentDashboard;
