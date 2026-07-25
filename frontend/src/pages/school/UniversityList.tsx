import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaUniversity,
  FaSearch,
  FaTrophy,
  FaBuilding,
  FaMapMarkedAlt,
  FaGraduationCap,
  FaCalendarAlt,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card';

interface UnivStat {
  _id: string;
  count: number;
  type: string;
}

const SchoolUniversityList = () => {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState<UnivStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedYear, setSelectedYear] = useState('');
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    fetchUniversities();
  }, [selectedYear]);

  const fetchUniversities = async () => {
    try {
      const params: any = {};
      if (selectedYear) {
        params.graduationYear = selectedYear;
      }
      const response = await axios.get('/api/school/analytics/universities', { params });
      setUniversities(response.data);

      if (availableYears.length === 0) {
        const currentYear = new Date().getFullYear();
        setAvailableYears(Array.from({ length: 15 }, (_, i) => currentYear - i));
      }
    } catch (error) {
      console.error('Error fetching university distribution:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUniversities = universities.filter((u) => {
    const matchesSearch = u._id.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      filterType === 'all' || (u.type || 'swasta') === filterType;
    return matchesSearch && matchesType;
  });

  const topUniversity =
    filteredUniversities.length > 0 ? filteredUniversities[0] : null;

  return (
    <div className='p-6 page-fade-in bg-[color:var(--bg-secondary)] min-h-screen'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
        <div>
          <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
            Perguruan Tinggi
          </h1>
          <p className='text-[color:var(--text-secondary)] text-sm md:text-base mt-1'>
            Daftar perguruan tinggi tempat alumni melanjutkan studi dan
            statistikanya.
          </p>
        </div>

        {/* Filter Tahun */}
        <div className='flex items-center gap-2.5 self-start sm:self-auto shrink-0 bg-[color:var(--bg-card)] border border-[color:var(--border-color)] px-3.5 py-2 rounded-2xl shadow-sm'>
          <FaCalendarAlt className='text-blue-500 text-sm' />
          <span className='text-xs sm:text-sm font-semibold text-[color:var(--text-secondary)] whitespace-nowrap'>
            Tahun:
          </span>
          <select
            id='school-year-filter'
            aria-label='Filter Berdasarkan Tahun'
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className='bg-transparent text-[color:var(--text-primary)] text-xs sm:text-sm font-medium focus:outline-none cursor-pointer pr-1'
          >
            <option value='' className='bg-[color:var(--bg-card)] text-[color:var(--text-primary)]'>
              Semua Tahun
            </option>
            {availableYears.map((year) => (
              <option
                key={year}
                value={year}
                className='bg-[color:var(--bg-card)] text-[color:var(--text-primary)]'
              >
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {topUniversity && (
        <div className='relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 border border-blue-800/40 p-5 sm:p-7 shadow-xl shadow-blue-950/20 mb-6'>
          <div className='absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none' />
          <div className='absolute -left-10 -top-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none' />

          <div className='relative z-10 flex items-center gap-4 sm:gap-6'>
            <div className='flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-500 text-amber-950 shadow-lg shadow-amber-500/25 shrink-0 border border-amber-300/40'>
              <FaTrophy className='text-xl sm:text-2xl text-amber-950' />
            </div>

            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2 mb-1.5'>
                <span className='inline-flex items-center gap-1.5 bg-amber-400/15 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-wider backdrop-blur-md'>
                  ✨ Kampus Terfavorit Alumni
                </span>
              </div>

              <h3
                className='text-lg sm:text-2xl font-black text-white truncate tracking-tight'
                title={topUniversity._id}
              >
                {topUniversity._id}
              </h3>

              <div className='flex items-center gap-3 mt-2 flex-wrap'>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${topUniversity.type === 'negeri'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                      : topUniversity.type === 'kedinasan'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
                    }`}
                >
                  {topUniversity.type || 'Swasta'}
                </span>
                <span className='text-xs sm:text-sm font-medium text-blue-100/90 flex items-center gap-1.5'>
                  <span className='text-amber-400 font-extrabold text-base sm:text-xl'>{topUniversity.count}</span>
                  <span>Alumni Bergabung</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
        <Card className='bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-white/20 rounded-xl backdrop-blur-sm'>
              <FaUniversity size={20} />
            </div>
            <div>
              <p className='text-blue-100 text-[10px] font-bold uppercase tracking-wider'>
                Total Perguran Tinggi
              </p>
              <h3 className='text-2xl font-bold !text-white'>{universities.length}</h3>
            </div>
          </div>
        </Card>

        <Card className='bg-[color:var(--bg-card)] border border-[color:var(--border-color)] shadow-sm'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-amber-500/10 text-amber-500 rounded-xl'>
              <FaBuilding size={20} />
            </div>
            <div>
              <p className='text-[color:var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider'>
                PT Negeri (PTN)
              </p>
              <h3 className='text-2xl font-bold text-[color:var(--text-primary)]'>
                {universities.filter((u) => u.type === 'negeri').length}
              </h3>
            </div>
          </div>
        </Card>

        <Card className='bg-[color:var(--bg-card)] border border-[color:var(--border-color)] shadow-sm'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-pink-500/10 text-pink-500 rounded-xl'>
              <FaBuilding size={20} />
            </div>
            <div>
              <p className='text-[color:var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider'>
                PT Swasta (PTS)
              </p>
              <h3 className='text-2xl font-bold text-[color:var(--text-primary)]'>
                {
                  universities.filter((u) => !u.type || u.type === 'swasta')
                    .length
                }
              </h3>
            </div>
          </div>
        </Card>

        <Card className='bg-[color:var(--bg-card)] border border-[color:var(--border-color)] shadow-sm'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-emerald-500/10 text-emerald-500 rounded-xl'>
              <FaGraduationCap size={20} />
            </div>
            <div>
              <p className='text-[color:var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider'>
                Kedinasan
              </p>
              <h3 className='text-2xl font-bold text-[color:var(--text-primary)]'>
                {universities.filter((u) => u.type === 'kedinasan').length}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and List */}
      <Card className='min-h-[500px]'>
        <div className='flex flex-col gap-4 mb-6'>
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
            <h2 className='text-xl font-bold text-[color:var(--text-primary)]'>
              Peringkat Universitas
            </h2>

            <div className='relative w-full md:w-72 shrink-0'>
              <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)]' />
              <input
                type='text'
                placeholder='Cari nama universitas...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)] transition-colors'
              />
            </div>
          </div>

          <div className='flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide'>
            {[
              { id: 'all', label: 'Semua PT' },
              { id: 'negeri', label: 'PT Negeri' },
              { id: 'swasta', label: 'PT Swasta' },
              { id: 'kedinasan', label: 'Kedinasan' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setFilterType(type.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${filterType === type.id
                  ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20'
                  : 'bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-secondary)] hover:text-[color:var(--text-primary)] border border-[color:var(--border-color)]'
                  }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className='flex justify-center items-center h-40 text-[color:var(--text-tertiary)]'>
            <div className='w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mr-3'></div>
            Memuat data universitas...
          </div>
        ) : filteredUniversities.length === 0 ? (
          <div className='text-center py-16 px-4 bg-[color:var(--bg-tertiary)] rounded-2xl border-2 border-dashed border-[color:var(--border-color)] text-[color:var(--text-tertiary)]'>
            <FaMapMarkedAlt size={48} className='mx-auto mb-4 opacity-20' />
            <p>Tidak ada perguruan tinggi yang ditemukan.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filteredUniversities.map((univ, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/school/alumni?university=${encodeURIComponent(univ._id)}`)}
                className='flex flex-col justify-between p-5 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] hover:border-[var(--primary)] hover:shadow-md transition-all group cursor-pointer hover:scale-[1.01]'
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-center gap-3 w-full pr-2'>
                    <div className='flex items-center justify-center w-10 h-10 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 font-bold text-sm shrink-0 uppercase'>
                      #{idx + 1}
                    </div>
                    <div className='min-w-0'>
                      <h4
                        className='font-bold text-[color:var(--text-primary)] text-sm md:text-base leading-tight truncate'
                        title={univ._id}
                      >
                        {univ._id}
                      </h4>
                      <span
                        className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border
                        ${univ.type === 'negeri'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            : univ.type === 'kedinasan'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : 'bg-pink-500/10 text-pink-600 border-pink-500/20'
                          }`}
                      >
                        {univ.type || 'Swasta'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='pt-4 border-t border-[color:var(--border-color)] flex justify-between items-end'>
                  <div>
                    <span className='text-2xl font-bold text-[var(--primary)] group-hover:scale-110 transition-transform inline-block'>
                      {univ.count}
                    </span>
                    <span className='text-xs font-bold text-[color:var(--text-secondary)] uppercase tracking-wider ml-2'>
                      Alumni
                    </span>
                  </div>
                  <span className='text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity'>
                    Lihat Detail &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SchoolUniversityList;
