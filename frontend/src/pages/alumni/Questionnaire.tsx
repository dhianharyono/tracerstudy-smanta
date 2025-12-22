import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  FaEdit,
  FaSpinner,
  FaUser,
  FaBriefcase,
  FaShareAlt,
  FaSave,
  FaGraduationCap,
} from 'react-icons/fa';
import Toast from '@/components/toast';
import SearchableSelect from '@/components/SearchableSelect';
import { COMMON_MAJORS, POLTEKKES_LIST } from '../constant';

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
        {required && !disabled && <span className='text-red-500'>*</span>}
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
      className={`w-full rounded-xl border border-[color:var(--border-color)] ${disabled
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
      <label className='block text-sm font-semibold text-[color:var(--text-secondary)] mb-2'>
        {label}{' '}
        {required && !disabled && <span className='text-red-500'>*</span>}
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
  isStudying: '' | 'ya' | 'tidak';
  isWorking: '' | 'ya' | 'tidak';
}

interface UniversityData {
  name: string;
  type: '' | 'negeri' | 'swasta' | 'kedinasan';
  entryYear: string;
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
  job: JobData;
  socialMedia: SocialMediaData;
}

type ValidationErrors = Record<string, string>;

interface AlumniProfile {
  questionnaireCompleted: boolean;
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
    isStudying: '',
    isWorking: '',
  },
  university: {
    name: '',
    type: '',
    entryYear: '',
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
  const [universities, setUniversities] = useState<string[]>([]);
  const [majors, setMajors] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, universitiesRes] = await Promise.all([
          axios
            .get<AlumniProfile>('/api/alumni/profile')
            .catch(() => ({ data: null })),
          axios.get<any[]>('http://universities.hipolabs.com/search?country=Indonesia'),
        ]);

        const univFromApi = universitiesRes.data.map((u: any) => u.name);
        const univList = [...new Set([...univFromApi, ...POLTEKKES_LIST])].sort() as string[];
        setUniversities(univList);
        setMajors(COMMON_MAJORS);

        if (profileRes.data?.questionnaireCompleted) {
          setIsEditMode(true);
          setIsReadOnly(true);
          const profile = profileRes.data;

          setFormData({
            profile: {
              fullName: profile.profile?.fullName || '',
              gender: (profile.profile?.gender as ProfileData['gender']) || '',
              entryYear: profile.profile?.entryYear?.toString() || '',
              graduationYear: profile.profile?.graduationYear?.toString() || '',
              lastEducation:
                (profile.profile
                  ?.lastEducation as ProfileData['lastEducation']) || '',
              isStudying: profile.profile?.isStudying
                ? 'ya'
                : profile.profile?.isStudying === false
                  ? 'tidak'
                  : '',
              isWorking: profile.profile?.isWorking
                ? 'ya'
                : profile.profile?.isWorking === false
                  ? 'tidak'
                  : '',
            },
            university: {
              name: profile.university?.name || '',
              type: (profile.university?.type as UniversityData['type']) || '',
              entryYear: profile.university?.entryYear?.toString() || '',
              major: profile.university?.major || '',
            },
            job: {
              position: profile.job?.position || '',
              institution: profile.job?.institution || '',
              jobTitle: profile.job?.jobTitle || '',
            },
            socialMedia: {
              email: profile.socialMedia?.email || '',
              linkedin: profile.socialMedia?.linkedin || '',
              instagram: profile.socialMedia?.instagram || '',
            },
          });
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string } }
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

    if (!formData.profile.fullName.trim()) {
      errors['profile.fullName'] = 'Nama lengkap wajib diisi';
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
    if (!formData.profile.lastEducation) {
      errors['profile.lastEducation'] = 'Pendidikan terakhir wajib diisi';
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
          isStudying: formData.profile.isStudying === 'ya',
          isWorking: formData.profile.isWorking === 'ya',
        },
        university:
          formData.profile.isStudying === 'ya'
            ? {
              ...formData.university,
              entryYear: formData.university.entryYear
                ? parseInt(formData.university.entryYear)
                : undefined,
            }
            : undefined,
        job: formData.profile.isWorking === 'ya' ? formData.job : undefined,
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
      Toast('Kuesioner berhasil diperbarui!', 'success');
      navigate('/alumni');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        `Failed to ${isEditMode ? 'update' : 'submit'} questionnaire`
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading || submitLoading) {
    return <LoadingSpinner />;
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
                <h3 className='text-base md:text-lg font-bold text-[color:var(--text-primary)] !mb-0'>
                  Kuesioner Selesai
                </h3>
                <p className='text-sm text-[color:var(--text-secondary)] leading-relaxed'>
                  Anda telah mengisi kuesioner. Klik tombol edit untuk
                  memperbarui data Anda.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsReadOnly(false)}
              className='flex w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--primary)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all'
            >
              <FaEdit className='text-base' />
              <span>Edit Data</span>
            </button>
          </div>
        </div>
      ) : (
        isEditMode && (
          <div className='mb-8 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'>
                <FaEdit />
              </div>
              <div>
                <h3 className='font-semibold text-blue-900 dark:text-blue-100 !mb-0 text-sm md:text-base'>
                  Mode Edit
                </h3>
                <p className='text-xs md:text-sm text-blue-700 dark:text-blue-300'>
                  Anda sedang memperbarui data kuesioner yang sudah ada.
                </p>
              </div>
            </div>
          </div>
        )
      )}

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Personal Information Card */}
        <div className='rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-6 md:p-8 shadow-lg'>
          <div className='mb-6 flex items-center gap-3 border-b border-[color:var(--border-color)] pb-4'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'>
              <FaUser className='text-xl' />
            </div>
            <h2 className='text-xl font-bold text-[color:var(--text-primary)] !mb-0'>
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

          <div className='mt-6 grid gap-6 md:grid-cols-2'>
            <div className='form-group'>
              <label className='block text-sm font-semibold text-[color:var(--text-secondary)] mb-2'>
                Status
              </label>
              <div className='space-y-4 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] p-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-[color:var(--text-primary)] w-52'>
                    Kuliah
                  </span>
                  <select
                    name='profile.isStudying'
                    value={formData.profile.isStudying}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                    disabled={isReadOnly}
                    className={`rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] px-3 py-1.5 text-sm text-[color:var(--text-primary)] focus:outline-none focus:border-[var(--primary)] ${isReadOnly
                      ? 'opacity-70 cursor-not-allowed grayscale-[0.5]'
                      : ''
                      }`}
                  >
                    <option value=''>Pilih</option>
                    <option value='ya'>Ya</option>
                    <option value='tidak'>Tidak</option>
                  </select>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-[color:var(--text-primary)] w-52'>
                    Bekerja
                  </span>
                  <select
                    name='profile.isWorking'
                    value={formData.profile.isWorking}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className={`rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] px-3 py-1.5 text-sm text-[color:var(--text-primary)] focus:outline-none focus:border-[var(--primary)] ${isReadOnly
                      ? 'opacity-70 cursor-not-allowed grayscale-[0.5]'
                      : ''
                      }`}
                  >
                    <option value=''>Pilih</option>
                    <option value='ya'>Ya</option>
                    <option value='tidak'>Tidak</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* University Section */}
        {formData.profile.isStudying === 'ya' && (
          <div className='rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-6 md:p-8 shadow-lg animate-fade-in'>
            <div className='mb-6 flex items-center gap-3 border-b border-[color:var(--border-color)] pb-4'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'>
                <FaGraduationCap className='text-xl' />
              </div>
              <h2 className='text-xl font-bold text-[color:var(--text-primary)] !mb-0'>
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
                label='Jenis PT'
                name='university.type'
                value={formData.university.type}
                onChange={handleChange}
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
        )}

        {/* Job Section */}
        {formData.profile.isWorking === 'ya' && (
          <div className='rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-6 md:p-8 shadow-lg animate-fade-in'>
            <div className='mb-6 flex items-center gap-3 border-b border-[color:var(--border-color)] pb-4'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'>
                <FaBriefcase className='text-xl' />
              </div>
              <h2 className='text-xl font-bold text-[color:var(--text-primary)] !mb-0'>
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
        )}

        {/* Social Media Section */}
        <div className='rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-6 md:p-8 shadow-lg'>
          <div className='mb-6 flex items-center gap-3 border-b border-[color:var(--border-color)] pb-4'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'>
              <FaShareAlt className='text-xl' />
            </div>
            <h2 className='text-xl font-bold text-[color:var(--text-primary)] !mb-0'>
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
          <div className='flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4'>
            <button
              type='button'
              onClick={() => {
                if (isEditMode) {
                  setIsReadOnly(true);
                } else {
                  navigate('/alumni');
                }
              }}
              className='rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] px-6 py-3.5 font-bold text-[color:var(--text-secondary)] transition-all hover:bg-[color:var(--bg-tertiary)] hover:border-[color:var(--text-tertiary)] active:scale-[0.98]'
              disabled={submitLoading}
            >
              Batal
            </button>

            <button
              type='submit'
              disabled={submitLoading}
              className='flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-blue-500 px-10 py-3.5 font-extrabold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70'
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
    </div>
  );
};

export default AlumniQuestionnaire;
