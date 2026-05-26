import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaGraduationCap,
  FaBriefcase,
  FaUniversity,
  FaUsers,
  FaCheckCircle,
  FaInfoCircle,
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

const AlumniYearTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const count = data?.count || 0;
    const completed = data?.completedCount || 0;
    const incomplete = data?.incompleteCount || 0;
    const percentage = count > 0 ? ((completed / count) * 100).toFixed(0) : '0';

    return (
      <div className='bg-[color:var(--bg-card)] border border-[color:var(--border-color)] p-4 rounded-xl shadow-lg text-sm max-w-xs'>
        <p className='font-bold text-[color:var(--text-primary)] mb-2 flex items-center gap-1.5'>
          <span className='w-2 h-2 rounded-full bg-blue-500'></span>
          Tahun Lulus {label}
        </p>
        <div className='space-y-1.5'>
          <div className='flex justify-between gap-8 text-[color:var(--text-secondary)]'>
            <span>Total Alumni:</span>
            <span className='font-bold text-[color:var(--text-primary)]'>{count} orang</span>
          </div>
          <div className='flex justify-between gap-8 text-emerald-500'>
            <span>Data Lengkap:</span>
            <span className='font-bold'>{completed} orang</span>
          </div>
          <div className='flex justify-between gap-8 text-red-500'>
            <span>Belum Lengkap:</span>
            <span className='font-bold'>{incomplete} orang</span>
          </div>
          <div className='flex justify-between gap-8 text-blue-500 border-t border-[color:var(--border-color)] pt-1.5 mt-1'>
            <span>Rasio Kelengkapan:</span>
            <span className='font-bold'>{percentage}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

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
  const BAR_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#14b8a6', '#f43f5e', '#a855f7',
    '#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'
  ];

  return (
    <div className='p-6 page-fade-in bg-[color:var(--bg-secondary)] min-h-screen'>
      <div className='mb-6'>
        <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
          Dashboard Monitoring Sekolah
        </h1>
        <p className='text-[color:var(--text-secondary)] text-sm md:text-base mt-1'>
          Pantau keterserapan alumni dan statistik siswa secara real-time.
        </p>
      </div>

      {/* Statistik Alumni */}
      <div className='mb-6'>
        <h3 className='text-lg font-bold text-[color:var(--text-primary)] mb-3 flex items-center gap-2'>
          <span className='w-1 h-5 bg-blue-500 rounded-full'></span>
          Statistik Alumni
        </h3>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
          {/* Total Alumni */}
          <div className='bg-[color:var(--bg-card)] p-5 rounded-2xl border border-[color:var(--border-color)] shadow-sm hover:-translate-y-1 transition-transform duration-300'>
            <div className='flex flex-col'>
              <div className='w-10 h-10 mb-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center'>
                <FaUsers size={20} />
              </div>
              <h3 className='text-3xl font-black text-[color:var(--text-primary)]'>{stats?.totalAlumni || 0}</h3>
              <p className='text-xs font-bold text-[color:var(--text-secondary)] tracking-wide uppercase mt-1'>Total Alumni</p>
            </div>
          </div>

          {/* Alumni Lengkap */}
          <div className='bg-[color:var(--bg-card)] p-5 rounded-2xl border border-[color:var(--border-color)] shadow-sm hover:-translate-y-1 transition-transform duration-300'>
            <div className='flex flex-col'>
              <div className='w-10 h-10 mb-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center'>
                <FaCheckCircle size={20} />
              </div>
              <div className='flex items-baseline gap-2'>
                <h3 className='text-3xl font-black text-[color:var(--text-primary)]'>{stats?.completedAlumni || 0}</h3>
                {stats?.totalAlumni > 0 && (
                  <span className='text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md'>
                    {((stats.completedAlumni / stats.totalAlumni) * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <p className='text-xs font-bold text-[color:var(--text-secondary)] tracking-wide uppercase mt-1'>Alumni Data Lengkap</p>
            </div>
          </div>

          {/* Alumni Belum Lengkap */}
          <div className='bg-[color:var(--bg-card)] p-5 rounded-2xl border border-[color:var(--border-color)] shadow-sm hover:-translate-y-1 transition-transform duration-300'>
            <div className='flex flex-col'>
              <div className='w-10 h-10 mb-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center'>
                <FaCheckCircle size={20} />
              </div>
              <div className='flex items-baseline gap-2'>
                <h3 className='text-3xl font-black text-[color:var(--text-primary)]'>{stats?.incompleteAlumni || 0}</h3>
                {stats?.totalAlumni > 0 && (
                  <span className='text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-md'>
                    {((stats.incompleteAlumni / stats.totalAlumni) * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <p className='text-xs font-bold text-[color:var(--text-secondary)] tracking-wide uppercase mt-1 flex items-center gap-1.5'>
                Alumni Belum Lengkap
                <span className='relative inline-block group cursor-help'>
                  <FaInfoCircle className='text-gray-400 hover:text-blue-500 transition-colors duration-200' size={13} />
                  <span className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 dark:bg-gray-800 text-white text-[10px] font-normal py-1.5 px-3 rounded-lg shadow-xl w-48 normal-case border border-gray-700 z-50 text-center leading-normal'>
                    Admin akan secara berkala mengirimkan email pengingat untuk melengkapi data.
                  </span>
                </span>
              </p>
            </div>
          </div>

          {/* Bekerja */}
          <div className='bg-[color:var(--bg-card)] p-5 rounded-2xl border border-[color:var(--border-color)] shadow-sm hover:-translate-y-1 transition-transform duration-300'>
            <div className='flex flex-col'>
              <div className='w-10 h-10 mb-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center'>
                <FaBriefcase size={20} />
              </div>
              <h3 className='text-3xl font-black text-[color:var(--text-primary)]'>{stats?.workingAlumni || 0}</h3>
              <p className='text-xs font-bold text-[color:var(--text-secondary)] tracking-wide uppercase mt-1'>Bekerja</p>
            </div>
          </div>

          {/* Kuliah */}
          <div className='bg-[color:var(--bg-card)] p-5 rounded-2xl border border-[color:var(--border-color)] shadow-sm hover:-translate-y-1 transition-transform duration-300'>
            <div className='flex flex-col'>
              <div className='w-10 h-10 mb-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center'>
                <FaUniversity size={20} />
              </div>
              <h3 className='text-3xl font-black text-[color:var(--text-primary)]'>{stats?.studyingAlumni || 0}</h3>
              <p className='text-xs font-bold text-[color:var(--text-secondary)] tracking-wide uppercase mt-1'>Kuliah</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistik Siswa */}
      <div className='mb-8'>
        <h3 className='text-lg font-bold text-[color:var(--text-primary)] mb-3 flex items-center gap-2'>
          <span className='w-1 h-5 bg-indigo-500 rounded-full'></span>
          Statistik Siswa
        </h3>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          {/* Total Siswa */}
          <div className='bg-[color:var(--bg-card)] p-5 rounded-2xl border border-[color:var(--border-color)] shadow-sm hover:-translate-y-1 transition-transform duration-300'>
            <div className='flex flex-col'>
              <div className='w-10 h-10 mb-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center'>
                <FaGraduationCap size={20} />
              </div>
              <h3 className='text-3xl font-black text-[color:var(--text-primary)]'>{stats?.totalStudents || 0}</h3>
              <p className='text-xs font-bold text-[color:var(--text-secondary)] tracking-wide uppercase mt-1'>Total Siswa</p>
            </div>
          </div>

          {/* Siswa Lengkap */}
          <div className='bg-[color:var(--bg-card)] p-5 rounded-2xl border border-[color:var(--border-color)] shadow-sm hover:-translate-y-1 transition-transform duration-300'>
            <div className='flex flex-col'>
              <div className='w-10 h-10 mb-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center'>
                <FaCheckCircle size={20} />
              </div>
              <div className='flex items-baseline gap-2'>
                <h3 className='text-3xl font-black text-[color:var(--text-primary)]'>{stats?.completedStudents || 0}</h3>
                {stats?.totalStudents > 0 && (
                  <span className='text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md'>
                    {((stats.completedStudents / stats.totalStudents) * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <p className='text-xs font-bold text-[color:var(--text-secondary)] tracking-wide uppercase mt-1'>Siswa Data Lengkap</p>
            </div>
          </div>

          {/* Siswa Belum Lengkap */}
          <div className='bg-[color:var(--bg-card)] p-5 rounded-2xl border border-[color:var(--border-color)] shadow-sm hover:-translate-y-1 transition-transform duration-300'>
            <div className='flex flex-col'>
              <div className='w-10 h-10 mb-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center'>
                <FaCheckCircle size={20} />
              </div>
              <div className='flex items-baseline gap-2'>
                <h3 className='text-3xl font-black text-[color:var(--text-primary)]'>{stats?.incompleteStudents || 0}</h3>
                {stats?.totalStudents > 0 && (
                  <span className='text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-md'>
                    {((stats.incompleteStudents / stats.totalStudents) * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <p className='text-xs font-bold text-[color:var(--text-secondary)] tracking-wide uppercase mt-1 flex items-center gap-1.5'>
                Siswa Belum Lengkap
                <span className='relative inline-block group cursor-help'>
                  <FaInfoCircle className='text-gray-400 hover:text-blue-500 transition-colors duration-200' size={13} />
                  <span className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 dark:bg-gray-800 text-white text-[10px] font-normal py-1.5 px-3 rounded-lg shadow-xl w-48 normal-case border border-gray-700 z-50 text-center leading-normal'>
                    Admin akan secara berkala mengirimkan email pengingat untuk melengkapi data.
                  </span>
                </span>
              </p>
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

        {/* Statistik Data Tahun Lulus Alumni Chart */}
        <div className='bg-[color:var(--bg-card)] p-8 rounded-2xl border border-[color:var(--border-color)] shadow-md'>
          <div className='flex items-center justify-between mb-8'>
            <div className='flex items-center gap-3'>
              <div className='w-1.5 h-6 bg-blue-500 rounded-full'></div>
              <h2 className='text-xl font-bold text-[color:var(--text-primary)]'>Statistik Data Tahun Lulus Alumni</h2>
            </div>
            {stats?.alumniByYear?.length > 0 && (
              <span className='px-3 py-1 text-xs font-bold text-blue-600 bg-blue-500/10 rounded-full'>
                {stats.alumniByYear.length} Tahun Terdata
              </span>
            )}
          </div>
          <div className='h-[400px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={stats?.alumniByYear} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='var(--border-color)' opacity={0.3} />
                <XAxis dataKey='_id' fontSize={11} stroke='var(--text-secondary)' tickLine={false} />
                <YAxis fontSize={11} stroke='var(--text-secondary)' tickLine={false} />
                <Tooltip content={<AlumniYearTooltip />} />
                <Bar
                  dataKey='count'
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                  label={{ position: 'top', fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 'bold' }}
                >
                  {stats?.alumniByYear?.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
        {/* Top Universities Chart */}
        <div className='bg-[color:var(--bg-card)] p-8 rounded-2xl border border-[color:var(--border-color)] shadow-md'>
          <div className='flex items-center gap-3 mb-8'>
            <div className='w-1.5 h-6 bg-green-500 rounded-full'></div>
            <h2 className='text-xl font-bold text-[color:var(--text-primary)]'>Penempatan Kampus Terbanyak</h2>
          </div>
          <div className='h-[450px] w-full'>
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
      </div>

      {/* Grad Year Distribution (Alumni & Students) - Styled like AlumniDataProgress */}
      <div className='bg-[color:var(--bg-card)] p-8 rounded-2xl border border-[color:var(--border-color)] shadow-md flex flex-col mb-8'>
        <div className='flex items-center gap-3 mb-8'>
          <div className='w-1.5 h-6 bg-amber-500 rounded-full'></div>
          <h2 className='text-xl font-bold text-[color:var(--text-primary)]'>Statistik Per Angkatan</h2>
        </div>

        <div className='flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-6 max-h-[450px]'>

          {/* Students Sections */}
          <div className='pt-2'>
            <div className='flex items-center gap-2 mb-4'>
              <span className='px-3 py-1 rounded-md bg-indigo-500/10 text-indigo-600 font-bold text-xs uppercase tracking-widest'>
                Siswa Aktif
              </span>
              <div className='h-[1px] flex-grow bg-[color:var(--border-color)]'></div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
              {stats?.studentsByYear?.slice().sort((a: any, b: any) => a._id - b._id).map((item: any) => {
                const maxStudents = Math.max(...(stats.studentsByYear.map((s: any) => s.count) || [1]));
                const width = `${(item.count / maxStudents) * 100}%`;

                return (
                  <div key={item._id} className='relative p-5 rounded-2xl bg-[color:var(--bg-tertiary)] hover:bg-[color:var(--bg-card)] transition-all duration-300 group overflow-hidden border border-[color:var(--border-color)] flex flex-col justify-between min-h-[120px] shadow-sm hover:shadow-md'>
                    <div className='absolute left-0 top-0 bottom-0 bg-indigo-500/5 transition-all group-hover:bg-indigo-500/10' style={{ width }}></div>
                    <div className='relative z-10 flex flex-col h-full justify-between gap-3'>
                      <div className='flex justify-between items-start'>
                        <div>
                          <p className='text-[10px] text-[color:var(--text-tertiary)] font-bold uppercase tracking-wider mb-0.5'>Angkatan</p>
                          <p className='text-2xl font-black text-[color:var(--text-primary)]'>{item._id}</p>
                        </div>
                        <div className='text-right bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20'>
                          <p className='text-base font-black text-indigo-500'>{item.count}</p>
                          <p className='text-[9px] text-indigo-400 font-bold uppercase tracking-wider'>Siswa</p>
                        </div>
                      </div>

                      {(item.completedCount > 0 || item.incompleteCount > 0) && (
                        <div className='flex flex-wrap gap-1.5 pt-2 border-t border-[color:var(--border-color)]/60'>
                          {item.completedCount > 0 && (
                            <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'>
                              Lengkap: {item.completedCount}
                            </span>
                          )}
                          {item.incompleteCount > 0 && (
                            <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20'>
                              Belum Lengkap: {item.incompleteCount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {stats?.studentsWithoutYear > 0 && (
                <div className='relative p-5 rounded-2xl bg-red-500/5 hover:bg-red-500/10 transition-all duration-300 group overflow-hidden border border-dashed border-red-500/30 flex flex-col justify-between min-h-[120px] shadow-sm'>
                  <div className='relative z-10 flex flex-col h-full justify-between gap-3'>
                    <div className='flex justify-between items-start'>
                      <div>
                        <p className='text-[10px] text-red-400 font-bold uppercase tracking-wider mb-0.5'>Tahun Masuk/Lulus</p>
                        <p className='text-lg font-black text-red-500 dark:text-red-400'>Tidak Diketahui</p>
                      </div>
                      <div className='text-right bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20'>
                        <p className='text-base font-black text-red-500'>{stats.studentsWithoutYear}</p>
                        <p className='text-[9px] text-red-400 font-bold uppercase tracking-wider'>Siswa</p>
                      </div>
                    </div>

                    <div className='flex flex-wrap gap-1.5 pt-2 border-t border-red-500/20'>
                      <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20'>
                        Belum Lengkap: {stats.studentsWithoutYear}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Alumni Sections */}
          <div>
            <div className='flex items-center gap-2 mb-4 mt-2'>
              <span className='px-3 py-1 rounded-md bg-blue-500/10 text-blue-600 font-bold text-xs uppercase tracking-widest'>
                Alumni Terdata
              </span>
              <div className='h-[1px] flex-grow bg-[color:var(--border-color)]'></div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
              {stats?.alumniByYear?.slice().sort((a: any, b: any) => b._id - a._id).map((item: any) => {
                const maxAlumni = Math.max(...(stats.alumniByYear.map((s: any) => s.count) || [1]));
                const width = `${(item.count / maxAlumni) * 100}%`;

                return (
                  <div key={item._id} className='relative p-5 rounded-2xl bg-[color:var(--bg-tertiary)] hover:bg-[color:var(--bg-card)] transition-all duration-300 group overflow-hidden border border-[color:var(--border-color)] flex flex-col justify-between min-h-[120px] shadow-sm hover:shadow-md'>
                    <div className='absolute left-0 top-0 bottom-0 bg-blue-500/5 transition-all group-hover:bg-blue-500/10' style={{ width }}></div>
                    <div className='relative z-10 flex flex-col h-full justify-between gap-3'>
                      <div className='flex justify-between items-start'>
                        <div>
                          <p className='text-[10px] text-[color:var(--text-tertiary)] font-bold uppercase tracking-wider mb-0.5'>Lulus Tahun</p>
                          <p className='text-2xl font-black text-[color:var(--text-primary)]'>{item._id}</p>
                        </div>
                        <div className='text-right bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20'>
                          <p className='text-base font-black text-blue-500'>{item.count}</p>
                          <p className='text-[9px] text-blue-400 font-bold uppercase tracking-wider'>Alumni</p>
                        </div>
                      </div>

                      {(item.completedCount > 0 || item.incompleteCount > 0) && (
                        <div className='flex flex-wrap gap-1.5 pt-2 border-t border-[color:var(--border-color)]/60'>
                          {item.completedCount > 0 && (
                            <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'>
                              Lengkap: {item.completedCount}
                            </span>
                          )}
                          {item.incompleteCount > 0 && (
                            <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20'>
                              Belum Lengkap: {item.incompleteCount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {stats?.alumniWithoutYear > 0 && (
                <div className='relative p-5 rounded-2xl bg-red-500/5 hover:bg-red-500/10 transition-all duration-300 group overflow-hidden border border-dashed border-red-500/30 flex flex-col justify-between min-h-[120px] shadow-sm'>
                  <div className='relative z-10 flex flex-col h-full justify-between gap-3'>
                    <div className='flex justify-between items-start'>
                      <div>
                        <p className='text-[10px] text-red-400 font-bold uppercase tracking-wider mb-0.5'>Tahun Masuk/Lulus</p>
                        <p className='text-lg font-black text-red-500 dark:text-red-400'>Tidak Diketahui</p>
                      </div>
                      <div className='text-right bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20'>
                        <p className='text-base font-black text-red-500'>{stats.alumniWithoutYear}</p>
                        <p className='text-[9px] text-red-400 font-bold uppercase tracking-wider'>Alumni</p>
                      </div>
                    </div>

                    <div className='flex flex-wrap gap-1.5 pt-2 border-t border-red-500/20'>
                      <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20'>
                        Belum Lengkap: {stats.alumniWithoutYear}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Information Box */}
      <div className='mb-8 p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl'>
        <div className='flex gap-4'>
          <div className='text-blue-500 mt-1'>
            <FaUniversity size={24} />
          </div>
          <div>
            <h4 className='font-bold text-blue-900 dark:text-blue-300'>Catatan Monitoring</h4>
            <p className='text-xs md:text-sm text-blue-800 dark:text-blue-400 mt-1'>
              Data yang disajikan adalah data real-time berdasarkan pengisian kuesioner oleh alumni dan siswa. <br />
              Sekolah dapat menyarankan siswa dan alumni untuk memperbarui data secara berkala untuk memastikan keakuratan laporan keterserapan tahunan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;
