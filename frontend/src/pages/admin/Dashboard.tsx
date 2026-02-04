import { useEffect, useState } from 'react';
import axios from 'axios';
import InteractiveAlumniMap from '../../components/InteractiveAlumniMap';
import Statistic from '@/components/Dashboard/Statistic';
import PerguruanTinggi from '@/components/Dashboard/PerguruanTinggi';
import News from '@/components/Dashboard/News';
import Jurusan from '@/components/Dashboard/Jurusan';
import TahunLulus from '@/components/Dashboard/TahunLulus';
import SmartLoader from '@/components/SmartLoader';

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartWidth, setChartWidth] = useState(900);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, newsRes] = await Promise.all([
          axios.get('/api/admin/dashboard'),
          axios.get('/api/admin/news?limit=3&isPublished=true'),
        ]);
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

  if (loading) {
    return (
      <SmartLoader
        messages={[
          'Menyiapkan dashboard admin...',
          'Mengambil statistik...',
          'Menganalisis data...',
        ]}
      />
    );
  }

  const universityTypeData = stats?.universityTypes
    ? [
      { name: 'PTN', value: stats.universityTypes.negeri },
      { name: 'PTS', value: stats.universityTypes.swasta },
      { name: 'Kedinasan', value: stats.universityTypes.kedinasan },
    ]
    : [];

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <div className='mb-6 text-center md:text-left'>
        <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
          Dashboard Administrator
        </h1>
        <p className='text-[color:var(--text-secondary)] text-sm md:text-base'>
          Ringkasan data tracer study siswa dan alumni
        </p>
      </div>

      <Statistic stats={stats} />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
        <PerguruanTinggi data={universityTypeData} />
        <News data={news} />
      </div>

      <div className='w-full rounded-2xl bg-[color:var(--bg-card)] p-1 overflow-hidden shadow-sm'>
        <InteractiveAlumniMap apiEndpoint='/api/admin/alumni-map' />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Jurusan data={stats} chartWidth={chartWidth} />
        <TahunLulus data={stats} chartWidth={chartWidth} />
      </div>
    </div>
  );
};

export default AdminDashboard;
