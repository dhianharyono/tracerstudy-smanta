import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaSearch,
  FaFilter,
  FaExternalLinkAlt,
  FaClock,
} from 'react-icons/fa';
import SmartLoader from '@/components/SmartLoader';
import { useAuth } from '@/contexts/AuthContext';
import RestrictedAccess from '@/components/RestrictedAccess';
import { isUniversityIncomplete } from '@/utils/validation';

const JOB_CATEGORIES = [
  'Teknologi & IT',
  'Ekonomi & Bisnis',
  'Pendidikan',
  'Kesehatan',
  'Industri & Teknik',
  'Kreatif & Media',
  'Sosial & Humaniora',
  'Lainnya',
];

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Freelance'];

interface OpportunitiesProps {
  hideHeader?: boolean;
}

const Opportunities = ({ hideHeader = false }: OpportunitiesProps) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [expandedJobs, setExpandedJobs] = useState<string[]>([]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedType) params.type = selectedType;

      const response = await axios.get('/api/jobs', { params });
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedCategory, selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const toggleExpand = (jobId: string) => {
    setExpandedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId],
    );
  };

  if (loading && jobs.length === 0) return <SmartLoader />;

  // Alumni Restrictions
  if (user?.role === 'alumni') {
    if (!user.questionnaireCompleted) {
      return <RestrictedAccess type='questionnaire_incomplete' role='alumni' />;
    }
    if (isUniversityIncomplete(user)) {
      return <RestrictedAccess type='university_incomplete' role='alumni' />;
    }
  }

  return (
    <div className='p-4 md:p-8 animate-fade-in'>
      {!hideHeader && (
        <div className='mb-6 md:mb-8 text-center md:text-left'>
          <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-2 flex items-center justify-center md:justify-start gap-3'>
            Bursa Kerja & Peluang
          </h1>
          <p className='text-[color:var(--text-secondary)] text-xs md:text-sm'>
            Temukan lowongan kerja, magang, dan proyek dari rekan alumni
            SMANTA
          </p>
        </div>
      )}

      {/* Filters Section */}
      <div className='bg-[color:var(--bg-card)] p-4 md:p-6 rounded-2xl border border-[color:var(--border-color)] shadow-sm mb-6'>
        <form
          onSubmit={handleSearchSubmit}
          className='grid grid-cols-1 md:grid-cols-4 gap-4'
        >
          <div className='md:col-span-2 relative'>
            <FaSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)]' />
            <input
              type='text'
              placeholder='Cari lowongan, perusahaan, atau deskripsi...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-full pl-11 pr-4 py-3 rounded-xl bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] text-sm focus:outline-none focus:border-[var(--primary)] transition-all'
            />
          </div>

          <div className='relative'>
            <FaFilter className='absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)] text-xs' />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className='w-full pl-10 pr-4 py-3 rounded-xl bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] text-sm appearance-none focus:outline-none focus:border-[var(--primary)] transition-all'
            >
              <option value=''>Semua Kategori</option>
              {JOB_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className='relative'>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className='w-full px-4 py-3 rounded-xl bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] text-sm appearance-none focus:outline-none focus:border-[var(--primary)] transition-all'
            >
              <option value=''>Tipe Kerja</option>
              {JOB_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Job List - LinkedIn Style */}
      <div className='space-y-4'>
        {jobs.length > 0 ? (
          jobs.map((job) => {
            const isExpanded = expandedJobs.includes(job._id);
            return (
              <div
                key={job._id}
                className='group bg-[color:var(--bg-card)] border border-[color:var(--border-color)] rounded-xl overflow-hidden hover:shadow-md transition-all duration-300'
              >
                <div className='p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4'>
                  {/* Logo Placeholder */}
                  <div className='w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-lg bg-[color:var(--bg-tertiary)] flex items-center justify-center text-2xl text-[var(--primary)]'>
                    <FaBriefcase />
                  </div>

                  {/* Job Content */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex flex-wrap items-center gap-2 mb-1'>
                      <h3 className='text-base md:text-lg font-bold text-[color:var(--text-primary)] group-hover:text-[var(--primary)] transition-colors !mb-0'>
                        {job.title}
                      </h3>
                      <span className='px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'>
                        {job.type}
                      </span>
                    </div>

                    <p className='text-sm md:text-base font-semibold text-[color:var(--text-secondary)] mb-2'>
                      {job.company}
                    </p>

                    <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-[color:var(--text-tertiary)]'>
                      <div className='flex items-center gap-1.5'>
                        <FaMapMarkerAlt />
                        <span>{job.location}</span>
                      </div>
                      <div className='flex items-center gap-1.5 text-blue-500 font-medium'>
                        <span>{job.category}</span>
                      </div>
                      <div className='flex items-center gap-1.5'>
                        <FaClock />
                        <span>
                          Batas:{' '}
                          {new Date(job.expiryDate).toLocaleDateString(
                            'id-ID',
                            { day: 'numeric', month: 'short', year: 'numeric' },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className='mt-4 md:mt-0 flex items-center justify-between md:justify-end gap-3 border-t md:border-0 pt-4 md:pt-0'>
                    <div className='text-[10px] text-[color:var(--text-tertiary)] md:hidden'>
                      Diposting oleh:{' '}
                      <span className='font-semibold text-[color:var(--text-secondary)]'>
                        {job.postedBy?.profile?.fullName || 'Alumni'}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() => toggleExpand(job._id)}
                        className='px-4 py-2 text-xs font-bold text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-all'
                      >
                        {isExpanded ? 'Tutup Detail' : 'Lihat Detail'}
                      </button>
                      {job.applicationLink ? (
                        <a
                          href={job.applicationLink}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white text-xs md:text-sm font-bold rounded-lg hover:opacity-90 transition-all shadow-sm'
                        >
                          Lamar Sekarang
                          <FaExternalLinkAlt className='text-[10px]' />
                        </a>
                      ) : (
                        <span className='text-[10px] font-medium text-[color:var(--text-tertiary)] bg-[color:var(--bg-tertiary)] px-3 py-1 rounded-lg'>
                          Hubungi Alumni
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable Content */}
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] py-6 border-t border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)]/20' : 'max-h-0'}`}
                >
                  <div className='ml-0 md:ml-16 space-y-6'>
                    <div>
                      <h4 className='text-xs font-bold uppercase tracking-wider text-[color:var(--text-tertiary)] mb-2'>
                        Deskripsi Pekerjaan
                      </h4>
                      <div className='text-sm text-[color:var(--text-secondary)] whitespace-pre-wrap leading-relaxed'>
                        {job.description}
                      </div>
                    </div>

                    {job.requirements && job.requirements.length > 0 && (
                      <div>
                        <h4 className='text-xs font-bold uppercase tracking-wider text-[color:var(--text-tertiary)] mb-2'>
                          Persyaratan
                        </h4>
                        <ul className='list-disc list-inside text-sm text-[color:var(--text-secondary)] space-y-1'>
                          {job.requirements.map((req: string, idx: number) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className='pt-4 border-t border-[color:var(--border-color)] flex items-center justify-between'>
                      <div className='text-xs text-[color:var(--text-tertiary)]'>
                        Pemberi Loker:{' '}
                        <span className='text-[color:var(--text-secondary)] font-bold'>
                          {job.postedBy?.profile?.fullName}
                        </span>
                        <span className='mx-2'>•</span>
                        Angkatan:{' '}
                        <span className='text-[color:var(--text-secondary)] font-bold'>
                          {job.postedBy?.profile?.graduationYear}
                        </span>
                      </div>

                      {job.applicationLink && (
                        <div className='text-[10px] text-[color:var(--text-tertiary)] italic'>
                          Klik 'Lamar Sekarang' untuk diarahkan ke web
                          eksternal.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {!isExpanded && (
                  <div className='hidden md:block px-6 pb-4 ml-20'>
                    <p
                      className='text-xs text-[color:var(--text-tertiary)] line-clamp-1 italic cursor-pointer'
                      onClick={() => toggleExpand(job._id)}
                    >
                      "{job.description.split('\n')[0]}..."{' '}
                      <span className='text-[var(--primary)] font-bold'>
                        baca selengkapnya
                      </span>
                    </p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className='text-center py-12 bg-[color:var(--bg-card)] rounded-2xl border border-dashed border-[color:var(--border-color)]'>
            <FaBriefcase className='text-4xl text-[color:var(--text-tertiary)] mx-auto mb-3 opacity-20' />
            <h3 className='text-lg font-medium text-[color:var(--text-primary)]'>
              Belum ada lowongan
            </h3>
            <p className='text-xs text-[color:var(--text-tertiary)]'>
              Coba cari kategori lain atau kembali lagi nanti.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Opportunities;
