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
      <div className='flex items-center justify-between mb-8'>
        <h2 className='text-lg md:text-xl flex items-center gap-3 text-text-primary font-bold !mb-0'>
          <div className='p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300'>
            <FaUniversity className='text-blue-500' />
          </div>
          <span>Jalur Studi Alumni</span>
        </h2>
        <div className='flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-700'>
          <div className='w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse'></div>
          <span className='text-[10px] font-bold text-text-secondary uppercase tracking-wider'>
            Live Stats
          </span>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-y-auto custom-scrollbar pr-1'>
        {/* Chart Section */}
        <div className='lg:col-span-2 relative min-h-[180px]'>
          {hasData ? (
            <>
              <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10'>
                <span className='text-[8px] font-black text-text-tertiary uppercase tracking-widest'>
                  TOTAL
                </span>
                <span className='text-xl font-black text-text-primary -mt-1'>
                  {totalValue}
                </span>
                <span className='text-[7px] font-black text-text-tertiary uppercase'>
                  Alumni
                </span>
              </div>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={displayData}
                    cx='50%'
                    cy='50%'
                    innerRadius='60%'
                    outerRadius='80%'
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
                          <div className='bg-white dark:bg-gray-900 p-2 rounded-xl shadow-2xl border border-blue-500/30 animate-in slide-in-from-top-2 duration-300'>
                            <p className='text-[8px] font-black text-text-tertiary uppercase tracking-widest mb-0.5'>
                              {name}
                            </p>
                            <p className='text-[10px] font-black text-blue-500 text-center'>
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
              <FaUniversity className='text-4xl opacity-10 mb-2' />
              <p className='text-[10px] font-bold uppercase tracking-widest'>No Data</p>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className='lg:col-span-3 flex flex-col justify-center gap-3'>
          <h3 className='text-[9px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-1 px-1'>
            Rincian Jalur & Kategori
          </h3>
          <div className='space-y-2.5'>
            {displayData.map((item, index) => {
              const percentage = totalValue > 0 ? Math.round((item.value / totalValue) * 100) : 0;
              const config = typeConfig[item.name] || {
                label: item.name,
                description: '',
                color: 'text-gray-400',
                bgColor: 'bg-gray-400/10',
              };

              return (
                <div
                  key={index}
                  className='p-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/40 border border-gray-700 hover:border-blue-500/30 transition-all duration-300 group/item'
                >
                  <div className='flex items-start justify-between mb-1'>
                    <div className='flex items-center gap-2'>
                      <div className={`w-1.5 h-1.5 rounded-full ${config.bgColor.replace('/10', '')}`}></div>
                      <span className='text-xs font-black text-text-primary whitespace-nowrap group-hover/item:text-blue-500 transition-colors'>
                        {config.label}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs font-black text-text-primary'>{item.value} <span className='text-[8px] font-bold opacity-50 uppercase'>Alumni</span></span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-black ${config.bgColor} ${config.color}`}>
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <p className='text-[10px] text-text-tertiary leading-relaxed font-medium line-clamp-3'>
                    {config.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className='mt-8 pt-4 border-t border-gray-700 flex items-center justify-between'>
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
