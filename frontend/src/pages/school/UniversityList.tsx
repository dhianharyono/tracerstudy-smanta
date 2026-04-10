import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUniversity, FaSearch, FaTrophy, FaBuilding, FaMapMarkedAlt } from 'react-icons/fa';
import Card from '@/components/common/Card';

interface UnivStat {
  _id: string;
  count: number;
  type: string;
}

const SchoolUniversityList = () => {
  const [universities, setUniversities] = useState<UnivStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const response = await axios.get('/api/school/analytics/universities');
      setUniversities(response.data);
    } catch (error) {
      console.error('Error fetching university distribution:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUniversities = universities.filter(u => {
    const matchesSearch = u._id.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || (u.type || 'swasta') === filterType;
    return matchesSearch && matchesType;
  });

  const topUniversity = filteredUniversities.length > 0 ? filteredUniversities[0] : null;

  return (
    <div className='p-6 page-fade-in bg-[color:var(--bg-secondary)] min-h-screen'>
      <div className='mb-8'>
        <div className='text-3xl font-bold text-[color:var(--text-primary)]'>
          Perguruan Tinggi
        </div>
        <p className='text-[color:var(--text-secondary)]'>
          Daftar perguruan tinggi tempat alumni melanjutkan studi dan statistiknya.
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <Card className='bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-xl'>
          <div className='flex items-center gap-4'>
            <div className='p-4 bg-white/20 rounded-xl backdrop-blur-sm'>
              <FaUniversity size={24} />
            </div>
            <div>
              <p className='text-blue-100 text-sm font-medium'>Total PT Terdata</p>
              <h3 className='text-3xl font-black'>{universities.length} Kampus</h3>
            </div>
          </div>
        </Card>

        <Card className='bg-[color:var(--bg-card)] border border-[color:var(--border-color)] shadow-sm'>
          <div className='flex items-center gap-4'>
            <div className='p-4 bg-indigo-500/10 text-indigo-500 rounded-xl'>
              <FaBuilding size={24} />
            </div>
            <div>
              <p className='text-[color:var(--text-secondary)] text-sm font-medium'>PT Negeri (PTN)</p>
              <h3 className='text-3xl font-black text-[color:var(--text-primary)]'>
                {universities.filter(u => u.type === 'negeri').length}
              </h3>
            </div>
          </div>
        </Card>

        {topUniversity && (
          <Card className='bg-[color:var(--bg-card)] border border-[color:var(--border-color)] shadow-sm'>
            <div className='flex items-center gap-4'>
              <div className='p-4 bg-amber-500/10 text-amber-500 rounded-xl relative overflow-hidden group'>
                <div className='absolute inset-0 bg-amber-500/20 translate-y-full group-hover:translate-y-0 transition-transform'></div>
                <FaTrophy size={24} className='relative z-10' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-[color:var(--text-secondary)] text-sm font-medium'>Universitas Terfavorit</p>
                <h3 className='text-lg font-bold text-[color:var(--text-primary)] truncate overflow-hidden whitespace-nowrap' title={topUniversity._id}>
                  {topUniversity._id}
                </h3>
                <p className='text-xs font-bold text-amber-500'>
                  {topUniversity.count} Alumni
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Search and List */}
      <Card className='min-h-[500px]'>
        <div className='flex flex-col gap-4 mb-6'>
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
            <h2 className='text-xl font-bold text-[color:var(--text-primary)]'>Peringkat Universitas</h2>

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
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  filterType === type.id
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
                className='flex flex-col justify-between p-5 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] hover:border-[var(--primary)] hover:shadow-md transition-all group'
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-center gap-3 w-full pr-2'>
                    <div className='flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 font-bold text-sm shrink-0 uppercase'>
                      #{idx + 1}
                    </div>
                    <div className='min-w-0'>
                      <h4 className='font-bold text-[color:var(--text-primary)] text-sm md:text-base leading-tight truncate' title={univ._id}>
                        {univ._id}
                      </h4>
                      <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider
                        ${univ.type === 'negeri' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : univ.type === 'kedinasan' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'}`}
                      >
                        {univ.type || 'Swasta'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='pt-4 border-t border-[color:var(--border-color)] flex justify-between items-end'>
                  <div>
                    <span className='text-2xl font-black text-[var(--primary)] group-hover:scale-110 transition-transform inline-block'>
                      {univ.count}
                    </span>
                    <span className='text-xs font-bold text-[color:var(--text-secondary)] uppercase tracking-wider ml-2'>
                      Alumni
                    </span>
                  </div>
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
