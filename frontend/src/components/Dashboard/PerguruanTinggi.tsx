import { FaUniversity, FaInfoCircle } from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface UniversityDataType {
  name: string;
  value: number;
}

interface PerguruanTinggiProps {
  data: UniversityDataType[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b']; // Indigo, Emerald, Amber

const PerguruanTinggi = ({ data }: PerguruanTinggiProps) => {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const hasData = data.length > 0 && totalValue > 0;

  const displayData = hasData
    ? data
    : [
        { name: 'PTN', value: 0 },
        { name: 'PTS', value: 0 },
        { name: 'Kedinasan', value: 0 },
      ];

  const typeConfig: Record<
    string,
    { label: string; description: string; color: string; bgColor: string }
  > = {
    PTN: {
      label: 'Perguruan Tinggi Negeri',
      description:
        'Kampus milik pemerintah dengan seleksi nasional (SNBP/SNBT).',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
    PTS: {
      label: 'Perguruan Tinggi Swasta',
      description:
        'Institusi pendidikan mandiri dengan beragam spesialisasi jurusan.',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    Kedinasan: {
      label: 'Sekolah Kedinasan',
      description:
        'Lembaga pendidikan di bawah naungan kementerian/lembaga negara.',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  };

  return (
    <div className='card h-full flex flex-col overflow-hidden group'>
      {/* Header */}
      <div className='flex flex-wrap gap-2 items-center justify-between mb-8'>
        <div className='text-lg md:text-xl flex items-center gap-3 text-text-primary font-bold !mb-0'>
          <div className='p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300'>
            <FaUniversity className='text-blue-500' />
          </div>
          <span>Jalur Studi Alumni</span>
        </div>
        <div className='flex items-center gap-1.5 px-3 py-1 bg-[color:var(--bg-tertiary)] rounded-full border border-[color:var(--border-color)]'>
          <div className='w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse'></div>
          <span className='text-[10px] font-bold text-text-secondary uppercase tracking-wider'>
            Live Stats
          </span>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-y-auto custom-scrollbar pr-1'>
        {/* Chart Section */}
        <div className='lg:col-span-2 relative min-h-[200px]'>
          {hasData ? (
            <>
              <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10'>
                <span className='text-[10px] font-bold text-text-tertiary uppercase tracking-widest'>
                  TOTAL
                </span>
                <span className='text-3xl font-bold text-text-primary -mt-1'>
                  {totalValue}
                </span>
                <span className='text-[10px] font-bold text-text-tertiary uppercase tracking-wider'>
                  Alumni
                </span>
              </div>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={displayData}
                    cx='50%'
                    cy='50%'
                    innerRadius='65%'
                    outerRadius='85%'
                    paddingAngle={8}
                    dataKey='value'
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {displayData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    position={{ y: -5 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const { name, value } = payload[0];
                        return (
                          <div className='bg-white dark:bg-gray-900 px-4 py-3 rounded-2xl shadow-2xl border border-blue-500/30 animate-in zoom-in-95 duration-300'>
                            <p className='text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1'>
                              {name}
                            </p>
                            <p className='text-sm font-bold text-blue-500 text-center'>
                              {value} Alumni
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className='absolute inset-0 flex flex-col items-center justify-center text-text-tertiary'>
              <FaUniversity className='text-5xl opacity-10 mb-3' />
              <p className='text-xs font-bold uppercase tracking-widest'>
                No Data
              </p>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className='lg:col-span-3 flex flex-col justify-center gap-4'>
          <h3 className='text-xs font-bold text-text-tertiary uppercase tracking-[0.2em] mb-1 px-1'>
            Rincian Jalur & Kategori
          </h3>
          <div className='space-y-4'>
            {displayData.map((item, index) => {
              const percentage =
                totalValue > 0
                  ? Math.round((item.value / totalValue) * 100)
                  : 0;
              const config = typeConfig[item.name] || {
                label: item.name,
                description: '',
                color: 'text-gray-400',
                bgColor: 'bg-gray-400/10',
              };

              return (
                <div
                  key={index}
                  className='p-4 rounded-2xl bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5 transition-all duration-300 group/item relative overflow-hidden shadow-sm'
                >
                  <div 
                    className={`absolute left-0 top-0 bottom-0 w-1 ${config.bgColor.replace('/10', '')} opacity-40`}
                  />
                  <div className='flex items-start justify-between mb-2'>
                    <div className='flex items-center gap-3'>
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${config.bgColor.replace('/10', '')} shadow-lg shadow-current/20`}
                      ></div>
                      <span className='text-sm font-bold text-text-primary group-hover/item:text-blue-500 transition-colors'>
                        {config.label}
                      </span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <span className='text-sm font-bold text-text-primary'>
                        {item.value}{' '}
                        <span className='text-[10px] font-bold text-text-tertiary uppercase'>
                          Alumni
                        </span>
                      </span>
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${config.bgColor} ${config.color}`}
                      >
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <p className='text-xs text-text-tertiary leading-relaxed font-medium'>
                    {config.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Footer / CTA */}
      <div className='mt-8 pt-4 border-t border-[color:var(--border-color)] flex items-center justify-between'>
        <div className='flex items-center gap-2 text-[10px] text-text-tertiary italic'>
          <FaInfoCircle />
          <span>
            Data diperbarui secara real-time berdasarkan input kuesioner alumni.
          </span>
        </div>
      </div>
    </div>
  );
};

export default PerguruanTinggi;
