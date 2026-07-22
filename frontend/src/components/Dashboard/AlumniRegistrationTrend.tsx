import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { FaUserPlus, FaChartLine, FaCalendarAlt } from 'react-icons/fa';

interface TrendItem {
  date: string;
  count: number;
  cumulativeCount: number;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

const formatLabel = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    // YYYY-MM-DD
    const day = parseInt(parts[2], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;
    return `${day} ${MONTH_NAMES[monthIndex]}`;
  }
  if (parts.length === 2) {
    // YYYY-MM
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    return `${MONTH_NAMES[monthIndex]} ${year}`;
  }
  return dateStr;
};

const formatFullLabel = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    // YYYY-MM-DD
    const year = parts[0];
    const day = parseInt(parts[2], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;
    return `${day} ${MONTH_NAMES[monthIndex]} ${year}`;
  }
  if (parts.length === 2) {
    // YYYY-MM
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    return `${MONTH_NAMES[monthIndex]} ${year}`;
  }
  return `Tahun ${dateStr}`;
};

const AlumniRegistrationTrend = () => {
  const [data, setData] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('last_12_months');
  const [role, setRole] = useState<'alumni' | 'student' | 'all'>('alumni');
  const [viewMode, setViewMode] = useState<'new' | 'cumulative'>('new');

  useEffect(() => {
    fetchTrendData();
  }, [range, role]);

  const fetchTrendData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/registration-trend?range=${range}&role=${role}`);
      setData(res.data);
    } catch (error) {
      console.error('Failed to fetch registration trend:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalNewInPeriod = data.reduce((acc, curr) => acc + curr.count, 0);
  const latestCumulative = data.length > 0 ? data[data.length - 1].cumulativeCount : 0;
  const peakItem = data.reduce(
    (max, item) => (item.count > max.count ? item : max),
    { count: 0, date: '', cumulativeCount: 0 }
  );

  const roleLabel = role === 'alumni' ? 'Alumni' : role === 'student' ? 'Siswa' : 'Pengguna';

  return (
    <div className='card h-full flex flex-col'>
      {/* Header section */}
      <div className='flex flex-wrap gap-4 items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <div className='p-2.5 bg-blue-500/10 rounded-xl text-blue-600'>
            <FaUserPlus className='text-xl' />
          </div>
          <div>
            <h2 className='text-lg md:text-xl text-[color:var(--text-primary)] font-bold m-0'>
              Tren Registrasi {roleLabel}
            </h2>
            <p className='text-xs md:text-sm text-[color:var(--text-secondary)] m-0'>
              Analisis grafik pendaftaran {roleLabel.toLowerCase()} berdasarkan tanggal dibuat
            </p>
          </div>
        </div>

        {/* Filter controls */}
        <div className='flex flex-wrap items-center gap-2'>
          {/* Role Filter Tabs */}
          <div className='inline-flex p-1 bg-[color:var(--bg-tertiary)] rounded-xl border border-[color:var(--border-color)]'>
            <button
              onClick={() => setRole('alumni')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                role === 'alumni'
                  ? 'bg-[color:var(--bg-card)] text-blue-600 shadow-sm'
                  : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'
              }`}
            >
              Alumni
            </button>
            <button
              onClick={() => setRole('student')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                role === 'student'
                  ? 'bg-[color:var(--bg-card)] text-emerald-600 shadow-sm'
                  : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'
              }`}
            >
              Siswa
            </button>
            <button
              onClick={() => setRole('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                role === 'all'
                  ? 'bg-[color:var(--bg-card)] text-purple-600 shadow-sm'
                  : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'
              }`}
            >
              Semua
            </button>
          </div>

          {/* Toggle View Mode */}
          <div className='inline-flex p-1 bg-[color:var(--bg-tertiary)] rounded-xl border border-[color:var(--border-color)]'>
            <button
              onClick={() => setViewMode('new')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'new'
                  ? 'bg-[color:var(--bg-card)] text-blue-600 shadow-sm'
                  : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'
              }`}
            >
              Pendaftar Baru
            </button>
            <button
              onClick={() => setViewMode('cumulative')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'cumulative'
                  ? 'bg-[color:var(--bg-card)] text-indigo-600 shadow-sm'
                  : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'
              }`}
            >
              Akumulatif
            </button>
          </div>

          {/* Select Range */}
          <div className='flex items-center gap-1.5 px-3 py-1.5 bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)] rounded-xl text-xs font-medium text-[color:var(--text-primary)]'>
            <FaCalendarAlt className='text-[color:var(--text-tertiary)]' />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className='bg-transparent border-none outline-none cursor-pointer font-semibold text-[color:var(--text-primary)]'
            >
              <option value='last_7_days'>7 Hari Terakhir</option>
              <option value='last_30_days'>30 Hari Terakhir</option>
              <option value='last_12_months'>12 Bulan Terakhir</option>
              <option value='last_5_years'>5 Tahun Terakhir</option>
              <option value='all'>Semua Waktu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Summary Badge Bar */}
      <div className='grid grid-cols-2 sm:grid-cols-2 gap-3 mb-6'>
        <div className='p-3.5 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-center justify-between'>
          <div>
            <p className='text-xs font-medium text-[color:var(--text-tertiary)] uppercase tracking-wider mb-0.5'>
              Pendaftar Baru (Periode Ini)
            </p>
            <p className='text-xl font-black text-blue-600 m-0'>
              {totalNewInPeriod.toLocaleString('id-ID')} <span className='text-xs font-normal text-blue-600/70'>{roleLabel}</span>
            </p>
          </div>
          <div className='p-2 bg-blue-500/10 rounded-lg text-blue-600'>
            <FaUserPlus />
          </div>
        </div>

        <div className='p-3.5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex items-center justify-between'>
          <div>
            <p className='text-xs font-medium text-[color:var(--text-tertiary)] uppercase tracking-wider mb-0.5'>
              {viewMode === 'new' ? 'Puncak Registrasi' : 'Total Akumulasi Terdaftar'}
            </p>
            <p className='text-xl font-black text-indigo-600 m-0'>
              {viewMode === 'new' ? (
                <>
                  {peakItem.count.toLocaleString('id-ID')}{' '}
                  <span className='text-xs font-normal text-indigo-600/70'>
                    {roleLabel} ({formatLabel(peakItem.date) || '-'})
                  </span>
                </>
              ) : (
                <>
                  {latestCumulative.toLocaleString('id-ID')}{' '}
                  <span className='text-xs font-normal text-indigo-600/70'>{roleLabel}</span>
                </>
              )}
            </p>
          </div>
          <div className='p-2 bg-indigo-500/10 rounded-lg text-indigo-600'>
            <FaChartLine />
          </div>
        </div>
      </div>

      {/* Chart container */}
      {loading ? (
        <div className='flex-grow h-[320px] flex items-center justify-center'>
          <p className='text-sm text-[color:var(--text-tertiary)] animate-pulse'>Memuat data tren registrasi...</p>
        </div>
      ) : data.length === 0 ? (
        <div className='flex-grow h-[320px] flex items-center justify-center'>
          <p className='text-sm text-[color:var(--text-tertiary)]'>Tidak ada data registrasi pada periode ini.</p>
        </div>
      ) : (
        <div className='chart-container w-full flex-grow h-[320px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart
              data={data}
              margin={{ top: 15, right: 20, left: -10, bottom: 10 }}
            >
              <defs>
                <linearGradient id='colorNewSignups' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.4} />
                  <stop offset='95%' stopColor='#3b82f6' stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id='colorCumulative' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#6366f1' stopOpacity={0.4} />
                  <stop offset='95%' stopColor='#6366f1' stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray='3 3'
                vertical={false}
                stroke='rgba(148, 163, 184, 0.15)'
              />
              <XAxis
                dataKey='date'
                tickFormatter={formatLabel}
                stroke='var(--text-tertiary)'
                tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                dy={8}
              />
              <YAxis
                stroke='var(--text-tertiary)'
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-xl)',
                  color: 'var(--text-primary)',
                  padding: '12px',
                }}
                labelFormatter={formatFullLabel}
                formatter={(value: number) => [
                  `${value.toLocaleString('id-ID')} ${roleLabel}`,
                  viewMode === 'new' ? 'Pendaftar Baru' : 'Total Terdaftar'
                ]}
              />
              {viewMode === 'new' ? (
                <Area
                  type='monotone'
                  dataKey='count'
                  stroke='#3b82f6'
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill='url(#colorNewSignups)'
                  activeDot={{ r: 6, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                />
              ) : (
                <Area
                  type='monotone'
                  dataKey='cumulativeCount'
                  stroke='#6366f1'
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill='url(#colorCumulative)'
                  activeDot={{ r: 6, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AlumniRegistrationTrend;
