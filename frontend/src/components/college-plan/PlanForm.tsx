import { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '@/components/toast';
import {
  FaSave,
  FaLock,
  FaEdit,
  FaUniversity,
  FaGraduationCap,
  FaCheckCircle,
} from 'react-icons/fa';
import SearchableSelect from '@/components/SearchableSelect';

interface PlanFormProps {
  onUpdate: () => void;
}

const PlanForm = ({ onUpdate }: PlanFormProps) => {
  const [formData, setFormData] = useState({
    targetUniversity: '',
    targetMajor: '',
    rumpun: 'Saintek',
    entryPath: 'SNBP',
    readinessStatus: 'Yakin',
    isAnonymous: false,
  });
  const [lockCount, setLockCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(true);
  const [universityOptions, setUniversityOptions] = useState<string[]>([]);
  const [majorOptions, setMajorOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchPlan();
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [uniRes, majorRes] = await Promise.all([
        axios.get('/api/alumni/universities'),
        axios.get('/api/alumni/majors'),
      ]);

      if (Array.isArray(uniRes.data)) {
        setUniversityOptions(
          uniRes.data.map((u: any) => u.name).filter(Boolean),
        );
      }
      if (Array.isArray(majorRes.data)) {
        setMajorOptions(majorRes.data.map((m: any) => m.name).filter(Boolean));
      }
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
          rumpun: res.data.rumpun || 'Saintek',
          entryPath: res.data.entryPath || 'SNBP',
          readinessStatus: res.data.readinessStatus || 'Yakin',
          isAnonymous: res.data.isAnonymous || false,
        });
        setLockCount(res.data.lockCount || 0);
        // If plan exists, default to view mode (hide form)
        setIsEditing(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockCount >= 3) {
      Toast('Anda sudah mencapai batas maksimal perubahan data', 'error');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/student/college-plan', formData);
      Toast('Rencana kuliah berhasil disimpan', 'success');
      setLockCount((prev) => prev + 1);

      // Switch to view mode after save
      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      Toast(error.response?.data?.message || 'Gagal menyimpan', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading)
    return <div className='animate-pulse h-96 bg-gray-700 rounded-xl'></div>;

  const isLocked = lockCount >= 3;

  // View Mode (Profile Card Style)
  if (!isEditing && formData.targetUniversity) {
    return (
      <div className='bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-color)] shadow-sm animate-fade-in'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-4'>
          <div>
            <div className='text-sm md:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 mb-1'>
              <FaCheckCircle className='text-green-500' /> Rencana Kuliahmu
            </div>
            <p className='text-xs md:text-sm text-[var(--text-secondary)]'>
              Data ini telah tercatat di statistik angkatan
            </p>
          </div>
          <div className='flex items-center gap-2 text-sm font-bold bg-gray-100 dark:bg-gray-800 rounded-lg text-[var(--text-secondary)]'>
            <FaLock className={isLocked ? 'text-red-500' : 'text-green-500'} />
            <span>Edit: {lockCount}/3</span>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)]'>
          <div className='space-y-1'>
            <p className='text-xs font-bold text-[var(--text-tertiary)] uppercase'>
              Target Kampus
            </p>
            <p className='font-bold text-[var(--text-primary)] flex items-center gap-2 text-sm md:text-lg'>
              <FaUniversity className='text-[var(--primary)]' />{' '}
              {formData.targetUniversity}
            </p>
          </div>
          <div className='space-y-1'>
            <p className='text-xs font-bold text-[var(--text-tertiary)] uppercase'>
              Jurusan
            </p>
            <p className='font-bold text-[var(--text-primary)] flex items-center gap-2 text-sm md:text-lg'>
              <FaGraduationCap className='text-orange-500' />{' '}
              {formData.targetMajor}
            </p>
          </div>
          <div className='space-y-1'>
            <p className='text-xs font-bold text-[var(--text-tertiary)] uppercase'>
              Jalur & Rumpun
            </p>
            <p className='font-bold text-[var(--text-primary)] text-sm md:text-lg'>
              {formData.entryPath}{' '}
              <span className='text-[var(--text-tertiary)]'>•</span>{' '}
              {formData.rumpun}
            </p>
          </div>
          <div className='space-y-1'>
            <p className='text-xs font-bold text-[var(--text-tertiary)] uppercase'>
              Status
            </p>
            <span
              className={`inline-flex px-2 py-1 rounded text-xs font-bold ${
                formData.readinessStatus === 'Yakin'
                  ? 'bg-green-100 text-green-700'
                  : formData.readinessStatus === 'Masih Ragu'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
              }`}
            >
              {formData.readinessStatus}
            </span>
          </div>
        </div>

        <div className='mt-6 flex justify-end'>
          <button
            onClick={() => {
              if (isLocked) {
                Toast('Anda sudah mencapai batas maksimal edit', 'error');
              } else {
                setIsEditing(true);
              }
            }}
            disabled={isLocked}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isLocked
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-[var(--primary)] text-white hover:bg-opacity-90 active:scale-95'
            }`}
          >
            <FaEdit /> Edit Rencana
          </button>
        </div>
      </div>
    );
  }

  // Edit Mode
  return (
    <div className='bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-color)] shadow-sm animate-fade-in'>
      <div className='flex items-center justify-between mb-6'>
        <div className='text-sm md:text-lg font-bold text-[var(--text-primary)]'>
          {formData.targetUniversity
            ? 'Edit Rencana Kuliah'
            : 'Input Rencana Kuliah'}
        </div>
        <div className='flex gap-2'>
          <div className='flex items-center gap-2 text-xs font-bold px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-[var(--text-secondary)]'>
            <FaLock className={isLocked ? 'text-red-500' : 'text-green-500'} />
            <span>Edit: {lockCount}/3</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <SearchableSelect
              name='targetUniversity'
              label='Target PTN/PTS'
              value={formData.targetUniversity}
              options={universityOptions}
              onChange={(e) =>
                setFormData({ ...formData, targetUniversity: e.target.value })
              }
              required
              disabled={isLocked}
              placeholder='Pilih atau ketik nama kampus...'
            />
          </div>
          <div>
            <SearchableSelect
              name='targetMajor'
              label='Program Studi'
              value={formData.targetMajor}
              options={majorOptions}
              onChange={(e) =>
                setFormData({ ...formData, targetMajor: e.target.value })
              }
              required
              disabled={isLocked}
              placeholder='Pilih atau ketik jurusan...'
            />
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label className='block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-2'>
              Rumpun
            </label>
            <div className='relative'>
              <select
                value={formData.rumpun}
                onChange={(e) =>
                  setFormData({ ...formData, rumpun: e.target.value })
                }
                disabled={isLocked}
                className='w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none appearance-none'
              >
                <option value='Saintek'>Saintek</option>
                <option value='Soshum'>Soshum</option>
                <option value='Lainnya'>Lainnya</option>
              </select>
              <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-tertiary)]'>
                ▼
              </div>
            </div>
          </div>
          <div>
            <label className='block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-2'>
              Jalur Masuk
            </label>
            <div className='relative'>
              <select
                value={formData.entryPath}
                onChange={(e) =>
                  setFormData({ ...formData, entryPath: e.target.value })
                }
                disabled={isLocked}
                className='w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none appearance-none'
              >
                <option value='SNBP'>SNBP</option>
                <option value='SNBT'>SNBT</option>
                <option value='Mandiri'>Mandiri</option>
                <option value='Kedinasan'>Kedinasan</option>
                <option value='Luar Negeri'>Luar Negeri</option>
                <option value='Lainnya'>Lainnya</option>
              </select>
              <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-tertiary)]'>
                ▼
              </div>
            </div>
          </div>
          <div>
            <label className='block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-2'>
              Kesiapan
            </label>
            <div className='relative'>
              <select
                value={formData.readinessStatus}
                onChange={(e) =>
                  setFormData({ ...formData, readinessStatus: e.target.value })
                }
                disabled={isLocked}
                className='w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none appearance-none'
              >
                <option value='Yakin'>Yakin</option>
                <option value='Masih Ragu'>Masih Ragu</option>
                <option value='Hanya Cadangan'>Hanya Cadangan</option>
              </select>
              <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-tertiary)]'>
                ▼
              </div>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-3 py-2'>
          <input
            type='checkbox'
            id='anon'
            checked={formData.isAnonymous}
            onChange={(e) =>
              setFormData({ ...formData, isAnonymous: e.target.checked })
            }
            disabled={isLocked}
            className='w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]'
          />
          <label
            htmlFor='anon'
            className='text-xs md:text-sm text-[var(--text-secondary)]'
          >
            Tampilkan sebagai Anonim di daftar publik (Statistik tetap
            terhitung)
          </label>
        </div>

        {!isLocked && (
          <div className='border-t border-[var(--border-color)] mt-4 pt-4 flex gap-3 md:gap-4 justify-end'>
            <button
              type='button'
              onClick={() => {
                setIsEditing(false);
              }}
              className='px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:opacity-90 transition-opacity'
            >
              Batal
            </button>
            <button
              type='submit'
              disabled={loading}
              className='text-xs md:text-sm w-full md:w-auto px-8 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2'
            >
              {loading ? (
                'Menyimpan...'
              ) : (
                <>
                  <FaSave /> Simpan Rencana
                </>
              )}
            </button>
          </div>
        )}
        {isLocked && (
          <p className='text-xs text-red-500 font-bold mt-2'>
            Data terkunci karena sudah diedit 3 kali.
          </p>
        )}
      </form>
    </div>
  );
};

export default PlanForm;
