import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaSave, FaSpinner, FaUser } from 'react-icons/fa';
import { GiGraduateCap } from 'react-icons/gi';
import { PiBagSimpleFill } from 'react-icons/pi';
import { IoPhonePortrait } from 'react-icons/io5';
import { toast } from 'react-toastify';

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
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [showManualUniversityInput, setShowManualUniversityInput] =
    useState(false);
  const [showManualMajorInput, setShowManualMajorInput] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, universitiesRes, majorsRes] = await Promise.all([
          axios
            .get<AlumniProfile>('/api/alumni/profile')
            .catch(() => ({ data: null })),
          axios.get<string[]>('/api/alumni/universities'),
          axios.get<string[]>('/api/alumni/majors'),
        ]);

        setUniversities(universitiesRes.data);
        setMajors(majorsRes.data);

        if (profileRes.data?.questionnaireCompleted) {
          setIsEditMode(true);
          const profile = profileRes.data;

          if (
            profile.university?.name &&
            !universitiesRes.data.includes(profile.university.name)
          ) {
            setShowManualUniversityInput(true);
          }
          if (
            profile.university?.major &&
            !majorsRes.data.includes(profile.university.major)
          ) {
            setShowManualMajorInput(true);
          }

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
        setInitialLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
      return;
    }

    setLoading(true);

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
      toast.success('Kuesioner berhasil diperbarui!');
      navigate('/alumni');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          `Failed to ${isEditMode ? 'update' : 'submit'} questionnaire`
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className='flex items-center justify-center h-[calc(100vh-64px)]'>
        <div className='flex items-center gap-3 text-lg font-medium text-gray-400'>
          <FaSpinner className='animate-spin text-xl' />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  const baseInputClass =
    'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500';
  const baseLabelClass =
    'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
  const formGroupClass = 'mb-4';
  const validationErrorClass = 'text-red-500 text-sm mt-1 block';

  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='mb-6'>
        <h1 className='text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white'>
          {isEditMode
            ? 'Edit Kuesioner Tracer Study'
            : 'Kuesioner Tracer Study'}
        </h1>
      </div>
      {isEditMode && (
        <div
          className='mb-6 p-4 rounded-lg shadow-md'
          style={{
            background:
              'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
            border: '2px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <div className='flex items-center gap-3'>
            <div>
              <h3 className='text-lg flex gap-2 items-center font-semibold mb-1 text-gray-900 dark:text-white'>
                <FaEdit />
                <span>Mode Edit</span>
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Anda sedang mengedit data kuesioner yang sudah ada. Perubahan
                akan memperbarui data Anda.
              </p>
            </div>
          </div>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className='bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8'
      >
        <h2 className='mb-6 text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-3 border-b pb-3 border-gray-200 dark:border-gray-700'>
          <FaUser
            style={{ fontSize: '25px', color: 'rgba(102, 126, 234, 0.2)' }}
          />
          <span>Informasi Personal</span>
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4'>
          <div className={formGroupClass}>
            <label className={baseLabelClass}>Nama Lengkap *</label>
            <input
              type='text'
              name='profile.fullName'
              value={formData.profile.fullName}
              onChange={handleChange}
              required
              className={baseInputClass}
            />
            {validationErrors['profile.fullName'] && (
              <span className={validationErrorClass}>
                {validationErrors['profile.fullName']}
              </span>
            )}
          </div>
          <div className={formGroupClass}>
            <label className={baseLabelClass}>Jenis Kelamin *</label>
            <select
              name='profile.gender'
              value={formData.profile.gender}
              onChange={handleChange}
              required
              className={baseInputClass}
            >
              <option value=''>Pilih</option>
              <option value='male'>Laki-laki</option>
              <option value='female'>Perempuan</option>
            </select>
            {validationErrors['profile.gender'] && (
              <span className={validationErrorClass}>
                {validationErrors['profile.gender']}
              </span>
            )}
          </div>
          <div className={formGroupClass}>
            <label className={baseLabelClass}>Tahun Masuk SMA *</label>
            <input
              type='number'
              name='profile.entryYear'
              value={formData.profile.entryYear}
              onChange={handleChange}
              required
              className={baseInputClass}
              min='1900'
              max={new Date().getFullYear().toString()}
              placeholder='Contoh: 2012'
            />
            {validationErrors['profile.entryYear'] && (
              <span className={validationErrorClass}>
                {validationErrors['profile.entryYear']}
              </span>
            )}
          </div>
          <div className={formGroupClass}>
            <label className={baseLabelClass}>Tahun Lulus SMA *</label>
            <input
              type='number'
              name='profile.graduationYear'
              value={formData.profile.graduationYear}
              onChange={handleChange}
              required
              className={baseInputClass}
              min='1900'
              max={new Date().getFullYear().toString()}
              placeholder='Contoh: 2015'
            />
            {validationErrors['profile.graduationYear'] && (
              <span className={validationErrorClass}>
                {validationErrors['profile.graduationYear']}
              </span>
            )}
          </div>
          <div className={formGroupClass}>
            <label className={baseLabelClass}>Pendidikan Terakhir *</label>
            <select
              name='profile.lastEducation'
              value={formData.profile.lastEducation}
              onChange={handleChange}
              required
              className={baseInputClass}
            >
              <option value=''>Pilih</option>
              <option value='tidak kuliah'>Tidak Kuliah</option>
              <option value='d3'>D3</option>
              <option value='d4'>D4</option>
              <option value='s1'>S1</option>
              <option value='s2'>S2</option>
              <option value='s3'>S3</option>
            </select>
            {validationErrors['profile.lastEducation'] && (
              <span className={validationErrorClass}>
                {validationErrors['profile.lastEducation']}
              </span>
            )}
          </div>
          <div className={formGroupClass}>
            <label className={baseLabelClass}>Kuliah</label>
            <select
              name='profile.isStudying'
              value={formData.profile.isStudying}
              onChange={(e) => {
                handleChange(e);
                if (e.target.value !== 'ya') {
                  setShowManualUniversityInput(false);
                  setShowManualMajorInput(false);
                }
              }}
              className={baseInputClass}
            >
              <option value=''>Pilih</option>
              <option value='ya'>Ya</option>
              <option value='tidak'>Tidak</option>
            </select>
          </div>
          <div className={formGroupClass}>
            <label className={baseLabelClass}>Bekerja</label>
            <select
              name='profile.isWorking'
              value={formData.profile.isWorking}
              onChange={handleChange}
              className={baseInputClass}
            >
              <option value=''>Pilih</option>
              <option value='ya'>Ya</option>
              <option value='tidak'>Tidak</option>
            </select>
          </div>
        </div>

        {formData.profile.isStudying === 'ya' && (
          <>
            <h2 className='mb-6 mt-8 text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-3 border-b pb-3 border-gray-200 dark:border-gray-700'>
              <GiGraduateCap
                style={{ fontSize: '30px', color: 'rgba(102, 126, 234, 0.2)' }}
              />
              <span>Informasi Perguruan Tinggi</span>
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4'>
              <div className={formGroupClass}>
                <label className={baseLabelClass}>Nama Kampus</label>
                {!showManualUniversityInput ? (
                  <>
                    <select
                      name='university.name'
                      value={
                        universities.includes(formData.university.name)
                          ? formData.university.name
                          : ''
                      }
                      onChange={(e) => {
                        if (e.target.value === 'other') {
                          setShowManualUniversityInput(true);
                          setFormData((prev) => ({
                            ...prev,
                            university: { ...prev.university, name: '' },
                          }));
                        } else {
                          handleChange(e);
                        }
                      }}
                      className={baseInputClass}
                    >
                      <option value=''>Pilih Kampus</option>
                      {universities.map((univ) => (
                        <option key={univ} value={univ}>
                          {univ}
                        </option>
                      ))}
                      <option value='other'>Lainnya (tulis manual)</option>
                    </select>
                  </>
                ) : (
                  <>
                    <input
                      type='text'
                      name='university.name'
                      value={formData.university.name}
                      onChange={handleChange}
                      placeholder='Tulis nama kampus'
                      className={baseInputClass}
                    />
                    <button
                      type='button'
                      onClick={() => {
                        setShowManualUniversityInput(false);
                        setFormData((prev) => ({
                          ...prev,
                          university: { ...prev.university, name: '' },
                        }));
                      }}
                      className='mt-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600'
                    >
                      Pilih dari Daftar
                    </button>
                  </>
                )}
              </div>
              <div className={formGroupClass}>
                <label className={baseLabelClass}>Jenis Perguruan Tinggi</label>
                <select
                  name='university.type'
                  value={formData.university.type}
                  onChange={handleChange}
                  className={baseInputClass}
                >
                  <option value=''>Pilih</option>
                  <option value='negeri'>Negeri</option>
                  <option value='swasta'>Swasta</option>
                  <option value='kedinasan'>Kedinasan</option>
                </select>
              </div>
              <div className={formGroupClass}>
                <label className={baseLabelClass}>Tahun Masuk</label>
                <input
                  type='number'
                  name='university.entryYear'
                  value={formData.university.entryYear}
                  onChange={handleChange}
                  className={baseInputClass}
                  min='1900'
                  max={new Date().getFullYear().toString()}
                  placeholder='Contoh: 2015'
                />
              </div>
              <div className={formGroupClass}>
                <label className={baseLabelClass}>Jurusan</label>
                {!showManualMajorInput ? (
                  <>
                    <select
                      name='university.major'
                      value={
                        majors.includes(formData.university.major)
                          ? formData.university.major
                          : ''
                      }
                      onChange={(e) => {
                        if (e.target.value === 'other') {
                          setShowManualMajorInput(true);
                          setFormData((prev) => ({
                            ...prev,
                            university: { ...prev.university, major: '' },
                          }));
                        } else {
                          handleChange(e);
                        }
                      }}
                      className={baseInputClass}
                    >
                      <option value=''>Pilih Jurusan</option>
                      {majors.map((major) => (
                        <option key={major} value={major}>
                          {major}
                        </option>
                      ))}
                      <option value='other'>Lainnya (tulis manual)</option>
                    </select>
                  </>
                ) : (
                  <>
                    <input
                      type='text'
                      name='university.major'
                      value={formData.university.major}
                      onChange={handleChange}
                      placeholder='Tulis nama jurusan'
                      className={baseInputClass}
                    />
                    <button
                      type='button'
                      onClick={() => {
                        setShowManualMajorInput(false);
                        setFormData((prev) => ({
                          ...prev,
                          university: { ...prev.university, major: '' },
                        }));
                      }}
                      className='mt-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600'
                    >
                      Pilih dari Daftar
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {formData.profile.isWorking === 'ya' && (
          <>
            <h2 className='mb-6 mt-8 text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-3 border-b pb-3 border-gray-200 dark:border-gray-700'>
              <PiBagSimpleFill
                style={{ fontSize: '25px', color: 'rgba(102, 126, 234, 0.2)' }}
              />
              <span>Informasi Pekerjaan</span>
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4'>
              <div className={formGroupClass}>
                <label className={baseLabelClass}>Posisi/Jabatan</label>
                <input
                  type='text'
                  name='job.position'
                  value={formData.job.position}
                  onChange={handleChange}
                  className={baseInputClass}
                />
              </div>
              <div className={formGroupClass}>
                <label className={baseLabelClass}>Instansi</label>
                <input
                  type='text'
                  name='job.institution'
                  value={formData.job.institution}
                  onChange={handleChange}
                  className={baseInputClass}
                />
              </div>
              <div className={formGroupClass}>
                <label className={baseLabelClass}>Nama Pekerjaan</label>
                <input
                  type='text'
                  name='job.jobTitle'
                  value={formData.job.jobTitle}
                  onChange={handleChange}
                  className={baseInputClass}
                />
              </div>
            </div>
          </>
        )}

        <h2 className='mb-6 mt-8 text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-3 border-b pb-3 border-gray-200 dark:border-gray-700'>
          <IoPhonePortrait
            style={{ fontSize: '30px', color: 'rgba(102, 126, 234, 0.2)' }}
          />
          <span>Media Sosial</span>
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4'>
          <div className={formGroupClass}>
            <label className={baseLabelClass}>Email</label>
            <input
              type='email'
              name='socialMedia.email'
              value={formData.socialMedia.email}
              onChange={handleChange}
              className={baseInputClass}
              placeholder='youremail@gmail.com'
            />
          </div>
          <div className={formGroupClass}>
            <label className={baseLabelClass}>LinkedIn</label>
            <input
              type='text'
              name='socialMedia.linkedin'
              value={formData.socialMedia.linkedin}
              onChange={handleChange}
              className={baseInputClass}
              placeholder='https://www.linkedin.com/in/your-username'
            />
          </div>
          <div className={formGroupClass}>
            <label className={baseLabelClass}>Instagram</label>
            <input
              type='text'
              name='socialMedia.instagram'
              value={formData.socialMedia.instagram}
              onChange={handleChange}
              className={baseInputClass}
              placeholder='https://www.instagram.com/your-username'
            />
          </div>
        </div>

        {error && (
          <div className='mt-6 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-400 dark:border-red-700 rounded-md flex items-center gap-2'>
            <span className='font-bold'>⚠️</span> <span>{error}</span>
          </div>
        )}
        <div className='flex gap-3 justify-end mt-8 flex-wrap'>
          <button
            type='button'
            className='px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out'
            onClick={() => navigate('/alumni')}
            disabled={loading}
          >
            Batal
          </button>
          <button
            type='submit'
            className='min-w-[200px] px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50 flex items-center justify-center gap-2'
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className='animate-spin' />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <FaSave />
                <span>
                  {isEditMode ? 'Update Kuesioner' : 'Simpan Kuesioner'}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AlumniQuestionnaire;
