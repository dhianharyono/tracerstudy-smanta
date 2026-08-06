import { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '@/components/toast';
import {
  FaSave,
  FaEdit,
  FaUniversity,
  FaGraduationCap,
  FaLightbulb,
  FaUndo,
} from 'react-icons/fa';
import SearchableSelect from '@/components/SearchableSelect';

interface PlanFormProps {
  onUpdate: () => void;
  onReset?: () => void;
}

const PlanForm = ({ onUpdate, onReset }: PlanFormProps) => {
  const [formData, setFormData] = useState({
    targetUniversity: '',
    targetMajor: '',
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(true);

  const [allUniversities, setAllUniversities] = useState<string[]>([]);
  const [allMajors, setAllMajors] = useState<string[]>([]);
  const [universityOptions, setUniversityOptions] = useState<string[]>([]);
  const [majorOptions, setMajorOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchPlan();
    fetchInitialOptions();
  }, []);

  const fetchInitialOptions = async () => {
    try {
      const [uniRes, majorRes] = await Promise.all([
        axios.get('/api/alumni/universities'),
        axios.get('/api/alumni/majors'),
      ]);

      const unis = Array.isArray(uniRes.data)
        ? uniRes.data.map((u: any) => u.name).filter(Boolean)
        : [];
      const majs = Array.isArray(majorRes.data)
        ? majorRes.data.map((m: any) => m.name).filter(Boolean)
        : [];

      setAllUniversities(unis);
      setAllMajors(majs);
      setUniversityOptions(unis);
      setMajorOptions(majs);
    } catch (error) {
      console.error('Error fetching options', error);
    }
  };

  const fetchPlan = async () => {
    try {
      const res = await axios.get('/api/student/college-plan');
      if (res.data) {
        setFormData({
          targetUniversity: res.data.targetUniversity || '',
          targetMajor: res.data.targetMajor || '',
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setInitialLoading(false);
    }
  };

  // Filter jurusan ketika universitas dipilih
  const handleUniversityChange = async (univName: string) => {
    setFormData((prev) => ({ ...prev, targetUniversity: univName }));

    if (!univName) {
      setMajorOptions(allMajors);
      return;
    }

    try {
      const res = await axios.get(
        `/api/alumni/majors?university=${encodeURIComponent(univName)}`
      );
      if (Array.isArray(res.data)) {
        const filteredMajors = res.data.map((m: any) => m.name).filter(Boolean);
        setMajorOptions(filteredMajors);
      } else {
        setMajorOptions([]);
      }
    } catch (err) {
      console.error('Failed to filter majors by university:', err);
    }
  };

  // Filter universitas ketika jurusan dipilih
  const handleMajorChange = async (majorName: string) => {
    setFormData((prev) => ({ ...prev, targetMajor: majorName }));

    if (!majorName) {
      setUniversityOptions(allUniversities);
      return;
    }

    try {
      const res = await axios.get(
        `/api/alumni/universities?major=${encodeURIComponent(majorName)}`
      );
      if (Array.isArray(res.data)) {
        const filteredUnis = res.data.map((u: any) => u.name).filter(Boolean);
        setUniversityOptions(filteredUnis);
      } else {
        setUniversityOptions([]);
      }
    } catch (err) {
      console.error('Failed to filter universities by major:', err);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      await axios.delete('/api/student/college-plan');
      setFormData({ targetUniversity: '', targetMajor: '' });
      setUniversityOptions(allUniversities);
      setMajorOptions(allMajors);
      setIsEditing(true);
      Toast('Form dan data rencana kuliah berhasil di-reset', 'info');
      if (onReset) {
        onReset();
      }
    } catch (error: any) {
      Toast(error.response?.data?.message || 'Gagal mereset data rencana kuliah', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/student/college-plan', {
        ...formData,
        rumpun: 'Saintek',
        entryPath: 'SNBP',
        readinessStatus: 'Yakin',
        isAnonymous: false,
      });
      Toast('Target rencana kuliah berhasil disimpan', 'success');
      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      Toast(error.response?.data?.message || 'Gagal menyimpan', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading)
    return <div className='animate-pulse h-48 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)]'></div>;

  // View Mode
  if (!isEditing && formData.targetUniversity) {
    return (
      <div className='bg-[var(--bg-card)] p-6 md:p-8 rounded-3xl border border-[var(--border-color)] shadow-sm animate-fade-in space-y-6'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
          <div>
            <div className='text-base md:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 mb-1'>
              Target Perguruan Tinggi & Jurusan
            </div>
            <p className='text-xs md:text-sm text-[var(--text-secondary)]'>
              Rencana studi ini dijadikan dasar pencocokan Smart Match.
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-[var(--bg-secondary)]/50 rounded-2xl border border-[var(--border-color)]'>
          <div className='space-y-1.5'>
            <p className='text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider'>
              Perguruan Tinggi
            </p>
            <p className='font-bold text-[var(--text-primary)] flex items-center gap-2.5 text-sm md:text-base'>
              <FaUniversity className='text-[var(--primary)] text-lg' />{' '}
              {formData.targetUniversity}
            </p>
          </div>
          <div className='space-y-1.5'>
            <p className='text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider'>
              Jurusan
            </p>
            <p className='font-bold text-[var(--text-primary)] flex items-center gap-2.5 text-sm md:text-base'>
              <FaGraduationCap className='text-indigo-400 text-xl' />{' '}
              {formData.targetMajor}
            </p>
          </div>
        </div>

        <div className='flex justify-end'>
          <button
            onClick={() => setIsEditing(true)}
            className='flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all bg-[var(--primary)] text-white hover:bg-opacity-90 active:scale-95 shadow-md shadow-[var(--primary)]/20'
          >
            <FaEdit /> Edit pencarian
          </button>
        </div>
      </div>
    );
  }

  // Edit Mode
  return (
    <div className='bg-[var(--bg-card)] p-6 md:p-8 rounded-3xl border border-[var(--border-color)] shadow-sm animate-fade-in relative z-30 space-y-3'>
      <div className='flex items-center justify-between gap-3 flex-wrap'>
        <div>
          <h3 className='text-base md:text-lg font-bold text-[var(--text-primary)]'>
            {formData.targetUniversity
              ? 'Edit Rencana Kuliah'
              : 'Pilih Perguruan Tinggi & Jurusan'}
          </h3>
        </div>
        {(formData.targetUniversity || formData.targetMajor) && (
          <button
            type='button'
            onClick={handleReset}
            className='px-3.5 py-1.5 text-rose-400 font-bold text-xs rounded-xl border border-rose-500/20 hover:bg-rose-500/20 transition-all flex items-center gap-1.5'
            title='Reset pilihan kampus dan jurusan'
          >
            <FaUndo className='text-xs' /> Reset Form
          </button>
        )}
      </div>

      {/* Info Tip tentang Pencocokan Otomatis */}
      <div className='p-3.5 border border-[var(--border-color)] rounded-2xl flex items-center gap-3 text-xs text-[var(--text-primary)] mb-3 bg-[var(--bg-secondary)]/30'>
        <FaLightbulb className='text-[var(--primary)] text-base shrink-0' />
        <span>
          <strong>Filter Eksklusif:</strong> Memilih <em>Perguruan Tinggi</em> akan menampilkan <strong>HANYA jurusan yang ada</strong> di perguruan tinggi tersebut (dan sebaliknya). Gunakan tombol <em>Reset Form</em> jika ingin mencari ulang.
        </span>
      </div>

      <form onSubmit={handleSubmit} className='space-y-5'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <SearchableSelect
              name='targetUniversity'
              label='Perguruan Tinggi'
              value={formData.targetUniversity}
              options={universityOptions}
              onChange={(e) => handleUniversityChange(e.target.value)}
              required
              placeholder='Pilih atau ketik nama kampus...'
            />
          </div>
          <div>
            <SearchableSelect
              name='targetMajor'
              label='Jurusan'
              value={formData.targetMajor}
              options={majorOptions}
              onChange={(e) => handleMajorChange(e.target.value)}
              required
              placeholder='Pilih atau ketik nama jurusan...'
            />
          </div>
        </div>

        <div className='border-t border-[var(--border-color)] pt-4 flex gap-3 justify-end items-center flex-wrap'>
          {formData.targetUniversity && (
            <button
              type='button'
              onClick={() => setIsEditing(false)}
              className='px-5 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-bold text-xs md:text-sm rounded-xl border border-[var(--border-color)] hover:bg-gray-700/20 transition-all'
            >
              Batal
            </button>
          )}
          <button
            type='submit'
            disabled={loading}
            className='px-7 py-2.5 bg-[var(--primary)] text-white font-bold text-xs md:text-sm rounded-xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-md shadow-[var(--primary)]/20'
          >
            {loading ? (
              'Menyimpan...'
            ) : (
              <>
                <FaSave /> Cari sekarang
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlanForm;
