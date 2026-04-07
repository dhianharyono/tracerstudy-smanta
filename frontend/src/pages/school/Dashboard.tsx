import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaGraduationCap,
  FaBriefcase,
  FaUniversity,
  FaUsers,
  FaCheckCircle,
} from 'react-icons/fa';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import SmartLoader from '@/components/SmartLoader';

const SchoolDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [univStats, setUnivStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [statsRes, univRes] = await Promise.all([
        axios.get('/api/school/stats'),
        axios.get('/api/school/analytics/universities'),
      ]);
      setStats(statsRes.data);
      setUnivStats(univRes.data);
    } catch (error) {
      console.error('Error fetching school stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <SmartLoader />;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6b7280'];

  return (
    <div className='p-6 page-fade-in bg-[color:var(--bg-secondary)] min-h-screen'>
      <div className='mb-8'>
        <div className='text-3xl font-bold text-[color:var(--text-primary)]'>
          Dashboard Monitoring Sekolah
        </div>
        <p className='text-[color:var(--text-secondary)]'>
          Pantau keterserapan alumni dan statistik siswa secara real-time.
        </p>
      </div>

      {/* Overview Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8'>
        <div className='bg-[color:var(--bg-card)] p-4 rounded-xl border border-[color:var(--border-color)] shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg'>
              <FaUsers size={20} />
            </div>
            <div>
              <p className='text-xs text-[color:var(--text-secondary)]'>Total Alumni</p>
              <h3 className='text-xl font-bold text-[color:var(--text-primary)]'>{stats?.totalAlumni}</h3>
            </div>
          </div>
        </div>

        <div className='bg-[color:var(--bg-card)] p-4 rounded-xl border border-[color:var(--border-color)] shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='p-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg'>
              <FaGraduationCap size={20} />
            </div>
            <div>
              <p className='text-xs text-[color:var(--text-secondary)]'>Total Siswa</p>
              <h3 className='text-xl font-bold text-[color:var(--text-primary)]'>{stats?.totalStudents}</h3>
            </div>
          </div>
        </div>

        <div className='bg-[color:var(--bg-card)] p-4 rounded-xl border border-[color:var(--border-color)] shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='p-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg'>
              <FaCheckCircle size={20} />
            </div>
            <div>
              <p className='text-xs text-[color:var(--text-secondary)]'>Data Terisi</p>
              <h3 className='text-xl font-bold text-[color:var(--text-primary)]'>
                {stats?.completedAlumni} <span className='text-xs font-normal text-[color:var(--text-tertiary)]'>({((stats.completedAlumni / (stats.totalAlumni || 1)) * 100).toFixed(0)}%)</span>
              </h3>
            </div>
          </div>
        </div>

        <div className='bg-[color:var(--bg-card)] p-4 rounded-xl border border-[color:var(--border-color)] shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='p-2.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg'>
              <FaBriefcase size={20} />
            </div>
            <div>
              <p className='text-xs text-[color:var(--text-secondary)]'>Bekerja</p>
              <h3 className='text-xl font-bold text-[color:var(--text-primary)]'>
                {stats?.workingAlumni}
              </h3>
            </div>
          </div>
        </div>

        <div className='bg-[color:var(--bg-card)] p-4 rounded-xl border border-[color:var(--border-color)] shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='p-2.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg'>
              <FaUniversity size={20} />
            </div>
            <div>
              <p className='text-xs text-[color:var(--text-secondary)]'>Kuliah</p>
              <h3 className='text-xl font-bold text-[color:var(--text-primary)]'>
                {stats?.studyingAlumni}
              </h3>
            </div>
          </div>
        </div>
      </div>


      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
        {/* Status Distribution Chart */}
        <div className='bg-[color:var(--bg-card)] p-8 rounded-2xl border border-[color:var(--border-color)] shadow-md'>
          <div className='flex items-center gap-3 mb-8'>
            <div className='w-1.5 h-6 bg-blue-500 rounded-full'></div>
            <h2 className='text-xl font-bold text-[color:var(--text-primary)]'>Distribusi Status Alumni</h2>
          </div>
          <div className='h-[400px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={stats?.employmentChart}
                  cx='50%'
                  cy='50%'
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey='value'
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {stats?.employmentChart.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Legend
                  layout='horizontal'
                  align='center'
                  verticalAlign='bottom'
                  formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Universities Chart */}
        <div className='bg-[color:var(--bg-card)] p-8 rounded-2xl border border-[color:var(--border-color)] shadow-md'>
          <div className='flex items-center gap-3 mb-8'>
            <div className='w-1.5 h-6 bg-green-500 rounded-full'></div>
            <h2 className='text-xl font-bold text-[color:var(--text-primary)]'>Penempatan Kampus Terbanyak</h2>
          </div>
          <div className='h-[400px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={univStats.slice(0, 10)} layout='vertical' margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray='3 3' horizontal={false} stroke='var(--border-color)' opacity={0.3} />
                <XAxis type='number' fontSize={12} stroke='var(--text-secondary)' tick={{ fill: 'var(--text-secondary)' }} />
                <YAxis
                  dataKey='_id'
                  type='category'
                  width={150}
                  fontSize={10}
                  stroke='var(--text-secondary)'
                  tick={{ fill: 'var(--text-secondary)' }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey='count' fill='#3b82f6' radius={[0, 4, 4, 0]} barSize={20} name='Jumlah Alumni' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
        {/* Top Majors Chart */}
        <div className='bg-[color:var(--bg-card)] p-8 rounded-2xl border border-[color:var(--border-color)] shadow-md'>
          <div className='flex items-center gap-3 mb-8'>
            <div className='w-1.5 h-6 bg-purple-500 rounded-full'></div>
            <h2 className='text-xl font-bold text-[color:var(--text-primary)]'>Jurusan Terpopuler</h2>
          </div>
          <div className='h-[450px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={stats?.topMajors} layout='vertical' margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray='3 3' horizontal={false} stroke='var(--border-color)' opacity={0.3} />
                <XAxis type='number' fontSize={12} stroke='var(--text-secondary)' tick={{ fill: 'var(--text-secondary)' }} />
                <YAxis
                  dataKey='_id'
                  type='category'
                  width={150}
                  fontSize={10}
                  stroke='var(--text-secondary)'
                  tick={{ fill: 'var(--text-secondary)' }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey='count' fill='#8b5cf6' radius={[0, 4, 4, 0]} barSize={20} name='Jumlah' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grad Year Distribution (Alumni & Students) - Styled like AlumniDataProgress */}
        <div className='bg-[color:var(--bg-card)] p-8 rounded-2xl border border-[color:var(--border-color)] shadow-md flex flex-col'>
          <div className='flex items-center gap-3 mb-8'>
            <div className='w-1.5 h-6 bg-amber-500 rounded-full'></div>
            <h2 className='text-xl font-bold text-[color:var(--text-primary)]'>Statistik Per Angkatan</h2>
          </div>

          <div className='flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-6 max-h-[450px]'>

            {/* Students Sections */}
            <div>
              <div className='flex items-center gap-2 mb-4 mt-4'>
                <span className='text-[10px] items-center px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 font-bold uppercase tracking-widest'>
                  Siswa Aktif
                </span>
                <div className='h-[1px] flex-grow bg-[color:var(--border-color)] opacity-50'></div>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {stats?.studentsByYear?.slice().sort((a: any, b: any) => a._id - b._id).map((item: any) => (
                  <div key={item._id} className='p-3 rounded-xl bg-[color:var(--bg-tertiary)] border border-transparent hover:border-indigo-500 transition-all'>
                    <div className='flex justify-between items-center'>
                      <div>
                        <p className='text-[10px] text-[color:var(--text-tertiary)] font-bold uppercase'>Lulus Tahun</p>
                        <p className='text-sm font-black text-[color:var(--text-primary)]'>{item._id}</p>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm font-black text-indigo-500'>{item.count}</p>
                        <p className='text-[9px] text-[color:var(--text-tertiary)] font-bold uppercase'>Siswa</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Alumni Sections */}
            <div>
              <div className='flex items-center gap-2 mb-4'>
                <span className='text-[10px] items-center px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-bold uppercase tracking-widest'>
                  Alumni
                </span>
                <div className='h-[1px] flex-grow bg-[color:var(--border-color)] opacity-50'></div>
              </div>
              <div className='grid grid-cols-1 gap-3'>
                {stats?.alumniByYear?.slice().sort((a: any, b: any) => b._id - a._id).map((item: any) => (
                  <div key={item._id} className='p-3 rounded-xl bg-[color:var(--bg-tertiary)] border border-transparent hover:border-[var(--primary)] transition-all'>
                    <div className='flex justify-between items-center'>
                      <div>
                        <p className='text-[10px] text-[color:var(--text-tertiary)] font-bold uppercase'>Angkatan</p>
                        <p className='text-sm font-black text-[color:var(--text-primary)]'>{item._id}</p>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm font-black text-[var(--primary)]'>{item.count}</p>
                        <p className='text-[9px] text-[color:var(--text-tertiary)] font-bold uppercase'>Alumni</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information Box */}
      <div className='mt-8 p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl'>
        <div className='flex gap-4'>
          <div className='text-blue-500 mt-1'>
            <FaUniversity size={24} />
          </div>
          <div>
            <h4 className='font-bold text-blue-900 dark:text-blue-300'>Catatan Monitoring</h4>
            <p className='text-sm text-blue-800 dark:text-blue-400 mt-1'>
              Data yang disajikan di atas adalah data real-time berdasarkan pengisian kuesioner oleh alumni.
              Sekolah dapat menyarankan siswa dan alumni untuk memperbarui data secara berkala untuk memastikan keakuratan laporan keterserapan tahunan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;
