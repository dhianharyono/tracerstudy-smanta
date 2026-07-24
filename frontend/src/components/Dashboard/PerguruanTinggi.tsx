import { useState } from 'react';
import {
  FaUniversity,
  FaInfoCircle,
  FaGraduationCap,
  FaBuilding,
  FaLandmark,
} from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface UniversityDataType {
  name: string;
  value: number;
}

interface PerguruanTinggiProps {
  data: UniversityDataType[];
}

const typeConfig: Record<
  string,
  {
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
    bgLight: string;
    border: string;
    gradient: string;
    fillColor: string;
  }
> = {
  PTN: {
    label: 'Perguruan Tinggi Negeri',
    description:
      'Kampus milik pemerintah dengan seleksi nasional (SNBP/SNBT/Mandiri).',
    icon: FaGraduationCap,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgLight: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    border: 'border-indigo-500/30',
    gradient: 'from-indigo-500 to-blue-500',
    fillColor: '#6366f1',
  },
  PTS: {
    label: 'Perguruan Tinggi Swasta',
    description:
      'Institusi pendidikan mandiri dengan beragam spesialisasi jurusan unggulan.',
    icon: FaBuilding,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgLight: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    border: 'border-emerald-500/30',
    gradient: 'from-emerald-500 to-teal-400',
    fillColor: '#10b981',
  },
  Kedinasan: {
    label: 'Sekolah Kedinasan',
    description:
      'Lembaga pendidikan tinggi di bawah naungan kementerian/lembaga negara.',
    icon: FaLandmark,
    color: 'text-amber-600 dark:text-amber-400',
    bgLight: 'bg-amber-500/10 dark:bg-amber-500/20',
    border: 'border-amber-500/30',
    gradient: 'from-amber-500 to-orange-400',
    fillColor: '#f59e0b',
  },
};

const DEFAULT_COLORS = ['#6366f1', '#10b981', '#f59e0b'];

const PerguruanTinggi = ({ data }: PerguruanTinggiProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalValue = (data || []).reduce((sum, item) => sum + item.value, 0);
  const hasData = (data || []).length > 0 && totalValue > 0;

  const displayData = hasData
    ? data
    : [
      { name: 'PTN', value: 0 },
      { name: 'PTS', value: 0 },
      { name: 'Kedinasan', value: 0 },
    ];

  const hoveredItem =
    hoveredIndex !== null && displayData[hoveredIndex]
      ? displayData[hoveredIndex]
      : null;
  const hoveredPercentage =
    hoveredItem && totalValue > 0
      ? Math.round((hoveredItem.value / totalValue) * 100)
      : 0;
  const hoveredConfig = hoveredItem ? typeConfig[hoveredItem.name] : null;

  return (
    <div className='card h-full flex flex-col justify-between overflow-hidden group border border-[color:var(--border-color)] bg-[color:var(--bg-card)] shadow-lg rounded-3xl p-6'>
      {/* Header Section */}
      <div>
        <div className='flex flex-wrap gap-3 items-center justify-between mb-6 pb-4 border-b border-[color:var(--border-color)]'>
          <div className='flex items-center gap-3'>
            <div className='p-2.5 bg-gradient-to-br from-indigo-500/15 to-blue-500/15 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/20 shadow-sm group-hover:scale-105 transition-transform duration-300'>
              <FaUniversity className='text-xl' />
            </div>
            <div>
              <p className='text-lg font-bold text-text-primary leading-snug'>
                Jalur Studi Alumni
              </p>
              <p className='text-xs text-text-tertiary font-medium'>
                Distribusi Pilihan PT & Lembaga Pendidikan
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2 flex-wrap'>
            <div className='flex items-center gap-1.5 px-3 py-1 bg-[color:var(--bg-tertiary)] rounded-full border border-[color:var(--border-color)] shadow-xs'>
              <div className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse'></div>
              <span className='text-[11px] font-bold text-text-secondary uppercase tracking-wider'>
                Live Stats
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-center'>
          {/* Donut Chart Column */}
          <div className='lg:col-span-5 relative h-[240px] flex items-center justify-center'>
            {hasData ? (
              <>
                {/* Center Content in Donut */}
                <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 text-center px-4'>
                  {hoveredItem && hoveredConfig ? (
                    <div className='animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center'>
                      <span className='text-[10px] font-extrabold uppercase tracking-widest text-text-tertiary mb-0.5'>
                        {hoveredItem.name}
                      </span>
                      <span className='text-2xl font-black text-text-primary leading-none'>
                        {hoveredItem.value}
                      </span>
                      <span
                        className={`text-[11px] font-bold mt-1 px-2 py-0.5 rounded-full ${hoveredConfig.bgLight} ${hoveredConfig.color}`}
                      >
                        {hoveredPercentage}% Alumni
                      </span>
                    </div>
                  ) : (
                    <div className='animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center'>
                      <span className='text-[10px] font-extrabold text-text-tertiary uppercase tracking-widest mb-0.5'>
                        TOTAL
                      </span>
                      <span className='text-3xl font-black text-text-primary leading-none'>
                        {totalValue}
                      </span>
                      <span className='text-[11px] font-bold text-text-tertiary uppercase tracking-wider mt-1'>
                        Alumni
                      </span>
                    </div>
                  )}
                </div>

                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={displayData}
                      cx='50%'
                      cy='50%'
                      innerRadius='64%'
                      outerRadius='86%'
                      paddingAngle={6}
                      cornerRadius={6}
                      dataKey='value'
                      animationBegin={0}
                      animationDuration={1200}
                      onMouseEnter={(_, index) => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {displayData.map((entry, index) => {
                        const isHovered = hoveredIndex === index;
                        const config = typeConfig[entry.name];
                        const fill = config
                          ? config.fillColor
                          : DEFAULT_COLORS[index % DEFAULT_COLORS.length];
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={fill}
                            opacity={
                              hoveredIndex === null || isHovered ? 1 : 0.35
                            }
                            stroke={
                              isHovered
                                ? 'var(--bg-card)'
                                : 'transparent'
                            }
                            strokeWidth={isHovered ? 3 : 0}
                            className='transition-all duration-300 cursor-pointer'
                          />
                        );
                      })}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className='flex flex-col items-center justify-center text-text-tertiary py-8'>
                <FaUniversity className='text-5xl opacity-20 mb-2' />
                <p className='text-xs font-bold uppercase tracking-widest'>
                  Belum Ada Data
                </p>
              </div>
            )}
          </div>

          {/* Cards Breakdown Column */}
          <div className='lg:col-span-7 space-y-3.5'>
            {displayData.map((item, index) => {
              const percentage =
                totalValue > 0
                  ? Math.round((item.value / totalValue) * 100)
                  : 0;
              const config = typeConfig[item.name] || {
                label: item.name,
                description: 'Kategori pendidikan tinggi alumni.',
                icon: FaUniversity,
                color: 'text-gray-500 dark:text-gray-400',
                bgLight: 'bg-gray-500/10',
                border: 'border-gray-500/20',
                gradient: 'from-gray-400 to-gray-600',
                fillColor: '#94a3b8',
              };

              const IconComp = config.icon;
              const isHovered = hoveredIndex === index;

              return (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`p-3.5 rounded-2xl bg-[color:var(--bg-tertiary)] border transition-all duration-300 relative overflow-hidden cursor-pointer ${isHovered
                    ? 'border-indigo-500/40 shadow-md -translate-y-0.5 bg-[color:var(--bg-card)]'
                    : 'border-[color:var(--border-color)] hover:border-[color:var(--border-hover)]'
                    }`}
                >
                  {/* Left Accent Bar */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${config.gradient
                      } transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-60'
                      }`}
                  />

                  <div className='pl-2.5'>
                    <div className='flex items-center justify-between mb-1.5 flex-wrap gap-2'>
                      <div className='flex items-center gap-2.5'>
                        <div
                          className={`p-1.5 rounded-lg ${config.bgLight} ${config.color}`}
                        >
                          <IconComp className='text-sm' />
                        </div>
                        <h4 className='text-sm font-bold text-text-primary'>
                          {config.label}
                        </h4>
                      </div>

                      <div className='flex items-center gap-2'>
                        <span className='text-xs font-bold text-text-primary'>
                          {item.value}{' '}
                          <span className='text-[10px] font-semibold text-text-tertiary uppercase'>
                            Alumni
                          </span>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${config.bgLight} ${config.color} border ${config.border}`}
                        >
                          {percentage}%
                        </span>
                      </div>
                    </div>

                    <p className='text-[11px] text-text-tertiary leading-relaxed mb-2 font-medium'>
                      {config.description}
                    </p>

                    {/* Visual Progress Bar Track */}
                    <div className='w-full h-1.5 bg-gray-200 dark:bg-gray-700/50 rounded-full overflow-hidden'>
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${config.gradient} transition-all duration-700 ease-out`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className='mt-6 pt-3.5 border-t border-[color:var(--border-color)] flex flex-wrap items-center justify-between gap-3 text-xs text-text-tertiary'>
        <div className='flex items-center gap-2 italic text-[11px]'>
          <FaInfoCircle className='text-blue-500 shrink-0' />
          <span>
            Data diperbarui secara real-time berdasarkan input kuesioner alumni.
          </span>
        </div>
        <div className='flex items-center gap-2 font-semibold text-[10px] uppercase tracking-wider text-text-tertiary'>
          <span>{displayData.length} Kategori</span>
          <span>•</span>
          <span>{totalValue} Alumni Terdata</span>
        </div>
      </div>
    </div>
  );
};

export default PerguruanTinggi;

