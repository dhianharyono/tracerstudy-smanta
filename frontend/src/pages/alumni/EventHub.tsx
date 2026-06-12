import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import SmartLoader from '@/components/SmartLoader';
import {
  LuCalendar,
  LuEye,
  LuSearch,
  LuChevronDown,
  LuChevronUp,
  LuUsers,
} from 'react-icons/lu';
import RestrictedAccess from '@/components/RestrictedAccess';
import { isUniversityIncomplete } from '@/utils/validation';

const AlumniEventHub = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [registrants, setRegistrants] = useState<any[]>([]);
  const [loadingRegistrants, setLoadingRegistrants] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [universityFilter, setUniversityFilter] = useState('');
  const [majorFilter, setMajorFilter] = useState('');
  const [expandedExpectations, setExpandedExpectations] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('/api/events');
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handlePreview = async (event: any) => {
    setSelectedEvent(event);
    setLoadingRegistrants(true);
    try {
      const response = await axios.get(
        `/api/events/${event._id}/registrations`,
      );
      setRegistrants(response.data);
    } catch (error) {
      console.error('Error fetching registrations', error);
    } finally {
      setLoadingRegistrants(false);
    }
  };

  const toggleExpectation = (id: string) => {
    setExpandedExpectations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const hasAccess = (event: any) => {
    if (!event.badgeId) return false;
    const currentUser = user as any;
    if (!currentUser?.badges) return false;
    return currentUser.badges.some((b: any) => {
      const bId = b._id || b;
      const targetId = event.badgeId._id || event.badgeId;
      return String(bId) === String(targetId);
    });
  };

  const filteredRegistrants = useMemo(() => {
    return registrants.filter((reg) => {
      const nameMatch = reg.userId?.profile?.fullName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const uniMatch = universityFilter
        ? reg.studyPlan?.university
          ?.toLowerCase()
          .includes(universityFilter.toLowerCase())
        : true;
      const majorMatch = majorFilter
        ? reg.studyPlan?.major
          ?.toLowerCase()
          .includes(majorFilter.toLowerCase())
        : true;

      return nameMatch && uniMatch && majorMatch;
    });
  }, [registrants, searchQuery, universityFilter, majorFilter]);

  const universities = [
    ...new Set(registrants.map((r) => r.studyPlan?.university).filter(Boolean)),
  ];
  const majors = [
    ...new Set(registrants.map((r) => r.studyPlan?.major).filter(Boolean)),
  ];

  if (loading)
    return (
      <SmartLoader
        messages={[
          'Mengambil data event...',
          'Menyiapkan jadwal...',
          'Mencari event menarik...',
        ]}
      />
    );

  if (selectedEvent) {
    return (
      <div className='p-6 page-fade-in'>
        <button
          onClick={() => setSelectedEvent(null)}
          className='mb-6 text-xs md:text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] flex items-center gap-2'
        >
          &larr; Kembali ke Daftar Event
        </button>

        <div className='mb-8'>
          <h1 className='text-sm md:text-2xl font-bold text-[color:var(--text-primary)] mb-2'>
            Peserta Event: {selectedEvent.name}
          </h1>
          <p className='text-xs md:text-sm text-[color:var(--text-secondary)]'>
            {selectedEvent.description}
          </p>
        </div>

        <div className='bg-[color:var(--bg-card)] text-xs md:text-sm p-4 rounded-xl shadow-sm border border-[color:var(--border-color)] mb-6 flex flex-col md:flex-row gap-4'>
          <div className='flex-1 relative'>
            <LuSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)]' />
            <input
              type='text'
              placeholder='Cari nama peserta...'
              className='w-full pl-10 pr-4 py-2 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--primary)] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-tertiary)]'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className='px-4 py-2 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--primary)] text-[color:var(--text-primary)]'
            value={universityFilter}
            onChange={(e) => setUniversityFilter(e.target.value)}
          >
            <option value=''>Semua Universitas</option>
            {universities.map((u: any) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <select
            className='px-4 py-2 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--primary)] text-[color:var(--text-primary)]'
            value={majorFilter}
            onChange={(e) => setMajorFilter(e.target.value)}
          >
            <option value=''>Semua Jurusan</option>
            {majors.map((m: any) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {loadingRegistrants ? (
          <SmartLoader
            messages={['Memuat peserta...', 'Menganalisis data...']}
            fullScreen={false}
          />
        ) : (
          <div className='grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-3 md:gap-6'>
            {filteredRegistrants.map((reg) => {
              const isExpanded = expandedExpectations[reg._id];
              return (
                <div
                  key={reg._id}
                  className='bg-[color:var(--bg-card)] rounded-xl p-3 md:p-6 shadow-sm border border-[color:var(--border-color)] hover:shadow-md transition-shadow flex flex-col h-full'
                >
                  <div className='flex flex-col sm:flex-row items-center sm:items-start gap-2 md:gap-3 mb-3'>
                    <div className='invisible md:visible w-0 h-0 md:w-10 md:h-10 shrink-0 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-xs md:text-base'>
                      {reg.userId?.profile?.fullName?.[0] || '?'}
                    </div>
                    <div className='text-center sm:text-left min-w-0 w-full'>
                      <div className='font-semibold text-[color:var(--text-primary)] text-xs md:text-sm line-clamp-1'>
                        {reg.userId?.profile?.fullName || 'Anonymous'}
                      </div>
                      <p className='text-[10px] md:text-xs text-[color:var(--text-secondary)]'>
                        {new Date(reg.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className='space-y-2 md:space-y-3 flex-1'>
                    <div>
                      <p className='text-[10px] md:text-xs font-medium text-[color:var(--text-secondary)] mb-0.5 md:mb-1'>
                        Harapan :
                      </p>
                      <div className='bg-[color:var(--bg-secondary)] rounded-lg p-2 md:p-3'>
                        <p
                          className={`text-xs md:text-sm text-[color:var(--text-primary)] italic ${!isExpanded ? 'line-clamp-2 md:line-clamp-3' : ''}`}
                        >
                          "{reg.expectation}"
                        </p>
                        {reg.expectation?.length > 60 && (
                          <button
                            onClick={() => toggleExpectation(reg._id)}
                            className='mt-1 text-[10px] md:text-xs text-[var(--primary)] font-medium flex items-center gap-1 hover:underline'
                          >
                            {isExpanded ? (
                              <>
                                Tutup <LuChevronUp />
                              </>
                            ) : (
                              <>
                                Lihat Selengkapnya <LuChevronDown />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className='text-[10px] md:text-xs font-medium text-[color:var(--text-secondary)] mb-0.5 md:mb-1'>
                        Rencana Studi :
                      </p>
                      <div className='text-[10px] md:text-sm'>
                        <p className='font-medium text-[var(--primary-dark)] line-clamp-2 md:line-clamp-2'>
                          {reg.studyPlan?.university}
                        </p>
                        <p className='text-[color:var(--text-primary)] text-[10px] md:text-xs line-clamp-1'>
                          {reg.studyPlan?.major}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredRegistrants.length === 0 && (
              <div className='col-span-full text-xs md:text-sm py-12 text-center text-[color:var(--text-tertiary)]'>
                Tidak ada data peserta yang sesuai filter.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  const hasUniversityData = !!(user?.university?.name);
  if (user?.questionnaireCompleted === false && !hasUniversityData) {
    return <RestrictedAccess type='questionnaire_incomplete' role='alumni' />;
  }

  if (user && isUniversityIncomplete(user)) {
    return <RestrictedAccess type='university_incomplete' role='alumni' />;
  }

  return (
    <div className='p-6 page-fade-in'>
      <div className='mb-8 text-center md:text-left'>
        <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
          Event SMANTA
        </h1>
        <p className='text-[color:var(--text-secondary)] text-xs md:text-sm'>
          Daftar event terkini di SMANTA, ikuti dan jangan sampai terlewat!
        </p>
      </div>

      <div className='grid grid-cols-2 gap-3 md:grid-cols-1 md:gap-6'>
        {events.map((event) => (
          <div
            key={event._id}
            className='bg-[color:var(--bg-card)] rounded-xl p-4 md:p-6 shadow-sm border border-[color:var(--border-color)] flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center justify-between h-full md:h-auto'
          >
            <div className='flex-1 w-full'>
              <h3 className='text-sm md:text-xl font-bold text-[color:var(--text-primary)] mb-1 md:mb-2 line-clamp-2 md:line-clamp-1'>
                {event.name}
              </h3>
              <p className='text-xs md:text-sm text-[color:var(--text-secondary)] mb-3 md:mb-4 line-clamp-2 md:line-clamp-none'>
                {event.description}
              </p>
              <div className='flex flex-wrap items-center gap-2 text-[10px] md:text-xs text-[color:var(--text-tertiary)]'>
                <div className='flex items-center gap-1.5'>
                  <LuCalendar size={12} className='md:w-[13px] md:h-[13px]' />
                  <span className='line-clamp-1'>
                    {new Date(event.date).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <LuUsers size={12} className='md:w-[13px] md:h-[13px]' />
                  <span>
                    {(event as any).registrantCount || 0} Pendaftar
                  </span>
                </div>
              </div>
              <div className='mt-2'>
                {!hasAccess(event) && (
                  <span className='inline-block px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/50 text-[10px] md:text-xs font-bold'>
                    Requires Badge
                  </span>
                )}
              </div>
            </div>

            {hasAccess(event) && (
              <button
                onClick={() => handlePreview(event)}
                className='w-full md:w-auto flex items-center justify-center gap-2 px-3 py-2 md:px-6 md:py-3 bg-[var(--primary)] text-white text-xs md:text-sm rounded-lg md:rounded-xl hover:opacity-90 transition-all shadow-sm md:shadow-lg hover:shadow-primary/30 mt-auto md:mt-0'
              >
                <LuEye className='text-sm md:text-xl' />
                <span>Preview</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlumniEventHub;
