import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
// import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner';
import InteractiveAlumniMap from '../../components/InteractiveAlumniMap';
import Statistic from '@/components/Dashboard/Statistic';
import PerguruanTinggi from '@/components/Dashboard/PerguruanTinggi';
import News from '@/components/Dashboard/News';
import Jurusan from '@/components/Dashboard/Jurusan';
import TahunLulus from '@/components/Dashboard/TahunLulus';
// import Notifications from '@/components/Dashboard/Notifications';
import WelcomCardAlumni from '@/components/Dashboard/WelcomCardAlumni';
import { FaUserCircle, FaChevronRight, FaUsers } from 'react-icons/fa';

const AlumniDashboard = () => {
  const { user } = useAuth();
  // const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [mutualAlumni, setMutualAlumni] = useState<any[]>([]);
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
        const [profileRes, statsRes, newsRes, mutualRes] = await Promise.all([
          axios.get('/api/alumni/profile'),
          axios.get('/api/alumni/dashboard'),
          axios.get('/api/alumni/news'),
          axios.get('/api/alumni/mutual-alumni').catch(() => ({ data: [] })),
        ]);
        setProfile(profileRes.data);
        setStats(statsRes.data);
        setNews(newsRes.data);
        setMutualAlumni(mutualRes.data);

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
    return <LoadingSpinner />;
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <div className='flex flex-col md:flex-row justify-between items-center mb-6 gap-4'>
        <div className='text-center md:text-left'>
          <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
            Dashboard Alumni
          </h1>
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

      <div className='mt-8'>
        <Statistic stats={stats} />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
        <PerguruanTinggi data={universityTypeData} />
        <News data={news} />

        {/* Mutual Alumni Section */}
        <div className='card flex flex-col'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'>
                <FaUsers className='text-lg' />
              </div>
              <div>
                <h2 className='text-sm md:text-lg font-bold text-[color:var(--text-primary)] !mb-0'>
                  Rekan Sepantaran
                </h2>
                <p className='text-[10px] md:text-xs text-[color:var(--text-secondary)]'>
                  Lulus di tahun yang sama
                </p>
              </div>
            </div>
            {mutualAlumni.length > 0 && (
              <Link
                to='/alumni/mutual-alumni'
                className='text-[10px] md:text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1'
              >
                Lihat Semua <FaChevronRight className='text-[10px]' />
              </Link>
            )}
          </div>

          <div className='flex-1 space-y-4'>
            {mutualAlumni.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-full py-8 text-center'>
                <FaUserCircle className='text-4xl text-gray-200 dark:text-gray-700 mb-2' />
                <p className='text-sm text-[color:var(--text-secondary)]'>
                  Tidak ada data alumni yang ditemukan
                </p>
              </div>
            ) : (
              mutualAlumni.slice(0, 5).map((person: any) => (
                <div key={person._id} className='flex items-center gap-3 group'>
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 group-hover:bg-[var(--primary-light)]/20 group-hover:text-[var(--primary)] transition-colors'>
                    <FaUserCircle className='text-2xl' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='text-sm font-semibold text-[color:var(--text-primary)] truncate'>
                      {person.profile?.fullName || 'Anonymous'}
                    </h4>
                    <p className='text-[10px] text-[color:var(--text-tertiary)] truncate uppercase tracking-wider'>
                      {person.university?.name ||
                        person.job?.institution ||
                        'Belum ada info'}
                    </p>
                  </div>
                </div>
              ))
            )}
            {mutualAlumni.length > 5 && (
              <Link
                to='/alumni/mutual-alumni'
                className='block mt-2 text-center text-xs font-medium text-[color:var(--text-secondary)] hover:text-[var(--primary)] transition-colors'
              >
                +{mutualAlumni.length - 5} alumni lainnya
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className='w-full rounded-2xl bg-[color:var(--bg-card)] p-1 overflow-hidden shadow-sm'>
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
