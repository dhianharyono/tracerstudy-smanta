import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import InteractiveAlumniMap from '../../components/InteractiveAlumniMap';
import WelcomeCard from '@/components/Dashboard/WelcomeCard';
import Statistic from '@/components/Dashboard/Statistic';
import PerguruanTinggi from '@/components/Dashboard/PerguruanTinggi';
import News from '@/components/Dashboard/News';
import Jurusan from '@/components/Dashboard/Jurusan';
import TahunLulus from '@/components/Dashboard/TahunLulus';
// import Notifications from '@/components/Dashboard/Notifications';

const StudentDashboard = () => {
  const { user } = useAuth();
  // const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartWidth, setChartWidth] = useState(900);
  // const [unreadNewsCount, setUnreadNewsCount] = useState(0);
  // const [unreadNews, setUnreadNews] = useState<any[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, newsRes] = await Promise.all([
          axios.get('/api/student/dashboard'),
          axios.get('/api/student/news'),
          axios
            .get('/api/student/news/unread-count')
            .catch(() => ({ data: { count: 0 } })),
        ]);
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
    //     .get('/api/student/news/unread-count')
    //     .then((res) => setUnreadNewsCount(res.data.count || 0))
    //     .catch(() => {});

    //   axios
    //     .get('/api/student/news')
    //     .then((res) => {
    //       const unread = res.data.filter((item: any) => !item.isRead);
    //       setUnreadNews(unread);
    //     })
    //     .catch(() => {});
    // }, 30000);

    // return () => clearInterval(interval);
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
  //     await axios.post(`/api/student/news/${newsId}/read`);
  //     setUnreadNewsCount((prev) => Math.max(0, prev - 1));
  //     setUnreadNews((prev) => prev.filter((item) => item._id !== newsId));
  //     setIsNotificationOpen(false);
  //     navigate(`/student/news/${newsId}`);
  //   } catch (error) {
  //     console.error('Error marking news as read:', error);
  //     navigate(`/student/news/${newsId}`);
  //   }
  // };

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
      <div className='relative flex justify-between'>
        <h1 className='text-xl md:text-2xl'>Dashboard</h1>
        {/* <Notifications
          notificationRef={notificationRef}
          isNotificationOpen={isNotificationOpen}
          setIsNotificationOpen={(e) => setIsNotificationOpen(e)}
          unreadNewsCount={unreadNewsCount}
          unreadNews={unreadNews}
          handleNewsClick={(e) => handleNewsClick(e)}
        /> */}
      </div>

      <WelcomeCard username={user?.username || ''} />
      <Statistic stats={stats} />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6'>
        <PerguruanTinggi data={universityTypeData} chartWidth={chartWidth} />
        <News data={news} />
      </div>
      <div className='mb-6 md:mb-8 max-w-sm md:max-w-md lg:max-w-full'>
        <InteractiveAlumniMap apiEndpoint='/api/student/alumni-map' />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6'>
        <Jurusan data={stats} chartWidth={chartWidth} />
        <TahunLulus data={stats} chartWidth={chartWidth} />
      </div>
    </div>
  );
};

export default StudentDashboard;
