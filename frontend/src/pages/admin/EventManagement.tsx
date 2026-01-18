import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Toast from '@/components/toast';
import {
  LuPlus,
  LuPencil,
  LuTrash2,
  LuCalendar,
  LuEye,
  LuSearch,
  LuArrowLeft,
} from 'react-icons/lu';
import ConfirmationModal from '@/components/ConfirmationModal';
import SmartLoader from '@/components/SmartLoader';

const AdminEventManagement = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    badgeId: '',
    isActive: true,
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [viewingEvent, setViewingEvent] = useState<any>(null);
  const [registrants, setRegistrants] = useState<any[]>([]);
  const [loadingRegistrants, setLoadingRegistrants] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, badgesRes] = await Promise.all([
        axios.get('/api/events'),
        axios.get('/api/admin/badges'),
      ]);
      setEvents(eventsRes.data);
      setBadges(badgesRes.data.badges || badgesRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
      try {
        const eventsRes = await axios.get('/api/events');
        setEvents(eventsRes.data);
      } catch (e) {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await axios.put(`/api/events/${editingEvent._id}`, formData);
        Toast('Event updated successfully', 'success');
      } else {
        await axios.post('/api/events', formData);
        Toast('Event created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchData();
      resetForm();
    } catch (error: any) {
      Toast(error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const resetForm = () => {
    setEditingEvent(null);
    setFormData({
      name: '',
      description: '',
      date: '',
      badgeId: '',
      isActive: true,
    });
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description,
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      badgeId: event.badgeId?._id || event.badgeId || '',
      isActive: event.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/api/events/${deleteId}`);
      Toast('Event deleted successfully', 'success');
      fetchData();
      setDeleteId(null);
    } catch (error: any) {
      Toast(error.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const toggleStatus = async (event: any) => {
    try {
      await axios.put(`/api/events/${event._id}`, {
        isActive: !event.isActive,
      });
      Toast('Status updated', 'success');
      fetchData();
    } catch (error: any) {
      Toast('Failed to update status', 'error');
    }
  };

  const handleView = async (event: any) => {
    setViewingEvent(event);
    setLoadingRegistrants(true);
    try {
      const response = await axios.get(
        `/api/events/${event._id}/registrations`,
      );
      setRegistrants(response.data);
    } catch (error) {
      console.error('Error fetching registrations', error);
      Toast('Gagal memuat data pendaftar', 'error');
    } finally {
      setLoadingRegistrants(false);
    }
  };

  const filteredRegistrants = useMemo(() => {
    return registrants.filter((reg) =>
      reg.userId?.profile?.fullName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()),
    );
  }, [registrants, searchQuery]);

  if (loading) return <SmartLoader />;

  if (viewingEvent) {
    return (
      <div className='p-6 page-fade-in text-[color:var(--text-primary)]'>
        <button
          onClick={() => {
            setViewingEvent(null);
            setRegistrants([]);
            setSearchQuery('');
          }}
          className='mb-6 text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] flex items-center gap-2'
        >
          <LuArrowLeft /> Kembali ke Daftar Event
        </button>

        <div className='mb-8'>
          <h1 className='text-2xl font-bold mb-2'>
            Peserta Event: {viewingEvent.name}
          </h1>
          <p className='text-[color:var(--text-secondary)]'>
            {viewingEvent.description}
          </p>
        </div>

        <div className='bg-[color:var(--bg-card)] p-4 rounded-xl shadow-sm border border-[color:var(--border-color)] mb-6'>
          <div className='relative'>
            <LuSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)]' />
            <input
              type='text'
              placeholder='Cari nama peserta...'
              className='w-full pl-10 pr-4 py-2 bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--primary)] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-tertiary)]'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loadingRegistrants ? (
          <SmartLoader />
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
                  <div className='bg-[color:var(--bg-secondary)] p-3 rounded-lg'>
                    <p className='text-xs font-medium text-[color:var(--text-secondary)] uppercase mb-1'>
                      Harapan
                    </p>
                    <p className='text-sm text-[color:var(--text-primary)] italic'>
                      "{reg.expectation}"
                    </p>
                  </div>

                  <div>
                    <p className='text-xs font-medium text-[color:var(--text-secondary)] uppercase mb-1'>
                      Rencana Studi
                    </p>
                    <div className='text-sm'>
                      <p className='font-medium text-[var(--primary)]'>
                        {reg.studyPlan?.university}
                      </p>
                      <p className='text-[color:var(--text-primary)]'>
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
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-[color:var(--text-primary)]'>
          Manajemen Event
        </h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className='flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity'
        >
          <LuPlus size={20} />
          <span>Tambah Event</span>
        </button>
      </div>

      <div className='bg-[color:var(--bg-card)] rounded-xl shadow-sm border border-[color:var(--border-color)] overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left'>
            <thead className='bg-[color:var(--bg-tertiary)] border-b border-[color:var(--border-color)]'>
              <tr>
                <th className='px-6 py-4 font-semibold text-[color:var(--text-primary)]'>
                  Nama Event
                </th>
                <th className='px-6 py-4 font-semibold text-[color:var(--text-primary)]'>
                  Tanggal
                </th>
                <th className='px-6 py-4 font-semibold text-[color:var(--text-primary)]'>
                  Badge
                </th>
                <th className='px-6 py-4 font-semibold text-[color:var(--text-primary)]'>
                  Status
                </th>
                <th className='px-6 py-4 font-semibold text-[color:var(--text-primary)] text-right'>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[color:var(--border-color)]'>
              {events.map((event) => (
                <tr
                  key={event._id}
                  className='hover:bg-[color:var(--bg-tertiary)]/50 transition-colors'
                >
                  <td className='px-6 py-4'>
                    <div className='font-medium text-[color:var(--text-primary)]'>
                      {event.name}
                    </div>
                    <div className='text-sm text-[color:var(--text-secondary)] line-clamp-1 truncate max-w-sm'>
                      {event.description}
                    </div>
                  </td>
                  <td className='px-6 py-4 text-[color:var(--text-secondary)]'>
                    <div className='flex items-center gap-2'>
                      <LuCalendar size={14} />
                      {new Date(event.date).toLocaleDateString('id-ID')}
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    {event.badgeId ? (
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'>
                        {event.badgeId.name || 'Badge Linked'}
                      </span>
                    ) : (
                      <span className='text-xs text-[color:var(--text-tertiary)]'>
                        -
                      </span>
                    )}
                  </td>
                  <td className='px-6 py-4'>
                    <button
                      onClick={() => toggleStatus(event)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        event.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {event.isActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <div className='flex items-center justify-end gap-2'>
                      <button
                        onClick={() => handleView(event)}
                        className='p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors'
                        title='Lihat Peserta'
                      >
                        <LuEye size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(event)}
                        className='p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors'
                        title='Edit'
                      >
                        <LuPencil size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteId(event._id)}
                        className='p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'
                        title='Hapus'
                      >
                        <LuTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className='px-6 py-12 text-center text-[color:var(--text-secondary)]'
                  >
                    Belum ada data event
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'>
          <div className='bg-[color:var(--bg-card)] rounded-xl w-full max-w-lg shadow-xl overflow-hidden animate-scale-up border border-[color:var(--border-color)]'>
            <div className='p-6 border-b border-[color:var(--border-color)] flex justify-between items-center'>
              <h3 className='text-lg font-bold text-[color:var(--text-primary)]'>
                {editingEvent ? 'Edit Event' : 'Tambah Event Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className='text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)]'
              >
                <span className='text-2xl'>&times;</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className='p-6 space-y-5'>
              <div>
                <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-2'>
                  Nama Event
                </label>
                <input
                  type='text'
                  required
                  placeholder='Contoh: Webinar Karir Alumni'
                  className='w-full px-4 py-3 rounded-xl bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-tertiary)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all duration-200 outline-none block'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-2'>
                  Deskripsi
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder='Deskripsikan detail acara...'
                  className='w-full px-4 py-3 rounded-xl bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-tertiary)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all duration-200 outline-none resize-none block'
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <div>
                  <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-2'>
                    Tanggal Pelaksanaan
                  </label>
                  <div className='relative'>
                    <input
                      type='date'
                      required
                      className='w-full px-4 py-3 rounded-xl bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-tertiary)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all duration-200 outline-none block'
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-2'>
                    Badge Wajib{' '}
                    <span className='text-[color:var(--text-tertiary)] font-normal'>
                      (Opsional)
                    </span>
                  </label>
                  <div className='relative'>
                    <select
                      className='w-full px-4 py-3 rounded-xl bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] text-[color:var(--text-primary)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all duration-200 outline-none appearance-none block'
                      value={formData.badgeId}
                      onChange={(e) =>
                        setFormData({ ...formData, badgeId: e.target.value })
                      }
                    >
                      <option value=''>Semua Alumni (Tanpa Badge)</option>
                      {badges.map((badge) => (
                        <option key={badge._id} value={badge._id}>
                          {badge.name}
                        </option>
                      ))}
                    </select>
                    <div className='absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[color:var(--text-tertiary)]'>
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M19 9l-7 7-7-7'
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className='pt-6 flex justify-end gap-3 border-t border-[color:var(--border-color)] mt-6'>
                <button
                  type='button'
                  onClick={() => setIsModalOpen(false)}
                  className='px-6 py-2.5 text-sm font-medium text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-tertiary)] rounded-xl transition-colors'
                >
                  Batal
                </button>
                <button
                  type='submit'
                  className='px-6 py-2.5 text-sm font-medium bg-[var(--primary)] text-white rounded-xl hover:shadow-lg hover:shadow-[var(--primary)]/30 hover:-translate-y-0.5 transition-all duration-200'
                >
                  Simpan Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title='Hapus Event'
        message='Apakah Anda yakin ingin menghapus event ini? Data yang dihapus tidak dapat dikembalikan.'
        confirmText='Hapus'
        cancelText='Batal'
      />
    </div>
  );
};

export default AdminEventManagement;
