import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
// import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import InteractiveAlumniMap from '../../components/InteractiveAlumniMap';
import Statistic from '@/components/Dashboard/Statistic';
import PerguruanTinggi from '@/components/Dashboard/PerguruanTinggi';
import News from '@/components/Dashboard/News';
import Jurusan from '@/components/Dashboard/Jurusan';
import TahunLulus from '@/components/Dashboard/TahunLulus';
// import Notifications from '@/components/Dashboard/Notifications';
import WelcomCardAlumni from '@/components/Dashboard/WelcomCardAlumni';

const AlumniDashboard = () => {
  const { user } = useAuth();
  // const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // const [setUnreadNewsCount] = useState(0);
  // const [setUnreadNews] = useState<any[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(900);
  const [hideQuestionnaireCard, setHideQuestionnaireCard] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, statsRes, newsRes] = await Promise.all([
          axios.get('/api/alumni/profile'),
          axios.get('/api/alumni/dashboard'),
          axios.get('/api/alumni/news'),
          axios
            .get('/api/alumni/news/unread-count')
            .catch(() => ({ data: { count: 0 } })),
        ]);
        setProfile(profileRes.data);
        setStats(statsRes.data);
        setNews(newsRes.data);

        // const unread = newsRes.data.filter((item: any) => !item.isRead);
        // setUnreadNewsCount(unread.length || 0);
        // setUnreadNews(unread);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // const interval = setInterval(() => {
    //   axios
    //     .get('/api/alumni/news/unread-count')
    //     .then((res) => setUnreadNewsCount(res.data.count || 0))
    //     .catch(() => {});

    //   axios
    //     .get('/api/alumni/news')
    //     .then((res) => {
    //       const unread = res.data.filter((item: any) => !item.isRead);
    //       setUnreadNews(unread);
    //     })
    //     .catch(() => {});
    // }, 30000);

    // return () => clearInterval(interval);
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
    const hidden = localStorage.getItem('hideQuestionnaireCard');
    if (hidden === 'true') {
      setHideQuestionnaireCard(true);
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

  // const handleNewsClick = async (newsId: string) => {
  //   try {
  //     await axios.post(`/api/alumni/news/${newsId}/read`);
  //     setUnreadNewsCount((prev) => Math.max(0, prev - 1));
  //     setUnreadNews((prev) => prev.filter((item) => item._id !== newsId));
  //     setIsNotificationOpen(false);
  //     navigate(`/alumni/news/${newsId}`);
  //   } catch (error) {
  //     console.error('Error marking news as read:', error);
  //     navigate(`/alumni/news/${newsId}`);
  //   }
  // };

  const universityTypeData = stats?.universityTypes
    ? [
      { name: 'PTN', value: stats.universityTypes.negeri },
      { name: 'PTS', value: stats.universityTypes.swasta },
      { name: 'Kedinasan', value: stats.universityTypes.kedinasan },
    ]
    : [];

  const handleCloseQuestionnaireCard = () => {
    setHideQuestionnaireCard(true);
    localStorage.setItem('hideQuestionnaireCard', 'true');
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-[calc(100vh-64px)]'>
        <div className='flex items-center gap-3 text-lg font-medium text-gray-400'>
          <FaSpinner className='animate-spin text-xl' />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <div className='flex flex-col md:flex-row justify-between items-center mb-6 gap-4'>
        <div className='text-center md:text-left'>
          <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>Dashboard Alumni</h1>
          <p className='text-[color:var(--text-secondary)] text-sm md:text-base'>
            Selamat datang kembali di Tracer Study
          </p>
        </div>
        {/* Notifications component placeholder - if needed uncomment and style */}
      </div>

      <WelcomCardAlumni
        user={user}
        profile={profile}
        hideQuestionnaireCard={hideQuestionnaireCard}
        handleCloseQuestionnaireCard={handleCloseQuestionnaireCard}
      />

      <div className="mt-8">
        <Statistic stats={stats} />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 md:mb-8'>
        <PerguruanTinggi data={universityTypeData} />
        <News data={news} />
      </div>

      <div className='mb-6 md:mb-8 w-full rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-1 overflow-hidden shadow-sm'>
        <InteractiveAlumniMap apiEndpoint='/api/alumni/alumni-map' />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Jurusan data={stats} chartWidth={chartWidth} />
        <TahunLulus data={stats} chartWidth={chartWidth} />
      </div>
    </div>
  );
};

export default AlumniDashboard;
