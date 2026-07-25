import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { LuX } from 'react-icons/lu';
import Toast from '@/components/toast';
import SearchableSelect from '@/components/SearchableSelect';

interface EventRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onSuccess: () => void;
}

const EventRegisterModal: React.FC<EventRegisterModalProps> = ({
  isOpen,
  onClose,
  event,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    expectation: '',
    university: '',
    major: '',
  });
  const [universities, setUniversities] = useState<string[]>([]);
  const [majors, setMajors] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [univRes, majorRes] = await Promise.all([
          axios.get('/api/universities'),
          axios.get('/api/majors'),
        ]);
        
        const univs = [...new Set(univRes.data.map((u: any) => u.name))].sort();
        const majors = [...new Set(majorRes.data.map((m: any) => m.name))].sort();
        
        setUniversities(univs as string[]);
        setMajors(majors as string[]);
      } catch (error) {
        setUniversities([]);
        setMajors([]);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.expectation.trim()) {
      Toast('Harapan mengikuti event wajib diisi', 'error');
      return;
    }
    if (!formData.university) {
      Toast('Perguruan Tinggi wajib dipilih', 'error');
      return;
    }
    if (!formData.major) {
      Toast('Jurusan wajib dipilih', 'error');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`/api/events/${event._id}/register`, {
        expectation: formData.expectation,
        studyPlan: {
          university: formData.university,
          major: formData.major,
        },
      });
      Toast('Berhasil mendaftar event!', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      Toast(error.response?.data?.message || 'Gagal mendaftar event', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className='fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in'>
      <div className='bg-[color:var(--bg-card)] border border-[color:var(--border-color)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]'>
        <div className='p-6 border-b border-[color:var(--border-color)] flex justify-between items-center bg-[color:var(--bg-tertiary)]/50 shrink-0'>
          <div>
            <div className='text-sm md:text-xl font-bold text-[color:var(--text-primary)]'>
              {new Date().setHours(0, 0, 0, 0) >=
              new Date(event.date).setHours(0, 0, 0, 0)
                ? 'Berikan Ulasan'
                : 'Registrasi Event'}
            </div>
            <p className='text-xs md:text-sm text-[color:var(--text-secondary)] mt-1'>
              {event?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-[color:var(--bg-tertiary)] rounded-full transition-colors text-[color:var(--text-secondary)]'
          >
            <LuX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-5 overflow-y-auto'>
          <div>
            <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-2'>
              {new Date().setHours(0, 0, 0, 0) >=
              new Date(event.date).setHours(0, 0, 0, 0)
                ? 'Harapan Setelah Mengikuti Event'
                : 'Harapan Mengikuti Event'}
              <span className='text-red-500 ml-1'>*</span>
            </label>
            <textarea
              required
              rows={4}
              className='w-full px-4 py-3 rounded-xl bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-tertiary)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all duration-200 outline-none resize-none block'
              placeholder='Ceritakan apa yang ingin kamu dapatkan...'
              value={formData.expectation}
              onChange={(e) =>
                setFormData({ ...formData, expectation: e.target.value })
              }
            />
          </div>

          <div className='p-5 bg-[color:var(--bg-tertiary)]/30 rounded-xl border border-[color:var(--border-color)] space-y-4'>
            <h4 className='flex items-center gap-2 text-xs font-bold text-[color:var(--text-secondary)] uppercase tracking-wider'>
              <span className='w-2 h-2 rounded-full bg-[var(--primary)]'></span>
              Rencana Studi
            </h4>

            <div className='grid grid-cols-1 gap-4'>
              <SearchableSelect
                label='Perguruan Tinggi Tujuan'
                name='university'
                value={formData.university}
                options={universities}
                onChange={(e) =>
                  setFormData({ ...formData, university: e.target.value })
                }
                placeholder='Pilih atau ketik nama kampus...'
                required
              />

              <SearchableSelect
                label='Jurusan yang Diminati'
                name='major'
                value={formData.major}
                options={majors}
                onChange={(e) =>
                  setFormData({ ...formData, major: e.target.value })
                }
                placeholder='Pilih atau ketik jurusan...'
                required
              />
            </div>
          </div>

          <div className='pt-4'>
            <button
              type='submit'
              disabled={loading}
              className='w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none'
            >
              {loading ? (
                <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
              ) : (
                <>
                  <span>Daftar Sekarang</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default EventRegisterModal;
