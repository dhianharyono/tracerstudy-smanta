import {
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { FaChartBar } from 'react-icons/fa';
import { COLORS } from '@/pages/constant';

interface YearStat {
  _id: string;
  count: number;
}

interface TahunLulusProps {
  data: {
    yearStats: YearStat[];
  };
  chartWidth: number;
}

const TahunLulus = ({ data }: TahunLulusProps) => {
  const yearStats = data?.yearStats || [];
  const hasData = yearStats.length > 0;

  // Sort by year to ensure correct sequence
  const sortedData = [...yearStats].sort((a, b) => parseInt(a._id) - parseInt(b._id));

  return (
    <div className='card h-full flex flex-col'>
      <div className='flex flex-wrap gap-2 items-center justify-between mb-8'>
        <div className='text-lg md:text-xl flex items-center gap-3 text-text-primary font-bold'>
          <div className='p-2 bg-indigo-500/10 rounded-lg'>
            <FaChartBar className='text-indigo-500' />
          </div>
          <span>Statistik Data Tahun Lulus Alumni</span>
        </div>
        {hasData && (
          <span className='px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200/50'>
            {sortedData.length} Tahun Terdata
          </span>
        )}
      </div>

      {!hasData ? (
        <div className='flex-grow flex items-center justify-center'>
          <div className='text-center'>
            <p className='text-gray-500 py-10'>Belum ada data tersedia</p>
          </div>
        </div>
      ) : (
        <div className='chart-container w-full flex-grow h-[400px]'>
          <div className='w-full h-full'>
            <ResponsiveContainer width='100%' height="100%">
              <BarChart
                data={sortedData}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                barSize={45}
              >
                <CartesianGrid
                  strokeDasharray='3 3'
                  vertical={false}
                  stroke='rgba(148, 163, 184, 0.1)'
                />
                <XAxis
                  dataKey='_id'
                  stroke='var(--text-tertiary)'
                  tick={{ fill: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  stroke='var(--text-tertiary)'
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-xl)',
                    color: 'var(--text-primary)',
                    padding: '12px',
                  }}
                  itemStyle={{ fontWeight: '800', color: '#4f46e5' }}
                  labelStyle={{ marginBottom: '4px', fontWeight: 'bold', color: 'var(--indigo-500)' }}
                  formatter={(value: number) => [`${value} Alumni`, 'Jumlah']}
                  labelFormatter={(value) => `Angkatan Tahun ${value}`}
                />
                <Bar
                  dataKey='count'
                  radius={[8, 8, 4, 4]}
                  label={{
                    position: 'top',
                    fill: 'var(--text-primary)',
                    fontSize: 14,
                    fontWeight: 'bold',
                    offset: 10,
                  }}
                >
                  {sortedData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {hasData && (
        <div className='mt-8 pt-8 border-t border-[color:var(--border-color)] flex justify-center gap-12'>
          <div className='text-center'>
            <p className='text-xs uppercase tracking-[0.2em] text-text-tertiary font-black mb-2'>Lulusan Terbaru</p>
            <p className='text-xl font-black text-indigo-500'>{sortedData[sortedData.length - 1]._id}</p>
          </div>
          <div className='text-center'>
            <p className='text-xs uppercase tracking-[0.2em] text-text-tertiary font-black mb-2'>Total Alumni</p>
            <p className='text-xl font-black text-indigo-500'>
              {sortedData.reduce((sum, item) => sum + item.count, 0)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TahunLulus;
