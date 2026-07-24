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
            <span className='font-bold text-[color:var(--text-primary)]'>
              {count} orang
            </span>
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

const UniversityTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const name = data?._id || 'Unknown';
    const count = data?.count || 0;
    const type = data?.type || '';

    const formattedType =
      type === 'negeri'
        ? 'Negeri'
        : type === 'swasta'
          ? 'Swasta'
          : type === 'kedinasan'
            ? 'Kedinasan'
            : '-';

    return (
      <div className='bg-[color:var(--bg-card)] border border-[color:var(--border-color)] p-4 rounded-xl shadow-lg text-sm max-w-xs'>
        <p className='font-bold text-[color:var(--text-primary)] mb-2 flex items-center gap-1.5'>
          <span className='w-2 h-2 rounded-full bg-blue-500'></span>
          {name}
        </p>
        <div className='space-y-1.5'>
          <div className='flex justify-between gap-8 text-[color:var(--text-secondary)]'>
            <span>Tipe Perguruan Tinggi:</span>
            <span className='font-bold text-[color:var(--text-primary)]'>
              {formattedType}
            </span>
          </div>
          <div className='flex justify-between gap-8 text-blue-500 border-t border-[color:var(--border-color)] pt-1.5 mt-1'>
            <span>Total Alumni:</span>
            <span className='font-bold'>{count} orang</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const MajorTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const name = data?._id || 'Unknown';
    const count = data?.count || 0;

    return (
      <div className='bg-[color:var(--bg-card)] border border-[color:var(--border-color)] p-4 rounded-xl shadow-lg text-sm max-w-xs'>
        <p className='font-bold text-[color:var(--text-primary)] mb-2 flex items-center gap-1.5'>
          <span className='w-2 h-2 rounded-full bg-purple-500'></span>
          {name}
        </p>
        <div className='space-y-1.5'>
          <div className='flex justify-between gap-8 text-purple-500 border-t border-[color:var(--border-color)] pt-1.5 mt-1'>
            <span>Total Alumni:</span>
            <span className='font-bold'>{count} orang</span>
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
  const [angkatanTab, setAngkatanTab] = useState<'alumni' | 'student'>('alumni');

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
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#14b8a6',
    '#f43f5e',
    '#a855f7',
    '#6366f1',
    '#10b981',
    '#f59e0b',
    '#3b82f6',
    '#8b5cf6',
  ];

  return (
    <div className='p-6 page-fade-in bg-[color:var(--bg-secondary)] min-h-screen'>
      <div className='mb-6 '>
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
              <div className='w-10 h-10 mb-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl flex items-center justify-center'>
                <FaUsers size={20} />
              </div>
              <h3 className='text-3xl font-bold text-[color:var(--text-primary)]'>
                {stats?.totalAlumni || 0}
              </h3>
              <p className='text-xs font-bold text-[color:var(--text-secondary)] tracking-wide uppercase mt-1'>
                Total Alumni
              </p>
            </div>
          </div>

          {/* Alumni Lengkap */}
          <div className='bg-[color:var(--bg-card)] p-5 rounded-2xl border border-[color:var(--border-color)] shadow-sm hover:-translate-y-1 transition-transform duration-300'>
            <div className='flex flex-col'>
              <div className='w-10 h-10 mb-3 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center'>
                <FaCheckCircle size={20} />
              </div>
              <div className='flex items-baseline gap-2'>
                <h3 className='text-3xl font-bold text-[color:var(--text-primary)]'>
                  {stats?.completedAlumni || 0}
                </h3>
                {stats?.totalAlumni > 0 && (
                  <span className='text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md'>
                    {(
                      (stats.completedAlumni / stats.totalAlumni) *
                      100
                    ).toFixed(0)}
                    %
                  </span>
                )}
              </div>
              <p className='text-xs font-bold text-[color:var(--text-secondary)] tracking-wide uppercase mt-1'>
                Alumni Data Lengkap
              </p>
            </div>
          </div>

          {/* Alumni Belum Lengkap */}
          <div className='bg-[color:var(--bg-card)] p-5 rounded-2xl border border-[color:var(--border-color)] shadow-sm hover:-translate-y-1 transition-transform duration-300'>
            <div className='flex flex-col'>
              <div className='w-10 h-10 mb-3 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center'>
                <FaCheckCircle size={20} />
              </div>
              <div className='flex items-baseline gap-2'>
                <h3 className='text-3xl font-bold text-[color:var(--text-primary)]'>
                  {stats?.incompleteAlumni || 0}
                </h3>
                {stats?.totalAlumni > 0 && (
                  <span className='text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-md'>
                    {(
                      (stats.incompleteAlumni / stats.totalAlumni) *
                      100
                    ).toFixed(0)}
                    %
                  </span>
                )}
              </div>
              <p className='text-xs font-bold text-[color:var(--text-secondary)] tracking-wide uppercase mt-1 flex items-center gap-1.5'>
                Alumni Belum Lengkap
                <span className='relative inline-block group cursor-help'>
                  <FaInfoCircle
                    className='text-gray-400 hover:text-blue-500 transition-colors duration-200'
                    size={13}
                  />
                  <span className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 dark:bg-gray-800 text-white text-[10px] font-normal py-1.5 px-3 rounded-lg shadow-xl w-48 normal-case border border-gray-700 z-50 text-center leading-normal'>
                    Admin akan secara berkala mengirimkan email pengingat untuk
                    melengkapi data.
                  </span>
                </span>
              </p>
            </div>
          </div>

          {/* Bekerja */}
          <div className='bg-[color:var(--bg-card)] p-5 rounded-2xl border border-[color:var(--border-color)] shadow-sm hover:-translate-y-1 transition-transform duration-300'>
            <div className='flex flex-col'>
              <div className='w-10 h-10 mb-3 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center'>
                <FaBriefcase size={20} />
              </div>
              <h3 className='text-3xl font-bold text-[color:var(--text-primary)]'>
                {stats?.workingAlumni || 0}
              </h3>
              <p className='text-xs font-bold text-[color:var(--text-secondary)] tracking-wide uppercase mt-1'>
                Bekerja
              </p>
            </div>
          </div>

          {/* Kuliah */}
          <div className='bg-[color:var(--bg-card)] p-5 rounded-2xl border border-[color:var(--border-color)] shadow-sm hover:-translate-y-1 transition-transform duration-300'>
            <div className='flex flex-col'>
              <div className='w-10 h-10 mb-3 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center'>
                <FaUniversity size={20} />
              </div>
              <h3 className='text-3xl font-bold text-[color:var(--text-primary)]'>
                {stats?.studyingAlumni || 0}
              </h3>
              <p className='text-xs font-bold text-[color:var(--text-secondary)] tracking-wide uppercase mt-1'>
                Kuliah
              </p>
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
              <div className='w-10 h-10 mb-3 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center'>
                <FaGraduationCap size={20} />
              </div>
              <h3 className='text-3xl font-bold text-[color:var(--text-primary)]'>
                {stats?.totalStudents || 0}
              </h3>
              <p className='text-xs font-bold text-[color:var(--text-secondary)] tracking-wide uppercase mt-1'>
                Total Siswa
              </p>
            </div>
          </div>

          {/* Siswa Lengkap */}
          <div className='bg-[color:var(--bg-card)] p-5 rounded-2xl border border-[color:var(--border-color)] shadow-sm hover:-translate-y-1 transition-transform duration-300'>
            <div className='flex flex-col'>
              <div className='w-10 h-10 mb-3 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center'>
                <FaCheckCircle size={20} />
              </div>
              <div className='flex items-baseline gap-2'>
                <h3 className='text-3xl font-bold text-[color:var(--text-primary)]'>
                  {stats?.completedStudents || 0}
                </h3>
                {stats?.totalStudents > 0 && (
                  <span className='text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md'>
                    {(
                      (stats.completedStudents / stats.totalStudents) *
                      100
                    ).toFixed(0)}
                    %
                  </span>
                )}
              </div>
              <p className='text-xs font-bold text-[color:var(--text-secondary)] tracking-wide uppercase mt-1'>
                Siswa Data Lengkap
              </p>
            </div>
          </div>

          {/* Siswa Belum Lengkap */}
          <div className='bg-[color:var(--bg-card)] p-5 rounded-2xl border border-[color:var(--border-color)] shadow-sm hover:-translate-y-1 transition-transform duration-300'>
            <div className='flex flex-col'>
              <div className='w-10 h-10 mb-3 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center'>
                <FaCheckCircle size={20} />
              </div>
              <div className='flex items-baseline gap-2'>
                <h3 className='text-3xl font-bold text-[color:var(--text-primary)]'>
                  {stats?.incompleteStudents || 0}
                </h3>
                {stats?.totalStudents > 0 && (
                  <span className='text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-md'>
                    {(
                      (stats.incompleteStudents / stats.totalStudents) *
                      100
                    ).toFixed(0)}
                    %
                  </span>
                )}
              </div>
              <p className='text-xs font-bold text-[color:var(--text-secondary)] tracking-wide uppercase mt-1 flex items-center gap-1.5'>
                Siswa Belum Lengkap
                <span className='relative inline-block group cursor-help'>
                  <FaInfoCircle
                    className='text-gray-400 hover:text-blue-500 transition-colors duration-200'
                    size={13}
                  />
                  <span className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 dark:bg-gray-800 text-white text-[10px] font-normal py-1.5 px-3 rounded-lg shadow-xl w-48 normal-case border border-gray-700 z-50 text-center leading-normal'>
                    Admin akan secara berkala mengirimkan email pengingat untuk
                    melengkapi data.
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
            <h2 className='text-xl font-bold text-[color:var(--text-primary)]'>
              Distribusi Status Alumni
            </h2>
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
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Legend
                  layout='horizontal'
                  align='center'
                  verticalAlign='bottom'
                  formatter={(value) => (
                    <span
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '12px',
                      }}
                    >
                      {value}
                    </span>
                  )}
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
              <h2 className='text-xl font-bold text-[color:var(--text-primary)]'>
                Statistik Data Tahun Lulus Alumni
              </h2>
            </div>
            {stats?.alumniByYear?.length > 0 && (
              <span className='px-3 py-1 text-xs font-bold text-blue-600 bg-blue-500/10 rounded-full'>
                {stats.alumniByYear.length} Tahun Terdata
              </span>
            )}
          </div>
          <div className='h-[400px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={stats?.alumniByYear}
                margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                barCategoryGap='25%'
              >
                <CartesianGrid
                  strokeDasharray='3 3'
                  vertical={false}
                  stroke='var(--border-color)'
                  opacity={0.3}
                />
                <XAxis
                  dataKey='_id'
                  fontSize={11}
                  stroke='var(--text-secondary)'
                  tickLine={false}
                />
                <YAxis
                  fontSize={11}
                  stroke='var(--text-secondary)'
                  tickLine={false}
                />
                <Tooltip content={<AlumniYearTooltip />} />
                <Bar
                  dataKey='count'
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                  label={{
                    position: 'top',
                    fill: 'var(--text-secondary)',
                    fontSize: 10,
                    fontWeight: 'bold',
                  }}
                >
                  {stats?.alumniByYear?.map((_entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={BAR_COLORS[index % BAR_COLORS.length]}
                    />
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
            <h2 className='text-xl font-bold text-[color:var(--text-primary)]'>
              Penempatan Kampus Terbanyak
            </h2>
          </div>
          <div className='h-[450px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={univStats.slice(0, 10)}
                layout='vertical'
                margin={{ left: 20 }}
                barCategoryGap='20%'
              >
                <CartesianGrid
                  strokeDasharray='3 3'
                  horizontal={false}
                  stroke='var(--border-color)'
                  opacity={0.3}
                />
                <XAxis
                  type='number'
                  fontSize={12}
                  stroke='var(--text-secondary)'
                  tick={{ fill: 'var(--text-secondary)' }}
                />
                <YAxis
                  dataKey='_id'
                  type='category'
                  width={150}
                  fontSize={10}
                  stroke='var(--text-secondary)'
                  tick={{ fill: 'var(--text-secondary)' }}
                />
                <Tooltip content={<UniversityTooltip />} />
                <Bar
                  dataKey='count'
                  fill='#3b82f6'
                  radius={[0, 4, 4, 0]}
                  maxBarSize={28}
                  name='Jumlah Alumni'
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Majors Chart */}
        <div className='bg-[color:var(--bg-card)] p-8 rounded-2xl border border-[color:var(--border-color)] shadow-md'>
          <div className='flex items-center gap-3 mb-8'>
            <div className='w-1.5 h-6 bg-purple-500 rounded-full'></div>
            <h2 className='text-xl font-bold text-[color:var(--text-primary)]'>
              Jurusan Terpopuler
            </h2>
          </div>
          <div className='h-[450px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={stats?.topMajors}
                layout='vertical'
                margin={{ left: 20 }}
                barCategoryGap='20%'
              >
                <CartesianGrid
                  strokeDasharray='3 3'
                  horizontal={false}
                  stroke='var(--border-color)'
                  opacity={0.3}
                />
                <XAxis
                  type='number'
                  fontSize={12}
                  stroke='var(--text-secondary)'
                  tick={{ fill: 'var(--text-secondary)' }}
                />
                <YAxis
                  dataKey='_id'
                  type='category'
                  width={150}
                  fontSize={10}
                  stroke='var(--text-secondary)'
                  tick={{ fill: 'var(--text-secondary)' }}
                />
                <Tooltip content={<MajorTooltip />} />
                <Bar
                  dataKey='count'
                  fill='#8b5cf6'
                  radius={[0, 4, 4, 0]}
                  maxBarSize={28}
                  name='Jumlah'
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Statistik Per Angkatan Section */}
      <div className='bg-[color:var(--bg-card)] p-8 rounded-2xl border border-[color:var(--border-color)] shadow-md flex flex-col mb-8'>
        <div className='flex items-center justify-between mb-6 flex-col sm:flex-row gap-4'>
          <div className='flex items-center gap-3'>
            <div className='w-1.5 h-6 bg-amber-500 rounded-full'></div>
            <h2 className='text-xl font-bold text-[color:var(--text-primary)]'>
              Statistik Per Angkatan
            </h2>
          </div>
          <div className='flex p-1 bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)] rounded-xl shrink-0'>
            <button
              onClick={() => setAngkatanTab('alumni')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${angkatanTab === 'alumni'
                ? 'bg-[var(--primary)] text-white shadow-md'
                : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'
                }`}
            >
              Alumni Terdata
            </button>
            <button
              onClick={() => setAngkatanTab('student')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${angkatanTab === 'student'
                ? 'bg-[var(--primary)] text-white shadow-md'
                : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'
                }`}
            >
              Siswa Aktif
            </button>
          </div>
        </div>

        <div className='overflow-x-auto max-h-[500px] overflow-y-auto rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] custom-scrollbar'>
          <table className='w-full text-left border-collapse text-sm'>
            <thead>
              <tr className='bg-[color:var(--bg-card)] border-b border-[color:var(--border-color)] text-[color:var(--text-secondary)] font-bold sticky top-0 z-10'>
                <th className='px-6 py-4 bg-[color:var(--bg-card)]'>
                  {angkatanTab === 'alumni' ? 'Tahun Lulus' : 'Angkatan'}
                </th>
                <th className='px-6 py-4 text-center bg-[color:var(--bg-card)]'>Total Terdaftar</th>
                <th className='px-6 py-4 text-center bg-[color:var(--bg-card)]'>Data Lengkap</th>
                <th className='px-6 py-4 text-center bg-[color:var(--bg-card)]'>Belum Lengkap</th>
                <th className='px-6 py-4 bg-[color:var(--bg-card)]'>Rasio Kelengkapan</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[color:var(--border-color)] text-[color:var(--text-primary)]'>
              {angkatanTab === 'alumni' ? (
                stats?.alumniByYear
                  ?.slice()
                  .sort((a: any, b: any) => b._id - a._id)
                  .map((item: any) => {
                    const percentage = item.count > 0 ? Math.round((item.completedCount / item.count) * 100) : 0;
                    const barColor = percentage >= 75 ? 'bg-emerald-500' : percentage >= 40 ? 'bg-amber-500' : 'bg-red-500';
                    const textColor = percentage >= 75 ? 'text-emerald-500' : percentage >= 40 ? 'text-amber-500' : 'text-red-500';

                    return (
                      <tr key={item._id} className='hover:bg-[color:var(--bg-card)] transition-colors duration-150'>
                        <td className='px-6 py-4 font-bold'>
                          Tahun Lulus {item._id}
                        </td>
                        <td className='px-6 py-4 text-center font-bold'>
                          {item.count} orang
                        </td>
                        <td className='px-6 py-4 text-center text-emerald-500 font-bold'>
                          {item.completedCount} orang
                        </td>
                        <td className='px-6 py-4 text-center text-red-500 font-semibold'>
                          {item.incompleteCount} orang
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-3'>
                            <div className='w-24 bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden shrink-0'>
                              <div
                                className={`${barColor} h-full rounded-full transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className={`font-bold text-xs ${textColor}`}>
                              {percentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              ) : (
                stats?.studentsByYear
                  ?.slice()
                  .sort((a: any, b: any) => a._id - b._id)
                  .map((item: any) => {
                    const percentage = item.count > 0 ? Math.round((item.completedCount / item.count) * 100) : 0;
                    const barColor = percentage >= 75 ? 'bg-indigo-500' : percentage >= 40 ? 'bg-amber-500' : 'bg-red-500';
                    const textColor = percentage >= 75 ? 'text-indigo-500' : percentage >= 40 ? 'text-amber-500' : 'text-red-500';

                    return (
                      <tr key={item._id} className='hover:bg-[color:var(--bg-card)] transition-colors duration-150'>
                        <td className='px-6 py-4 font-bold'>
                          Angkatan {item._id}
                        </td>
                        <td className='px-6 py-4 text-center font-bold'>
                          {item.count} orang
                        </td>
                        <td className='px-6 py-4 text-center text-emerald-500 font-bold'>
                          {item.completedCount} orang
                        </td>
                        <td className='px-6 py-4 text-center text-red-500 font-semibold'>
                          {item.incompleteCount} orang
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-3'>
                            <div className='w-24 bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden shrink-0'>
                              <div
                                className={`${barColor} h-full rounded-full transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className={`font-bold text-xs ${textColor}`}>
                              {percentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              )}

              {/* Unknown Year Handlers */}
              {angkatanTab === 'alumni' && stats?.alumniWithoutYear > 0 && (
                <tr className='bg-red-500/5 hover:bg-red-500/10 italic transition-colors duration-150'>
                  <td className='px-6 py-4 font-bold text-red-500 dark:text-red-400'>
                    Tahun Lulus Tidak Diketahui
                  </td>
                  <td className='px-6 py-4 text-center font-bold text-red-500 dark:text-red-400'>
                    {stats.alumniWithoutYear} orang
                  </td>
                  <td className='px-6 py-4 text-center text-emerald-500 font-bold'>
                    0 orang
                  </td>
                  <td className='px-6 py-4 text-center text-red-500 font-bold'>
                    {stats.alumniWithoutYear} orang
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-24 bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden shrink-0'>
                        <div
                          className='bg-red-500 h-full rounded-full'
                          style={{ width: '0%' }}
                        ></div>
                      </div>
                      <span className='font-bold text-xs text-red-500'>
                        0%
                      </span>
                    </div>
                  </td>
                </tr>
              )}

              {angkatanTab === 'student' && stats?.studentsWithoutYear > 0 && (
                <tr className='bg-red-500/5 hover:bg-red-500/10 italic transition-colors duration-150'>
                  <td className='px-6 py-4 font-bold text-red-500 dark:text-red-400'>
                    Angkatan Tidak Diketahui
                  </td>
                  <td className='px-6 py-4 text-center font-bold text-red-500 dark:text-red-400'>
                    {stats.studentsWithoutYear} orang
                  </td>
                  <td className='px-6 py-4 text-center text-emerald-500 font-bold'>
                    0 orang
                  </td>
                  <td className='px-6 py-4 text-center text-red-500 font-bold'>
                    {stats.studentsWithoutYear} orang
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-24 bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden shrink-0'>
                        <div
                          className='bg-red-500 h-full rounded-full'
                          style={{ width: '0%' }}
                        ></div>
                      </div>
                      <span className='font-bold text-xs text-red-500'>
                        0%
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Information Box */}
      <div className='mb-8 p-6 bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-2xl'>
        <div className='flex gap-4'>
          <div className='text-[var(--primary)] mt-1 shrink-0'>
            <FaUniversity size={24} />
          </div>
          <div>
            <h4 className='font-bold text-[color:var(--text-primary)]'>
              Catatan Monitoring
            </h4>
            <p className='text-xs md:text-sm text-[color:var(--text-secondary)] mt-1'>
              Data yang disajikan adalah data real-time berdasarkan pengisian
              kuesioner oleh alumni dan siswa. <br />
              Sekolah dapat menyarankan siswa dan alumni untuk memperbarui data
              secara berkala untuk memastikan keakuratan laporan keterserapan
              tahunan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;
