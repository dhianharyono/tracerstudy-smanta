import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import SmartLoader from '@/components/SmartLoader';
import { FaChartLine, FaGlobe, FaWifi, FaInfoCircle, FaEye } from 'react-icons/fa';

const WebsiteStatistics = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today');

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/analytics/stats?period=${period}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) return <SmartLoader />;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const ROLE_COLORS: { [key: string]: string } = {
    alumni: '#0088FE',   // Blue
    student: '#00C49F',  // Teal
    public: '#FFBB28',   // Yellow
    school: '#FF8042',   // Orange
  };

  const renderMenuName = (menuName: string, path: string) => {
    if (!menuName || menuName === 'Unknown') {
      if (path.includes('/student')) {
        if (path.includes('/student/profile')) {
          return (
            <span className='text-[color:var(--text-primary)]'>Profile</span>
          );
        }
        if (path.includes('/student/alumni')) {
          return (
            <span className='text-[color:var(--text-primary)]'>Alumni</span>
          );
        }
        if (path.includes('/student/universities')) {
          return (
            <span className='text-[color:var(--text-primary)]'>
              Perguruan Tinggi
            </span>
          );
        }
        if (path.includes('/student/college-plan')) {
          return (
            <span className='text-[color:var(--text-primary)]'>
              Rencana Angkatan
            </span>
          );
        }
        if (path.includes('/student/majors')) {
          return (
            <span className='text-[color:var(--text-primary)]'>Jurusan</span>
          );
        }
        if (path.includes('/student/events')) {
          return (
            <span className='text-[color:var(--text-primary)]'>
              Berita Terkini
            </span>
          );
        }
        if (path.includes('/student/news')) {
          return (
            <span className='text-[color:var(--text-primary)]'>Berita</span>
          );
        }
        if (path.includes('/student/alumni-contact')) {
          return (
            <span className='text-[color:var(--text-primary)]'>
              Hubungi Alumni
            </span>
          );
        }
        return (
          <span className='text-[color:var(--text-primary)]'>
            Dashboard Siswa
          </span>
        );
      }
      if (path.includes('/alumni')) {
        if (path.includes('/alumni/profile')) {
          return (
            <span className='text-[color:var(--text-primary)]'>Profile</span>
          );
        }
        if (path.includes('/alumni/questionnaire')) {
          return (
            <span className='text-[color:var(--text-primary)]'>Kuesioner</span>
          );
        }
        if (path.includes('/alumni/mutual-alumni')) {
          return (
            <span className='text-[color:var(--text-primary)]'>
              Rekan Seangkatan
            </span>
          );
        }
        if (path.includes('/alumni/events')) {
          return (
            <span className='text-[color:var(--text-primary)]'>
              Berita Terkini
            </span>
          );
        }
        if (path.includes('/alumni/news')) {
          return (
            <span className='text-[color:var(--text-primary)]'>Berita</span>
          );
        }
        return (
          <span className='text-[color:var(--text-primary)]'>
            Dashboard Alumni
          </span>
        );
      }
      if (path === '/') {
        return (
          <span className='text-[color:var(--text-primary)]'>Landing Page</span>
        );
      }
    }
    return menuName;
  };
  console.log(stats);
  return (
    <div className='p-6 page-fade-in'>
      <div className='mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='mb-2 text-center md:text-left'>
          <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
            Statistik Website
          </h1>
          <p className='text-[color:var(--text-secondary)] text-sm md:text-base'>
            Pantau aktivitas pengunjung dan popularitas halaman
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className='bg-[color:var(--bg-card)] border border-[color:var(--border-color)] text-[color:var(--text-primary)] text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none'
          >
            <option value='today'>Hari Ini</option>
            <option value='yesterday'>Kemarin</option>
            <option value='week'>7 Hari Terakhir</option>
            <option value='month'>30 Hari Terakhir</option>
            <option value='year'>1 Tahun Terakhir</option>
          </select>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {/* PENGUNJUNG LANDING */}
        <div className='bg-[color:var(--bg-card)] p-5 rounded-2xl border border-[color:var(--border-color)] shadow-sm flex items-center gap-4 group hover:border-blue-500 hover:shadow-md transition-all duration-200'>
          <div className='p-3.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/30 flex items-center justify-center shrink-0'>
            <FaEye size={22} />
          </div>
          <div>
            <p className='text-[10px] text-[color:var(--text-secondary)] uppercase font-black tracking-wider mb-1'>PENGUNJUNG LANDING</p>
            <h3 className='text-2xl font-black text-[color:var(--text-primary)]'>
              {stats?.landingPageVisits || 0}
            </h3>
            <p className='text-[10px] text-[color:var(--text-tertiary)] mt-1 font-bold'>
              Lifetime: <span className='text-[color:var(--text-secondary)]'>{stats?.totalLandingPageVisits || 0}</span>
            </p>
          </div>
        </div>

        {/* TOTAL KUNJUNGAN */}
        <div className='bg-[color:var(--bg-card)] p-5 rounded-2xl border border-[color:var(--border-color)] shadow-sm flex items-center gap-4 group hover:border-indigo-500 hover:shadow-md transition-all duration-200'>
          <div className='p-3.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/30 flex items-center justify-center shrink-0'>
            <FaGlobe size={22} />
          </div>
          <div>
            <div className='flex items-center gap-1.5 mb-1'>
              <p className='text-[10px] text-[color:var(--text-secondary)] uppercase font-black tracking-wider'>
                TOTAL KUNJUNGAN
              </p>
              <div className='group/tip relative'>
                <FaInfoCircle className='cursor-help text-[color:var(--text-tertiary)] hover:text-indigo-600 transition-colors text-xs' />
                <div className='pointer-events-none absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 rounded bg-slate-800 p-2 text-center text-[10px] text-white opacity-0 shadow-lg transition-opacity group-hover/tip:opacity-100 z-50'>
                  Total Page Views (termasuk refresh) selama periode {period}.
                  <div className='absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-800'></div>
                </div>
              </div>
            </div>
            <h3 className='text-2xl font-black text-[color:var(--text-primary)]'>
              {stats?.visitsByDate?.reduce(
                (acc: number, curr: any) => acc + curr.count,
                0,
              ) || 0}
            </h3>
            <p className='text-[10px] text-[color:var(--text-tertiary)] mt-1 font-bold'>
              Semua Halaman
            </p>
          </div>
        </div>

        {/* PENGGUNA ONLINE */}
        <div className='bg-[color:var(--bg-card)] p-5 rounded-2xl border border-[color:var(--border-color)] shadow-sm flex items-center gap-4 group hover:border-green-500 hover:shadow-md transition-all duration-200'>
          <div className='p-3.5 rounded-xl bg-green-50 text-green-600 border border-green-200/30 flex items-center justify-center shrink-0'>
            <FaWifi size={22} />
          </div>
          <div>
            <p className='text-[10px] text-[color:var(--text-secondary)] uppercase font-black tracking-wider mb-1'>
              PENGGUNA ONLINE
            </p>
            <h3 className='text-2xl font-black text-[color:var(--text-primary)]'>
              {stats?.activeUsers || 0}
            </h3>
            <div className='text-[10px] text-[color:var(--text-tertiary)] mt-1 font-bold flex flex-col gap-0.5'>
              <span>Aktif (5 Menit)</span>
              {stats?.activeUsersDetail && (
                <span className='text-[10px] text-[color:var(--text-secondary)] font-medium normal-case'>
                  {stats.activeUsersDetail.student} Siswa, {stats.activeUsersDetail.alumni} Alumni, {stats.activeUsersDetail.school} Sekolah
                </span>
              )}
            </div>
          </div>
        </div>

        {/* TOP HALAMAN */}
        <div className='bg-[color:var(--bg-card)] p-5 rounded-2xl border border-[color:var(--border-color)] shadow-sm flex items-center gap-4 group hover:border-purple-500 hover:shadow-md transition-all duration-200'>
          <div className='p-3.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/30 flex items-center justify-center shrink-0'>
            <FaChartLine size={22} />
          </div>
          <div>
            <p className='text-[10px] text-[color:var(--text-secondary)] uppercase font-black tracking-wider mb-1'>
              TOP HALAMAN
            </p>
            <h3 className='text-lg font-black text-[color:var(--text-primary)] truncate max-w-[200px]'>
              {stats?.popularPages?.[0]?.path
                ? renderMenuName('', stats?.popularPages?.[0]?.path)
                : '-'}
            </h3>
            <p className='text-[10px] text-[color:var(--text-tertiary)] mt-1 font-bold'>
              Paling Sering Dibuka
            </p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
        {/* Weekly Traffic Chart */}
        <div className='bg-[color:var(--bg-card)] p-6 rounded-xl border border-[color:var(--border-color)] shadow-sm'>
          <h3 className='text-lg font-bold text-[color:var(--text-primary)] mb-6'>
            Trafik Kunjungan (
            {period === 'today'
              ? 'Per Jam'
              : period === 'yesterday'
                ? 'Kemarin (Per Jam)'
                : period === 'week'
                  ? '7 Hari Terakhir'
                  : period === 'month'
                    ? '30 Hari Terakhir'
                    : 'Bulanan'}
            )
          </h3>
          <div className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={stats?.visitsByDate}>
                <defs>
                  <linearGradient id='colorCount' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#8884d8' stopOpacity={0.8} />
                    <stop offset='95%' stopColor='#8884d8' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' opacity={0.1} />
                <XAxis dataKey='_id' fontSize={12} tickCount={7} />
                <YAxis fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
                <Area
                  type='monotone'
                  dataKey='count'
                  stroke='#8884d8'
                  fillOpacity={1}
                  fill='url(#colorCount)'
                  name='Kunjungan'
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Role Breakdown */}
        <div className='bg-[color:var(--bg-card)] p-6 rounded-xl border border-[color:var(--border-color)] shadow-sm'>
          <h3 className='text-lg font-bold text-[color:var(--text-primary)] mb-6'>
            Distribusi Pengunjung (Role)
          </h3>
          <div className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={stats?.visitsByRole}
                  cx='50%'
                  cy='50%'
                  innerRadius={60}
                  outerRadius={100}
                  fill='#8884d8'
                  paddingAngle={5}
                  dataKey='count'
                  nameKey='_id'
                  label={({ name, percent }) => {
                    const labelName = name === 'student' ? 'Siswa' : name === 'alumni' ? 'Alumni' : name === 'school' ? 'Sekolah' : 'Publik';
                    return `${labelName} ${(percent * 100).toFixed(0)}%`;
                  }}
                >
                  {stats?.visitsByRole?.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={ROLE_COLORS[entry._id] || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  formatter={(value) =>
                    value === 'student' ? 'Siswa' : value === 'alumni' ? 'Alumni' : value === 'school' ? 'Sekolah' : 'Publik'
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Popular Pages Table */}
      <div className='bg-[color:var(--bg-card)] rounded-xl border border-[color:var(--border-color)] shadow-sm overflow-hidden'>
        <div className='p-6 border-b border-[color:var(--border-color)]'>
          <h3 className='text-lg font-bold text-[color:var(--text-primary)]'>
            Top 10 Halaman Populer
          </h3>
          <p className='mt-1 text-xs text-[color:var(--text-tertiary)] flex flex-col gap-2'>
            <span>
              <strong>- Total Kunjungan:</strong> Jumlah total halaman dibuka
              (pageviews).
            </span>
            <span>
              <strong>- Pengunjung Unik:</strong> Jumlah pengguna berbeda
              (distinct users) yang membuka halaman.
            </span>
          </p>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead className='bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] uppercase font-medium'>
              <tr>
                <th className='px-6 py-4'>Nama Menu</th>
                <th className='px-6 py-4'>Role</th>
                <th className='px-6 py-4'>Path</th>
                <th
                  className='px-6 py-4 cursor-help'
                  title='Total kali halaman ini dimuat'
                >
                  Total Kunjungan
                </th>
                <th
                  className='px-6 py-4 cursor-help'
                  title='Jumlah user berbeda yang mengunjungi halaman ini'
                >
                  Pengunjung Unik
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[color:var(--border-color)]'>
              {stats?.popularPages?.map((page: any, index: number) => (
                <tr
                  key={index}
                  className='hover:bg-[color:var(--bg-tertiary)]/50'
                >
                  <td className='px-6 py-4 font-medium text-[color:var(--text-primary)]'>
                    {renderMenuName(page.menuName, page.path)}
                  </td>
                  <td className='px-6 py-4'>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                      page.path.includes('/student')
                        ? 'bg-blue-50 text-blue-700 border-blue-200/50'
                        : page.path.includes('/alumni')
                          ? 'bg-green-50 text-green-700 border-green-200/50'
                          : page.path.includes('/school')
                            ? 'bg-purple-50 text-purple-700 border-purple-200/50'
                            : 'bg-amber-50 text-amber-700 border-amber-200/50'
                    }`}>
                      {page.path.includes('/student')
                        ? 'Siswa'
                        : page.path.includes('/alumni')
                          ? 'Alumni'
                          : page.path.includes('/school')
                            ? 'Sekolah'
                            : 'Publik'}
                    </span>
                  </td>
                  <td className='px-6 py-4 font-medium text-[color:var(--text-tertiary)] italic'>
                    {page.path}
                  </td>
                  <td className='px-6 py-4 text-[color:var(--text-secondary)]'>
                    {page.count}
                  </td>
                  <td className='px-6 py-4 text-[color:var(--text-secondary)]'>
                    {page.uniqueUsers}
                  </td>
                </tr>
              ))}
              {(!stats?.popularPages || stats.popularPages.length === 0) && (
                <tr>
                  <td
                    colSpan={5}
                    className='px-6 py-8 text-center text-[color:var(--text-tertiary)]'
                  >
                    Belum ada data kunjungan yang tercatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WebsiteStatistics;
