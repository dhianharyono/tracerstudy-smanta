import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { FaChartPie, FaChartBar, FaRegChartBar } from 'react-icons/fa';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#8dd1e1',
  '#a4de6c',
  '#d0ed57',
];

const EmptyState = ({ message, icon: Icon }: { message: string, icon: any }) => (
  <div className="h-full w-full flex flex-col items-center justify-center text-[var(--text-tertiary)] bg-[var(--bg-secondary)]/30 rounded-2xl border border-dashed border-[var(--border-color)]">
    <Icon className="text-3xl mb-2 opacity-50" />
    <p className="text-xs font-medium">{message}</p>
  </div>
);

const PlanStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/student/college-plans/stats');
      setStats(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className='animate-pulse h-96 bg-gray-100 rounded-xl'></div>;
  if (!stats) return null;

  // Check if there is any data at all to avoid showing empty cards if completely empty?
  // User asked to handle when data is empty on the card containing the graph.

  return (
    <div className='space-y-6'>
      <h3 className='text-sm md:text-lg font-bold text-[var(--text-primary)]'>
        Statistik Angkatan {stats.userGradYear ? stats.userGradYear : ''}
      </h3>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Top 10 Universities */}
        <div className='p-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-sm md:col-span-2 lg:col-span-1'>
          <h4 className='text-sm md:text-lg font-bold text-[var(--text-primary)] mb-4'>
            Top 10 Universitas Favorit
          </h4>
          <div className='h-[300px] md:h-[350px]'>
            {stats.topUniversities && stats.topUniversities.length > 0 ? (
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={stats.topUniversities}
                  layout='vertical'
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis type='number' hide />
                  <YAxis
                    dataKey='name'
                    type='category'
                    width={100}
                    tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      backgroundColor: 'var(--bg-card)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                  <Bar
                    dataKey='studentCount'
                    fill='var(--primary)'
                    name='Siswa'
                    radius={[0, 4, 4, 0]}
                    barSize={12}
                  />
                  <Bar
                    dataKey='alumniCount'
                    fill='#F59E0B'
                    name='Alumni'
                    radius={[0, 4, 4, 0]}
                    barSize={12}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Belum ada data universitas" icon={FaChartBar} />
            )}
          </div>
        </div>

        {/* Major Distribution */}
        <div className='p-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-sm md:col-span-2 lg:col-span-1'>
          <h4 className='text-sm md:text-lg font-bold text-[var(--text-primary)] mb-4'>
            Distribusi Jurusan
          </h4>
          <div className='h-[300px] md:h-[350px]'>
            {stats.majorDistribution && stats.majorDistribution.length > 0 ? (
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={stats.majorDistribution}
                    cx='50%'
                    cy='40%' // Move chart up slightly to make room for legend
                    innerRadius={60}
                    outerRadius={80}
                    fill='#8884d8'
                    paddingAngle={5}
                    dataKey='count'
                    nameKey='_id'
                  >
                    {stats.majorDistribution.map((_: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      backgroundColor: 'var(--bg-card)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    layout='horizontal'
                    verticalAlign='bottom'
                    align='center'
                    wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Belum ada data jurusan" icon={FaChartPie} />
            )}
          </div>
        </div>

        {/* Rumpun */}
        <div className='p-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-sm'>
          <h4 className='text-sm md:text-lg font-bold text-[var(--text-primary)] mb-4'>
            Distribusi Rumpun
          </h4>
          <div className='h-[250px]'>
            {stats.rumpunStats && stats.rumpunStats.length > 0 ? (
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={stats.rumpunStats}
                    cx='50%'
                    cy='50%'
                    outerRadius={70}
                    fill='#8884d8'
                    dataKey='count'
                    nameKey='_id'
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      percent,
                    }) => {
                      const RADIAN = Math.PI / 180;
                      const radius =
                        innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text
                          x={x}
                          y={y}
                          fill='white'
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline='central'
                          fontSize={10}
                          fontWeight='bold'
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                    labelLine={false}
                  >
                    {stats.rumpunStats.map((_: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      backgroundColor: 'var(--bg-card)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    layout='horizontal'
                    verticalAlign='bottom'
                    align='center'
                    wrapperStyle={{ fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Belum ada data rumpun" icon={FaChartPie} />
            )}
          </div>
        </div>

        {/* Entry Path */}
        <div className='p-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-sm'>
          <h4 className='text-sm md:text-lg font-bold text-[var(--text-primary)] mb-4'>
            Jalur Masuk Breakdown
          </h4>
          <div className='h-[250px]'>
            {stats.entryPathStats && stats.entryPathStats.length > 0 ? (
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={stats.entryPathStats}
                    cx='50%'
                    cy='50%'
                    innerRadius={40}
                    outerRadius={70}
                    fill='#82ca9d'
                    dataKey='count'
                    nameKey='_id'
                  >
                    {stats.entryPathStats.map((_: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      backgroundColor: 'var(--bg-card)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    layout='horizontal'
                    verticalAlign='bottom'
                    align='center'
                    wrapperStyle={{ fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Belum ada data jalur masuk" icon={FaRegChartBar} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanStats;
