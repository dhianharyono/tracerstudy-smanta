import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { LuCalendar, LuEye, LuSearch } from 'react-icons/lu';

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

  if (loading) return <LoadingSpinner />;

  if (selectedEvent) {
    return (
      <div className='p-6 page-fade-in'>
        <button
          onClick={() => setSelectedEvent(null)}
          className='mb-6 text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] flex items-center gap-2'
        >
          &larr; Kembali ke Daftar Event
        </button>

        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-[color:var(--text-primary)] mb-2'>
            Peserta Event: {selectedEvent.name}
          </h1>
          <p className='text-[color:var(--text-secondary)]'>
            {selectedEvent.description}
          </p>
        </div>

        {/* Filters */}
        <div className='bg-[color:var(--bg-card)] p-4 rounded-xl shadow-sm border border-[color:var(--border-color)] mb-6 flex flex-col md:flex-row gap-4'>
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
          <LoadingSpinner />
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredRegistrants.map((reg) => (
              <div
                key={reg._id}
                className='bg-[color:var(--bg-card)] rounded-xl p-6 shadow-sm border border-[color:var(--border-color)] hover:shadow-md transition-shadow'
              >
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold'>
                    {reg.userId?.profile?.fullName?.[0] || '?'}
                  </div>
                  <div>
                    <h3 className='font-semibold text-[color:var(--text-primary)] line-clamp-1'>
                      {reg.userId?.profile?.fullName || 'Anonymous'}
                    </h3>
                    <p className='text-xs text-[color:var(--text-secondary)]'>
                      {new Date(reg.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className='space-y-3'>
                  <div className='bg-[color:var(--bg-secondary)] rounded-lg'>
                    <p className='text-xs font-medium text-[color:var(--text-secondary)] mb-1'>
                      Harapan :
                    </p>
                    <p className='text-sm p-3 text-[color:var(--text-primary)] italic'>
                      "{reg.expectation}"
                    </p>
                  </div>

                  <div>
                    <p className='text-xs font-medium text-[color:var(--text-secondary)] mb-1'>
                      Rencana Studi :
                    </p>
                    <div className='text-sm'>
                      <p className='font-medium text-[var(--primary)]'>
                        {reg.studyPlan?.university}
                      </p>
                      <p className='text-[color:var(--text-primary)] text-xs'>
                        {reg.studyPlan?.major}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredRegistrants.length === 0 && (
              <div className='col-span-full py-12 text-center text-[color:var(--text-tertiary)]'>
                Tidak ada data peserta yang sesuai filter.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className='p-6 page-fade-in'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-[color:var(--text-primary)]'>
          Event Alumni
        </h1>
        <p className='text-[color:var(--text-secondary)]'>
          Daftar event terkini di SMANTA
        </p>
      </div>

      <div className='grid gap-6'>
        {events.map((event) => (
          <div
            key={event._id}
            className='bg-[color:var(--bg-card)] rounded-xl p-6 shadow-sm border border-[color:var(--border-color)] flex flex-col md:flex-row gap-6 items-start md:items-center justify-between'
          >
            <div className='flex-1'>
              <h3 className='text-xl font-bold text-[color:var(--text-primary)] mb-2'>
                {event.name}
              </h3>
              <p className='text-sm text-[color:var(--text-secondary)] mb-4'>
                {event.description}
              </p>
              <div className='flex items-center gap-2 text-sm text-[color:var(--text-tertiary)]'>
                <LuCalendar size={16} />
                <span>
                  {new Date(event.date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className='mt-2'>
                {!hasAccess(event) && (
                  <span className='px-2 py-0.5 rounded-full bg-amber-400 text-gray-700 text-xs'>
                    Badge Required
                  </span>
                )}
              </div>
            </div>

            {hasAccess(event) && (
              <button
                onClick={() => handlePreview(event)}
                className='flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white text-sm rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-primary/30'
              >
                <LuEye size={20} />
                <span>Preview Peserta</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlumniEventHub;
