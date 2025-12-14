import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers,
  FaBriefcase,
  FaGraduationCap,
  FaUniversity,
  FaChartBar,
  FaChartLine,
  FaNewspaper,
} from 'react-icons/fa';
import { stripHtml } from '../../utils/helpers';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import InteractiveAlumniMap from '../../components/InteractiveAlumniMap';
import Statistic from '@/components/Dashboard/Statistic';
import PerguruanTinggi from '@/components/Dashboard/PerguruanTinggi';
import News from '@/components/Dashboard/News';
import Jurusan from '@/components/Dashboard/Jurusan';
import TahunLulus from '@/components/Dashboard/TahunLulus';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartWidth, setChartWidth] = useState(900);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, newsRes] = await Promise.all([
          axios.get('/api/admin/dashboard'),
          axios.get('/api/admin/news'),
        ]);
        setStats(statsRes.data);
        setNews(newsRes.data.filter((n: any) => n.isPublished).slice(0, 3));
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

  if (loading) {
    return <div className='loading'>Loading...</div>;
  }

  const universityTypeData = stats?.universityTypes
    ? [
        { name: 'PTN', value: stats.universityTypes.negeri },
        { name: 'PTS', value: stats.universityTypes.swasta },
        { name: 'Kedinasan', value: stats.universityTypes.kedinasan },
      ]
    : [];

  return (
    <div className='w-full'>
      <div className='page-header'>
        <h1 className='page-title'>Dashboard Administrator</h1>
      </div>
      {/* Statistic */}
      <Statistic stats={stats} />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6'>
        <PerguruanTinggi data={universityTypeData} chartWidth={chartWidth} />
        <News data={news} />
      </div>

      {/* Interactive Alumni Map */}
      <div className='mb-6 md:mb-8 max-w-sm md:max-w-md lg:max-w-full'>
        <InteractiveAlumniMap apiEndpoint='/api/admin/alumni-map' />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6'>
        <Jurusan data={stats} chartWidth={chartWidth} />
        <TahunLulus data={stats} chartWidth={chartWidth} />
      </div>
    </div>
  );
};

export default AdminDashboard;
