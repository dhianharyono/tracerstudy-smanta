import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import axios from 'axios';
import TopUniversities from '@/components/Dashboard/TopUniversities';
import Statistic from '@/components/Dashboard/Statistic';
import PerguruanTinggi from '@/components/Dashboard/PerguruanTinggi';
import News from '@/components/Dashboard/News';
import Jurusan from '@/components/Dashboard/Jurusan';
import TahunLulus from '@/components/Dashboard/TahunLulus';
import AlumniDataProgress from '@/components/Dashboard/StatusAlumni';
import AlumniRegistrationTrend from '@/components/Dashboard/AlumniRegistrationTrend';
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
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
        <div>
          <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
            Dashboard Administrator
          </h1>
          <p className='text-[color:var(--text-secondary)] text-sm md:text-base'>
            Ringkasan data tracer study siswa dan alumni
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-[#3b6ebb] font-semibold text-xs rounded-xl shadow-xs transition-all shrink-0"
        >
          <FaHome className="text-[#3b6ebb]" /> Halaman Utama
        </Link>
      </div>

      <Statistic stats={stats} />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
        <PerguruanTinggi data={universityTypeData} />
        <News data={news} />
      </div>

      <div className='mb-6'>
        <AlumniRegistrationTrend />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
        <TopUniversities data={stats?.universityStats || []} />
        <Jurusan data={stats} chartWidth={chartWidth} title="Jurusan Populer" />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <TahunLulus data={stats} chartWidth={chartWidth} />
        <AlumniDataProgress stats={stats} />
      </div>
    </div>
  );
};

export default AdminDashboard;
