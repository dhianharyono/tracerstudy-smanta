import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import axios from 'axios';
import {
  FaEdit,
  FaSpinner,
  FaUser,
  FaBriefcase,
  FaShareAlt,
  FaSave,
  FaGraduationCap,
  FaInstagram,
  FaTimes,
} from 'react-icons/fa';
import html2canvas from 'html2canvas';

import Toast from '@/components/toast';
import { useAuth } from '@/contexts/AuthContext';
import SearchableSelect from '@/components/SearchableSelect';
import { COMMON_MAJORS, POLTEKKES_LIST } from '../constant';
import { INDONESIA_UNIVERSITIES } from '../universityData';
import SmartLoader from '@/components/SmartLoader';

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder = '',
  min,
  max,
  validationErrors = {},
  noMargin = false,
  disabled = false,
}: any) => (
  <div className={noMargin ? '' : 'form-group'}>
    {label && (
      <label className='block text-sm font-semibold text-[color:var(--text-secondary)] mb-2'>
        {label}{' '}
        {required && <span className='text-red-500'>*</span>}
      </label>
    )}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      min={min}
      max={max}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full rounded-xl text-xs md:text-sm border border-[color:var(--border-color)] ${disabled
        ? 'bg-[color:var(--bg-tertiary)] opacity-70 cursor-not-allowed grayscale-[0.5]'
        : 'bg-[color:var(--bg-secondary)]'
        } px-4 py-3 text-[color:var(--text-primary)] transition-all placeholder:text-[color:var(--text-tertiary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] ${validationErrors[name]
          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
          : ''
        }`}
    />
    {validationErrors[name] && (
      <span className='mt-1 text-xs text-red-500'>
        {validationErrors[name]}
      </span>
    )}
  </div>
);

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  validationErrors = {},
  disabled = false,
}: any) => (
  <div className='form-group'>
    {label && (
      <label className='block text-xs md:text-sm font-semibold text-[color:var(--text-secondary)] mb-2'>
        {label}{' '}
        {required && <span className='text-red-500'>*</span>}
      </label>
    )}
    <div className='relative'>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full appearance-none rounded-xl border border-[color:var(--border-color)] ${disabled
          ? 'bg-[color:var(--bg-tertiary)] opacity-70 cursor-not-allowed grayscale-[0.5]'
          : 'bg-[color:var(--bg-secondary)]'
          } px-4 py-3 text-[color:var(--text-primary)] transition-all focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] ${validationErrors[name]
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : ''
          }`}
      >
        <option value=''>Pilih</option>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className='pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)]'>
        <svg
          className='h-4 w-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </div>
    </div>
    {validationErrors[name] && (
      <span className='mt-1 text-xs text-red-500'>
        {validationErrors[name]}
      </span>
    )}
  </div>
);

interface ProfileData {
  fullName: string;
  gender: '' | 'male' | 'female';
  entryYear: string;
  graduationYear: string;
  lastEducation: '' | 'tidak kuliah' | 'd3' | 'd4' | 's1' | 's2' | 's3';
}

interface UniversityData {
  name: string;
  type: '' | 'negeri' | 'swasta' | 'kedinasan';
  entryYear: string;
  graduationYear: string;
  major: string;
}

interface UniversitySData {
  name: string;
  major: string;
}

interface JobData {
  position: string;
  institution: string;
  jobTitle: string;
}

interface SocialMediaData {
  email: string;
  linkedin: string;
  instagram: string;
}

interface FormData {
  profile: ProfileData;
  university: UniversityData;
  universityS2: UniversitySData;
  universityS3: UniversitySData;
  job: JobData;
  socialMedia: SocialMediaData;
}

type ValidationErrors = Record<string, string>;

interface AlumniProfile {
  questionnaireCompleted: boolean;
  email?: string;
  profile?: {
    fullName?: string;
    gender?: string;
    entryYear?: number;
    graduationYear?: number;
    lastEducation?: string;
    isStudying?: boolean;
    isWorking?: boolean;
  };
  university?: {
    name?: string;
    type?: string;
    entryYear?: number;
    graduationYear?: number;
    major?: string;
  };
  universityS2?: {
    name?: string;
    major?: string;
  };
  universityS3?: {
    name?: string;
    major?: string;
  };
  job?: {
    position?: string;
    institution?: string;
    jobTitle?: string;
  };
  socialMedia?: {
    email?: string;
    linkedin?: string;
    instagram?: string;
  };
}

const initialFormData: FormData = {
  profile: {
    fullName: '',
    gender: '',
    entryYear: '',
    graduationYear: '',
    lastEducation: '',
  },
  university: {
    name: '',
    type: '',
    entryYear: '',
    graduationYear: '',
    major: '',
  },
  universityS2: {
    name: '',
    major: '',
  },
  universityS3: {
    name: '',
    major: '',
  },
  job: {
    position: '',
    institution: '',
    jobTitle: '',
  },
  socialMedia: {
    email: '',
    linkedin: '',
    instagram: '',
  },
};

const AlumniQuestionnaire = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [universities, setUniversities] = useState<string[]>([]);
  const [majors, setMajors] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [storyImage, setStoryImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes] = await Promise.all([
          axios
            .get<AlumniProfile>('/api/alumni/profile')
            .catch(() => ({ data: null })),
        ]);

        const univList = [
          ...new Set([...INDONESIA_UNIVERSITIES, ...POLTEKKES_LIST]),
        ].sort() as string[];
        setUniversities(univList);
        setMajors(COMMON_MAJORS);

        if (profileRes.data) {
          const profile = profileRes.data;

          if (profile.questionnaireCompleted) {
            setIsEditMode(true);
            setIsReadOnly(true);

            setFormData({
              profile: {
                fullName: profile.profile?.fullName || '',
                gender: (profile.profile?.gender as ProfileData['gender']) || '',
                entryYear: profile.profile?.entryYear?.toString() || '',
                graduationYear: profile.profile?.graduationYear?.toString() || '',
                lastEducation:
                  (profile.profile
                    ?.lastEducation as ProfileData['lastEducation']) || '',
              },
              university: {
                name: profile.university?.name || '',
                type: (profile.university?.type as UniversityData['type']) || '',
                entryYear: profile.university?.entryYear?.toString() || '',
                graduationYear: profile.university?.graduationYear?.toString() || '',
                major: profile.university?.major || '',
              },
              universityS2: {
                name: profile.universityS2?.name || '',
                major: profile.universityS2?.major || '',
              },
              universityS3: {
                name: profile.universityS3?.name || '',
                major: profile.universityS3?.major || '',
              },
              job: {
                position: profile.job?.position || '',
                institution: profile.job?.institution || '',
                jobTitle: profile.job?.jobTitle || '',
              },
              socialMedia: {
                email: profile.socialMedia?.email || profile.email || '',
                linkedin: profile.socialMedia?.linkedin || '',
                instagram: profile.socialMedia?.instagram || '',
              },
            });
          } else {
            setFormData(prev => ({
              ...prev,
              socialMedia: {
                ...prev.socialMedia,
                email: profile.socialMedia?.email || profile.email || '',
              }
            }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { name: string; value: string } },
  ) => {
    const { name, value } = e.target;

    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: '',
      });
    }

    if (name.startsWith('profile.')) {
      const field = name.split('.')[1] as keyof ProfileData;
      setFormData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          [field]: value,
        },
      }));
    } else if (name.startsWith('university.')) {
      const field = name.split('.')[1] as keyof UniversityData;
      setFormData((prev) => ({
        ...prev,
        university: {
          ...prev.university,
          [field]: value,
        },
      }));
    } else if (name.startsWith('universityS2.')) {
      const field = name.split('.')[1] as keyof UniversitySData;
      setFormData((prev) => ({
        ...prev,
        universityS2: {
          ...prev.universityS2,
          [field]: value,
        },
      }));
    } else if (name.startsWith('universityS3.')) {
      const field = name.split('.')[1] as keyof UniversitySData;
      setFormData((prev) => ({
        ...prev,
        universityS3: {
          ...prev.universityS3,
          [field]: value,
        },
      }));
    } else if (name.startsWith('job.')) {
      const field = name.split('.')[1] as keyof JobData;
      setFormData((prev) => ({
        ...prev,
        job: {
          ...prev.job,
          [field]: value,
        },
      }));
    } else if (name.startsWith('socialMedia.')) {
      const field = name.split('.')[1] as keyof SocialMediaData;
      setFormData((prev) => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [field]: value,
        },
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    const placeholders = ['-', 'null', 'undefined', 'belum ada', 'tidak ada', '.'];

    if (!formData.profile.fullName.trim()) {
      errors['profile.fullName'] = 'Nama lengkap wajib diisi';
    } else if (formData.profile.fullName.trim().length < 3) {
      errors['profile.fullName'] = 'Nama lengkap minimal 3 karakter';
    } else if (!/^[a-zA-Z\s]*$/.test(formData.profile.fullName.trim())) {
      errors['profile.fullName'] =
        'Nama lengkap hanya boleh berisi huruf dan spasi';
    }

    if (!formData.profile.gender) {
      errors['profile.gender'] = 'Jenis kelamin wajib diisi';
    }
    if (!formData.profile.entryYear) {
      errors['profile.entryYear'] = 'Tahun masuk SMA wajib diisi';
    }
    if (!formData.profile.graduationYear) {
      errors['profile.graduationYear'] = 'Tahun lulus SMA wajib diisi';
    }
    
    if (!formData.university.name || placeholders.includes(formData.university.name.trim().toLowerCase())) {
      errors['university.name'] = 'Nama kampus wajib diisi dengan benar';
    }
    if (!formData.university.type) {
      errors['university.type'] = 'Jenis perguruan tinggi wajib diisi';
    }
    if (!formData.university.entryYear) {
      errors['university.entryYear'] = 'Tahun masuk kuliah wajib diisi';
    }
    if (!formData.university.major || placeholders.includes(formData.university.major.trim().toLowerCase())) {
      errors['university.major'] = 'Jurusan kuliah wajib diisi dengan benar';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    if (!validateForm()) {
      setError('Mohon lengkapi semua field yang wajib diisi');
      Toast('Mohon lengkapi semua field yang wajib diisi', 'error');
      return;
    }

    setSubmitLoading(true);

    try {
      const submitData = {
        profile: {
          ...formData.profile,
          entryYear: formData.profile.entryYear
            ? parseInt(formData.profile.entryYear)
            : undefined,
          graduationYear: formData.profile.graduationYear
            ? parseInt(formData.profile.graduationYear)
            : undefined,
          isStudying: true,
          isWorking: !!(formData.job.position || formData.job.institution || formData.job.jobTitle),
        },
        university: {
          ...formData.university,
          entryYear: formData.university.entryYear
            ? parseInt(formData.university.entryYear)
            : undefined,
          graduationYear: formData.university.graduationYear
            ? parseInt(formData.university.graduationYear)
            : undefined,
        },
        universityS2: formData.universityS2.name ? formData.universityS2 : undefined,
        universityS3: formData.universityS3.name ? formData.universityS3 : undefined,
        job: (formData.job.position || formData.job.institution || formData.job.jobTitle) ? formData.job : undefined,
        socialMedia: {
          email: formData.socialMedia.email?.trim() || undefined,
          linkedin: formData.socialMedia.linkedin?.trim() || undefined,
          instagram: formData.socialMedia.instagram?.trim() || undefined,
        },
        questionnaireCompleted: true,
      };

      if (isEditMode) {
        await axios.put('/api/alumni/questionnaire', submitData);
      } else {
        await axios.post('/api/alumni/questionnaire', submitData);
      }

      const userRes = await axios.get('/api/auth/me');
      updateUser(userRes.data);

      Toast('Kuesioner berhasil diperbarui!', 'success');
      navigate('/alumni');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        `Failed to ${isEditMode ? 'update' : 'submit'} questionnaire`,
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleShareIG = async () => {
    // Generate image first
    try {
      const element = document.getElementById('ig-story-template');
      if (element) {
        // Temporarily ensure it's visible if hidden (though we'll render it off-screen)
        element.style.display = 'flex';
        const canvas = await html2canvas(element, { backgroundColor: '#0f172a', scale: 2 });
        element.style.display = 'none';

        const imgData = canvas.toDataURL('image/png');
        setStoryImage(imgData);
        setShowStoryModal(true);
      }
    } catch (e) {
      console.error(e);
      Toast('Gagal membuat template story.', 'error');
    }
  };

  const handleDownloadStory = async () => {
    if (storyImage) {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isInstagramOrFB = /Instagram|FBAN|FBAV/i.test(userAgent);
      const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);

      const triggerFallbackDownload = () => {
        if (isInstagramOrFB || isMobile) {
          Toast('Browser ini memblokir download otomatis. Silakan TAHAN (Long-Press) gambar di atas, lalu pilih "Simpan Gambar / Save Image", kemudian upload ke IG Story Anda secara manual!', 'info');
        } else {
          // Fallback to normal download for Desktop / Standard Browsers
          const link = document.createElement('a');
          link.href = storyImage;
          link.download = 'tracer-study-smanta-story.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          Toast('Gambar berhasil diunduh! Silakan bagikan ke IG Story Anda.', 'success');
        }
      };

      if (navigator.share && !isInstagramOrFB) {
        try {
          const res = await fetch(storyImage);
          const blob = await res.blob();
          const file = new File([blob], 'tracer-study-smanta-story.png', { type: blob.type });

          await navigator.share({
            title: 'Tracer Study SMANTA',
            text: 'Saya sudah berkontribusi di Tracer Study SMANTA! Yuk teman-teman alumni lainnya ikut berkontribusi. #TracerStudySMANTA',
            files: [file],
          });
          Toast('Terima kasih sudah membagikan ke IG Story!', 'success');
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            triggerFallbackDownload();
          }
        }
      } else {
        triggerFallbackDownload();
      }
    }
  };

  if (loading || submitLoading) {
    return <SmartLoader />;
  }

  return (
    <div className='p-4 md:p-8 animate-fade-in'>
      {/* Header Section */}
      <div className='mb-8 text-center md:text-left'>
        <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
          {isEditMode ? 'Edit Kuesioner' : 'Kuesioner Tracer Study'}
        </h1>
        <p className='text-[color:var(--text-secondary)] text-xs md:text-sm'>
          Lengkapi data Anda untuk mendukung tracer study
        </p>
      </div>

      {isReadOnly ? (
        <div className='mb-8 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-5 md:p-6 shadow-lg shadow-green-500/5'>
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
            <div className='flex items-start md:items-center gap-4'>
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-500'>
                <FaGraduationCap className='text-2xl' />
              </div>
              <div className='space-y-1'>
                <h3 className='text-sm md:text-lg font-bold text-[color:var(--text-primary)] !mb-0'>
                  Kuesioner Selesai
                </h3>
                <p className='text-[10px] md:text-sm text-[color:var(--text-secondary)] leading-relaxed'>
                  Anda telah mengisi kuesioner. Klik tombol edit untuk
                  memperbarui data Anda.
                </p>
              </div>
            </div>
            <div className='flex flex-col sm:flex-row w-full md:w-auto gap-3 mt-4 md:mt-0'>
              <button
                onClick={handleShareIG}
                className='flex items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 px-6 py-3 text-xs md:text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]'
              >
                <FaInstagram className='text-base' />
                <span>Share ke IG Story</span>
              </button>
              <button
                onClick={() => setIsReadOnly(false)}
                className='flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-xs md:text-sm font-bold text-white shadow-lg shadow-[var(--primary)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all'
              >
                <FaEdit className='text-base' />
                <span>Edit Data</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        isEditMode && (
          <div className='mb-8 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10'>
            <div className='flex items-center gap-3'>
              <div className='flex h-7 w-7 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'>
                <FaEdit />
              </div>
              <div>
                <h3 className='font-semibold text-blue-900 dark:text-blue-100 !mb-0 text-sm md:text-base'>
                  Mode Edit
                </h3>
                <p className='text-[10px] md:text-sm text-blue-700 dark:text-blue-300'>
                  Anda sedang memperbarui data kuesioner yang sudah ada.
                </p>
              </div>
            </div>
          </div>
        )
      )}

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Personal Information Card */}
        <div className='relative z-10 focus-within:z-50 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-6 md:p-8 shadow-lg'>
          <div className='mb-6 flex items-center gap-3 border-b border-[color:var(--border-color)] pb-4'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'>
              <FaUser className='text-sm md:text-xl' />
            </div>
            <h2 className='text-sm md:text-xl font-bold text-[color:var(--text-primary)] !mb-0'>
              Informasi Personal
            </h2>
          </div>

          <div className='grid gap-6 md:grid-cols-2'>
            <InputField
              label='Nama Lengkap'
              name='profile.fullName'
              value={formData.profile.fullName}
              onChange={handleChange}
              required
              placeholder='Masukkan nama lengkap'
              validationErrors={validationErrors}
              disabled={isReadOnly}
            />

            <SelectField
              label='Jenis Kelamin'
              name='profile.gender'
              value={formData.profile.gender}
              onChange={handleChange}
              required
              options={[
                { value: 'male', label: 'Laki-laki' },
                { value: 'female', label: 'Perempuan' },
              ]}
              validationErrors={validationErrors}
              disabled={isReadOnly}
            />

            <InputField
              label='Tahun Masuk SMA'
              name='profile.entryYear'
              type='number'
              value={formData.profile.entryYear}
              onChange={handleChange}
              required
              min='1900'
              max={new Date().getFullYear()}
              placeholder='Ex: 2018'
              validationErrors={validationErrors}
              disabled={isReadOnly}
            />

            <InputField
              label='Tahun Lulus SMA'
              name='profile.graduationYear'
              type='number'
              value={formData.profile.graduationYear}
              onChange={handleChange}
              required
              min='1900'
              max={new Date().getFullYear()}
              placeholder='Ex: 2021'
              validationErrors={validationErrors}
              disabled={isReadOnly}
            />

            <SelectField
              label='Pendidikan Terakhir'
              name='profile.lastEducation'
              value={formData.profile.lastEducation}
              onChange={handleChange}
              required
              options={[
                { value: 'sma', label: 'SMA' },
                { value: 'd3', label: 'D3' },
                { value: 'd4', label: 'D4' },
                { value: 's1', label: 'S1' },
                { value: 's2', label: 'S2' },
                { value: 's3', label: 'S3' },
              ]}
              validationErrors={validationErrors}
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* University Section */}
        <div className='relative z-10 focus-within:z-50 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-6 md:p-8 shadow-lg animate-fade-in'>
          <div className='mb-6 flex items-center gap-3 border-b border-[color:var(--border-color)] pb-4'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'>
              <FaGraduationCap className='text-sm md:text-xl' />
            </div>
            <h2 className='text-sm md:text-xl font-bold text-[color:var(--text-primary)] !mb-0'>
              Data Perguruan Tinggi
            </h2>
          </div>

          <div className='grid gap-6 md:grid-cols-2'>
            <SearchableSelect
              label='Nama Kampus'
              name='university.name'
              value={formData.university.name}
              options={universities}
              onChange={handleChange}
              required
              placeholder='Pilih atau cari nama kampus...'
              disabled={isReadOnly}
              validationErrors={validationErrors}
            />

            <SelectField
              label='Jenis Perguruan Tinggi'
              name='university.type'
              value={formData.university.type}
              onChange={handleChange}
              required
              options={[
                { value: 'negeri', label: 'Negeri' },
                { value: 'swasta', label: 'Swasta' },
                { value: 'kedinasan', label: 'Kedinasan' },
              ]}
              validationErrors={validationErrors}
              disabled={isReadOnly}
            />

            <InputField
              label='Tahun Masuk'
              name='university.entryYear'
              type='number'
              value={formData.university.entryYear}
              onChange={handleChange}
              min='1900'
              max={new Date().getFullYear()}
              placeholder='Ex: 2021'
              validationErrors={validationErrors}
              disabled={isReadOnly}
              required
            />

            <InputField
              label='Tahun Lulus (Opsional)'
              name='university.graduationYear'
              type='number'
              value={formData.university.graduationYear}
              onChange={handleChange}
              min='1900'
              max={new Date().getFullYear() + 10}
              placeholder='Ex: 2025'
              validationErrors={validationErrors}
              disabled={isReadOnly}
            />

            <SearchableSelect
              label='Jurusan'
              name='university.major'
              value={formData.university.major}
              options={majors}
              onChange={handleChange}
              required
              placeholder='Pilih atau cari jurusan...'
              disabled={isReadOnly}
              validationErrors={validationErrors}
            />
          </div>
        </div>

        {/* S2 University Section */}
        {['s2', 's3'].includes(formData.profile.lastEducation) && (
          <div className='relative z-10 focus-within:z-50 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-6 md:p-8 shadow-lg animate-fade-in'>
            <div className='mb-6 flex items-center gap-3 border-b border-[color:var(--border-color)] pb-4'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'>
                <FaGraduationCap className='text-sm md:text-xl' />
              </div>
              <h2 className='text-sm md:text-xl font-bold text-[color:var(--text-primary)] !mb-0'>
                Data Perguruan Tinggi (S2)
              </h2>
            </div>

            <div className='grid gap-6 md:grid-cols-2'>
              <SearchableSelect
                label='Nama Kampus S2'
                name='universityS2.name'
                value={formData.universityS2.name}
                options={universities}
                onChange={handleChange}
                placeholder='Pilih atau cari nama kampus...'
                disabled={isReadOnly}
                validationErrors={validationErrors}
              />
              <SearchableSelect
                label='Jurusan S2'
                name='universityS2.major'
                value={formData.universityS2.major}
                options={majors}
                onChange={handleChange}
                placeholder='Pilih atau cari jurusan...'
                disabled={isReadOnly}
                validationErrors={validationErrors}
              />
            </div>
          </div>
        )}

        {/* S3 University Section */}
        {formData.profile.lastEducation === 's3' && (
          <div className='relative z-10 focus-within:z-50 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-6 md:p-8 shadow-lg animate-fade-in'>
            <div className='mb-6 flex items-center gap-3 border-b border-[color:var(--border-color)] pb-4'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'>
                <FaGraduationCap className='text-sm md:text-xl' />
              </div>
              <h2 className='text-sm md:text-xl font-bold text-[color:var(--text-primary)] !mb-0'>
                Data Perguruan Tinggi (S3)
              </h2>
            </div>

            <div className='grid gap-6 md:grid-cols-2'>
              <SearchableSelect
                label='Nama Kampus S3'
                name='universityS3.name'
                value={formData.universityS3.name}
                options={universities}
                onChange={handleChange}
                placeholder='Pilih atau cari nama kampus...'
                disabled={isReadOnly}
                validationErrors={validationErrors}
              />
              <SearchableSelect
                label='Jurusan S3'
                name='universityS3.major'
                value={formData.universityS3.major}
                options={majors}
                onChange={handleChange}
                placeholder='Pilih atau cari jurusan...'
                disabled={isReadOnly}
                validationErrors={validationErrors}
              />
            </div>
          </div>
        )}

        {/* Job Section */}
        <div className='relative z-10 focus-within:z-50 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-6 md:p-8 shadow-lg animate-fade-in'>
          <div className='mb-6 flex items-center gap-3 border-b border-[color:var(--border-color)] pb-4'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'>
              <FaBriefcase className='text-sm md:text-xl' />
            </div>
            <h2 className='text-sm md:text-xl font-bold text-[color:var(--text-primary)] !mb-0'>
              Data Pekerjaan
            </h2>
          </div>

          <div className='grid gap-6 md:grid-cols-2'>
            <InputField
              label='Posisi/Jabatan'
              name='job.position'
              value={formData.job.position}
              onChange={handleChange}
              placeholder='Ex: Staff IT'
              validationErrors={validationErrors}
              disabled={isReadOnly}
            />
            <InputField
              label='Nama Instansi/Perusahaan'
              name='job.institution'
              value={formData.job.institution}
              onChange={handleChange}
              placeholder='Ex: PT. Maju Jaya'
              validationErrors={validationErrors}
              disabled={isReadOnly}
            />
            <InputField
              label='Nama Pekerjaan'
              name='job.jobTitle'
              value={formData.job.jobTitle}
              onChange={handleChange}
              placeholder='Ex: Web Developer'
              validationErrors={validationErrors}
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* Social Media Section */}
        <div className='relative z-10 focus-within:z-50 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-6 md:p-8 shadow-lg'>
          <div className='mb-6 flex items-center gap-3 border-b border-[color:var(--border-color)] pb-4'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'>
              <FaShareAlt className='text-sm md:text-xl' />
            </div>
            <h2 className='text-sm md:text-xl font-bold text-[color:var(--text-primary)] !mb-0'>
              Media Sosial
            </h2>
          </div>

          <div className='grid gap-6 md:grid-cols-2'>
            <InputField
              label='Email'
              name='socialMedia.email'
              type='email'
              value={formData.socialMedia.email}
              onChange={handleChange}
              placeholder='nama@email.com'
              validationErrors={validationErrors}
              disabled={isReadOnly}
            />
            <InputField
              label='LinkedIn (URL/Username)'
              name='socialMedia.linkedin'
              value={formData.socialMedia.linkedin}
              onChange={handleChange}
              placeholder='linkedin.com/in/username'
              validationErrors={validationErrors}
              disabled={isReadOnly}
            />
            <InputField
              label='Instagram (URL/Username)'
              name='socialMedia.instagram'
              value={formData.socialMedia.instagram}
              onChange={handleChange}
              placeholder='@username'
              validationErrors={validationErrors}
              disabled={isReadOnly}
            />
          </div>
        </div>

        {error && (
          <div className='rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400'>
            <p className='font-semibold'>{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        {!isReadOnly && (
          <div className='flex sm:flex-row justify-center md:justify-end gap-3 sm:gap-4'>
            <button
              type='button'
              onClick={() => {
                if (isEditMode) {
                  setIsReadOnly(true);
                } else {
                  navigate('/alumni');
                }
              }}
              className='text-sm rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] px-6 py-3.5 font-bold text-[color:var(--text-secondary)] transition-all hover:bg-[color:var(--bg-tertiary)] hover:border-[color:var(--text-tertiary)] active:scale-[0.98]'
              disabled={submitLoading}
            >
              Batal
            </button>

            <button
              type='submit'
              disabled={submitLoading}
              className='flex text-xs md:text-sm items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-blue-500 px-10 py-3.5 font-extrabold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70'
            >
              {submitLoading ? (
                <>
                  <FaSpinner className='animate-spin' />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>
                    {isEditMode ? 'Simpan Perubahan' : 'Kirim Kuesioner'}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </form>

      <div
        id="ig-story-template"
        className="fixed top-[-9999px] left-[-9999px] w-[1080px] h-[1920px] bg-[#0f172a] text-white flex flex-col justify-center items-center overflow-hidden"
        style={{ display: 'none', background: '#0f172a' }}
      >
        {/* Background Decorative */}
        <div className="absolute inset-0 w-[1080px] h-[1920px] overflow-hidden pointer-events-none flex justify-center items-center">
          <div className="absolute top-[-200px] right-[-200px] w-[800px] h-[800px] bg-blue-600 rounded-full blur-[200px] opacity-20"></div>
          <div className="absolute bottom-[-200px] left-[-200px] w-[800px] h-[800px] bg-purple-600 rounded-full blur-[200px] opacity-20"></div>
        </div>

        <div className="relative z-10 w-full h-[1920px] flex flex-col items-center justify-center p-20 text-center">

          {/* Certificate Card */}
          <div className="bg-[#1e293b]/90 border-[3px] border-blue-500/40 rounded-[4rem] w-full p-20 shadow-[0_0_80px_rgba(59,130,246,0.2)] relative flex flex-col items-center justify-center mx-auto my-auto">

            {/* Subtle inner border */}
            <div className="absolute inset-6 border border-blue-400/20 rounded-[3rem] pointer-events-none"></div>

            {/* Logo */}
            <div className="w-48 h-48 bg-[#0f172a] p-8 rounded-full border-4 border-blue-500/30 flex items-center justify-center mb-10 mx-auto shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <img src="/logo.png" alt="Logo SMANTA" className="w-full h-full object-contain mx-auto" />
            </div>

            <h1 className="text-3xl font-bold tracking-[0.3em] text-blue-400 uppercase mb-12 text-center w-full mx-auto">
              Tracer Study Smanta
            </h1>

            <div className="w-64 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mb-16"></div>

            <h2 className="text-[5.5rem] font-black text-white mb-4 uppercase tracking-widest text-center w-full mx-auto" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
              CERTIFICATE
            </h2>
            <h3 className="text-4xl font-light text-blue-200 tracking-[0.4em] mb-20 text-center w-full mx-auto">
              OF APPRECIATION
            </h3>

            <p className="text-3xl text-gray-400 font-medium mb-12 text-center w-full mx-auto">
              Diberikan dengan bangga kepada:
            </p>

            <div className="bg-[#0f172a]/50 px-16 py-10 rounded-[3rem] border border-blue-500/20 mb-16 w-full max-w-[85%] mx-auto flex flex-col items-center justify-center">
              <p className="text-6xl font-black text-white text-center w-full m-0 p-0 leading-normal flex items-center justify-center">
                {formData.profile.fullName || 'Alumni SMANTA'}
              </p>
            </div>

            <p className="text-3xl text-gray-300 leading-[1.6] max-w-[90%] mx-auto opacity-90 mb-16 text-center w-full">
              Atas kontribusi positif dan partisipasinya dalam membangun database <span className="text-blue-300 font-bold">Tracer Study SMANTA.</span><br />
              Semoga jejak ini menjadi inspirasi bagi generasi selanjutnya.
            </p>
          </div>

        </div>
      </div>

      {/* Story Preview Modal */}
      {showStoryModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" style={{ zIndex: 99999 }}>
          <div className="bg-[color:var(--bg-card)] rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-fade-in flex flex-col max-h-[90vh]">
            <button
              onClick={() => setShowStoryModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-[color:var(--bg-tertiary)] hover:bg-red-500 hover:text-white rounded-full transition-colors"
            >
              <FaTimes />
            </button>
            <h3 className="text-lg font-bold text-[color:var(--text-primary)] mb-4 text-center mt-2">
              Template IG Story Anda
            </h3>

            <div className="flex-1 overflow-y-auto rounded-2xl border-2 border-[color:var(--border-color)] relative">
              {storyImage ? (
                <img src={storyImage} alt="IG Story Preview" className="w-full h-auto" />
              ) : (
                <div className="flex items-center justify-center h-full w-full py-20">
                  <div className="animate-spin text-[var(--primary)] text-4xl">
                    <FaSpinner />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={handleDownloadStory}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-4 text-sm font-bold text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <FaInstagram className="text-lg" />
                <span>Bagikan ke IG Story</span>
              </button>
              <p className="text-xs text-center text-[color:var(--text-tertiary)] px-4">
                Gambar ini akan dibagikan ke Instagram Story Anda. Jangan lupa tambahkan Link Sticker <span className="font-bold text-[color:var(--text-secondary)]">https://tracerstudy-smanta.com</span>!
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AlumniQuestionnaire;
