import { useEffect, useState } from 'react';
import axios from 'axios';
import SmartLoader from '@/components/SmartLoader';
import EventWelcomeCard from '@/components/Dashboard/EventWelcomeCard';
import EventRegisterModal from '@/components/EventRegisterModal';
import { LuCalendarOff } from 'react-icons/lu';

const StudentEvents = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

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

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading)
    return (
      <SmartLoader
        messages={['Mencari event seru...', 'Mengambil informasi event...']}
      />
    );

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <div className='text-center md:text-left mb-6'>
        <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
          Daftar Event
        </h1>
        <p className='text-[color:var(--text-secondary)] text-xs md:text-sm'>
          Ikuti event terbaru untuk menambah wawasan dan jaringan.
        </p>
      </div>

      {events.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 text-[color:var(--text-secondary)]'>
          <LuCalendarOff size={48} className='mb-4 opacity-50' />
          <p>Belum ada event yang tersedia saat ini.</p>
        </div>
      ) : (
        <div className='space-y-6'>
          {events.map((event) => (
            <EventWelcomeCard
              key={event._id}
              event={event}
              isRegistered={event.isRegistered}
              onRegister={() => {
                setSelectedEvent(event);
                setIsRegisterModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <EventRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        event={selectedEvent}
        onSuccess={() => {
          fetchEvents();
        }}
      />
    </div>
  );
};

export default StudentEvents;
