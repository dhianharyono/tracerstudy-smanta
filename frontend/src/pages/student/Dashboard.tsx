import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
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
  const [chartWidth, setChartWidth] = useState(900);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isGraduationModalOpen, setIsGraduationModalOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['studentDashboardStats'],
    queryFn: async () => {
      const res = await axios.get('/api/student/dashboard');
      return res.data;
    },
    staleTime: 2 * 60 * 1000, // Keep fresh for 2 minutes
  });

  const { data: news = [], isLoading: newsLoading } = useQuery({
    queryKey: ['studentDashboardNews'],
    queryFn: async () => {
      const res = await axios.get('/api/student/news?limit=3');
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['studentDashboardEvents'],
    queryFn: async () => {
      const res = await axios.get('/api/events?limit=1');
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
  });

  const loading = statsLoading || newsLoading || eventsLoading;

  console.log(stats);

  useEffect(() => {
    // Show graduation confirmation modal if it's past May 4th of their graduation year
    const gradYear = user?.profile?.graduationYear;
    if (!gradYear) return;

    const now = new Date();
    const isPastGradYear = now.getFullYear() > gradYear;
    const isGraduationDay =
      now.getFullYear() === gradYear &&
      (now.getMonth() > 4 || (now.getMonth() === 4 && now.getDate() >= 4));

    const hasShown = sessionStorage.getItem('graduation_modal_shown');

    if ((isPastGradYear || isGraduationDay) && !hasShown && !loading) {
      const timer = setTimeout(() => {
        setIsGraduationModalOpen(true);
        sessionStorage.setItem('graduation_modal_shown', 'true');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, user]);

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

  if (user?.isHidden) {
    return <RestrictedAccess type='hidden_user' role='student' />;
  }

  if (!isStudentProfileComplete(user)) {
    return <RestrictedAccess type='profile_incomplete' role='student' />;
  }

  if (user && isNameIncomplete(user.profile || user)) {
    return <RestrictedAccess type='name_incomplete' role='student' />;
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
        <div>
          <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
            Dashboard Siswa
          </h1>
          <p className='text-[color:var(--text-secondary)] text-sm md:text-base'>
            Selamat datang kembali di Tracer Study
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-[#3b6ebb] font-semibold text-xs rounded-xl shadow-xs transition-all shrink-0"
        >
          <FaHome className="text-[#3b6ebb]" /> Halaman Utama
        </Link>
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
