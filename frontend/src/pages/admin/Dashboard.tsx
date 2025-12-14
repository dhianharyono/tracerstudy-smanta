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

  const COLORS = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ec4899'];

  return (
    <div className='w-full'>
      <div className='page-header'>
        <h1 className='page-title'>Dashboard Administrator</h1>
      </div>
      {/* Statistic */}
      <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 md:gap-6 mb-6 md:mb-8'>
        <div className='stat-card'>
          <div className='icon'>
            <FaUsers />
          </div>
          <h3>Total Alumni</h3>
          <div className='value'>{stats?.totalAlumni || 0}</div>
        </div>
        <div
          className='stat-card'
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
          }}
        >
          <div className='icon'>
            <FaUsers />
          </div>
          <h3>Total Siswa</h3>
          <div className='value'>{stats?.totalStudents || 0}</div>
        </div>
        <div className='stat-card warning'>
          <div className='icon'>
            <FaBriefcase />
          </div>
          <h3>Alumni Kerja</h3>
          <div className='value'>{stats?.workingAlumni || 0}</div>
        </div>
        <div className='stat-card info'>
          <div className='icon'>
            <FaGraduationCap />
          </div>
          <h3>Alumni Kuliah</h3>
          <div className='value'>{stats?.studyingAlumni || 0}</div>
        </div>
        <div
          className='stat-card'
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          }}
        >
          <div className='icon'>
            <FaUniversity />
          </div>
          <h3>PTN</h3>
          <div className='value'>{stats?.universityTypes?.negeri || 0}</div>
        </div>
        <div
          className='stat-card'
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          }}
        >
          <div className='icon'>
            <FaUniversity />
          </div>
          <h3>PTS</h3>
          <div className='value'>{stats?.universityTypes?.swasta || 0}</div>
        </div>
        <div
          className='stat-card'
          style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
          }}
        >
          <div className='icon'>
            <FaUniversity />
          </div>
          <h3>Kedinasan</h3>
          <div className='value'>{stats?.universityTypes?.kedinasan || 0}</div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6'>
        {/* Chart Peguruan Tinggi */}
        <div className='card'>
          <h2
            style={{
              marginBottom: '24px',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '20px',
            }}
          >
            <FaChartBar />
            <span>Jenis Perguruan Tinggi</span>
          </h2>
          {universityTypeData.length > 0 ? (
            <div className='chart-container'>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  overflowX: 'auto',
                }}
              >
                <PieChart width={Math.min(500, chartWidth)} height={350}>
                  <Pie
                    data={universityTypeData}
                    cx={250}
                    cy={175}
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {universityTypeData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      boxShadow: 'var(--shadow-lg)',
                      color: 'var(--text-primary)',
                    }}
                    labelStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend wrapperStyle={{ color: 'var(--text-primary)' }} />
                </PieChart>
              </div>
            </div>
          ) : (
            <p
              style={{
                textAlign: 'center',
                color: 'var(--text-tertiary)',
                padding: '40px',
              }}
            >
              No data available
            </p>
          )}
        </div>
        {/* News */}
        {news.length > 0 && (
          <div className='card'>
            <h2
              style={{
                marginBottom: '24px',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '20px',
              }}
            >
              <FaNewspaper />
              <span>News</span>
            </h2>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {news.slice(0, 2).map((newsItem) => (
                <div
                  key={newsItem._id}
                  style={{
                    padding: '16px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-card-hover)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <h3
                    style={{
                      marginBottom: '8px',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {newsItem.title}
                  </h3>
                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '13px',
                      marginBottom: '8px',
                    }}
                  >
                    {(() => {
                      const plainText = stripHtml(newsItem.content || '');
                      return plainText.length > 150
                        ? `${plainText.substring(0, 150)}...`
                        : plainText;
                    })()}
                  </p>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-tertiary)',
                      marginBottom: '8px',
                    }}
                  >
                    {newsItem.author?.username} •{' '}
                    {new Date(newsItem.createdAt).toLocaleDateString('id-ID')}
                  </div>
                </div>
              ))}
              <button
                onClick={() => navigate('/admin/news')}
                className='btn btn-primary'
                style={{ width: '100%', marginTop: '8px' }}
              >
                Read More
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Alumni Map */}
      <div className='mb-6 md:mb-8 max-w-sm md:max-w-md lg:max-w-full'>
        <InteractiveAlumniMap apiEndpoint='/api/admin/alumni-map' />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6'>
        {/* Chart Jurusan */}
        {stats?.majorStats && stats.majorStats.length > 0 && (
          <div className='card mb-6 md:mb-8 max-w-sm md:max-w-md lg:max-w-full'>
            <h2
              className='mb-6'
              style={{
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '20px',
              }}
            >
              <FaChartLine />
              <span>Statistik Jurusan</span>
            </h2>
            <div className='chart-container'>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  overflowX: 'auto',
                }}
              >
                <BarChart
                  width={Math.min(500, chartWidth)}
                  height={400}
                  data={stats.majorStats}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='rgba(148, 163, 184, 0.2)'
                  />
                  <XAxis
                    dataKey='_id'
                    stroke='var(--text-tertiary)'
                    angle={-45}
                    textAnchor='end'
                    height={100}
                    tick={{ fill: 'var(--text-secondary)' }}
                  />
                  <YAxis
                    stroke='var(--text-tertiary)'
                    tick={{ fill: 'var(--text-secondary)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      boxShadow: 'var(--shadow-lg)',
                      color: 'var(--text-primary)',
                    }}
                    labelStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend wrapperStyle={{ color: 'var(--text-primary)' }} />
                  <Bar dataKey='count' fill='#8b5cf6' radius={[8, 8, 0, 0]} />
                </BarChart>
              </div>
            </div>
          </div>
        )}
        {/* Chart Tahun Lulus */}
        {stats?.yearStats && stats.yearStats.length > 0 && (
          <div className='card mb-6 md:mb-8 max-w-sm md:max-w-md lg:max-w-full'>
            <h2
              className='mb-6'
              style={{
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '20px',
              }}
            >
              <FaChartLine />
              <span>Statistik Berdasarkan Tahun Lulus</span>
            </h2>
            <div className='chart-container'>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  overflowX: 'auto',
                }}
              >
                <LineChart
                  width={Math.min(500, chartWidth)}
                  height={400}
                  data={stats.yearStats}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='rgba(148, 163, 184, 0.2)'
                  />
                  <XAxis
                    dataKey='_id'
                    stroke='var(--text-tertiary)'
                    tick={{ fill: 'var(--text-secondary)' }}
                  />
                  <YAxis
                    stroke='var(--text-tertiary)'
                    tick={{ fill: 'var(--text-secondary)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      boxShadow: 'var(--shadow-lg)',
                      color: 'var(--text-primary)',
                    }}
                    labelStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend wrapperStyle={{ color: 'var(--text-primary)' }} />
                  <Line
                    type='monotone'
                    dataKey='count'
                    stroke='#8b5cf6'
                    strokeWidth={2}
                  />
                </LineChart>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
