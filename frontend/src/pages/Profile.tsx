import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import axios from 'axios';
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaIdBadge,
  FaSave,
  FaEyeSlash,
  FaEye,
  FaGraduationCap,
} from 'react-icons/fa';
import Toast from '@/components/toast';
import { useAuth } from '@/contexts/AuthContext';
import SmartLoader from '@/components/SmartLoader';

interface ProfileProps {
  isModal?: boolean;
  onClose?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ isModal = false, onClose }) => {
  const { updateUser, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!user);
  const [saving, setSaving] = useState(false);

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [fullName, setFullName] = useState(user?.profile?.fullName || '');
  const [entryYear, setEntryYear] = useState<number | ''>(
    user?.profile?.entryYear || '',
  );
  const [graduationYear, setGraduationYear] = useState<number | ''>(
    user?.profile?.graduationYear || '',
  );
  const [savedGraduationYear, setSavedGraduationYear] = useState<number | null>(
    user?.profile?.graduationYear || null,
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showGraduationModal, setShowGraduationModal] = useState(false);
  const [graduating, setGraduating] = useState(false);
  const [isMentor, setIsMentor] = useState(user?.isMentor || false);
  const [hasUniversityData, setHasUniversityData] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/users/profile');
      setUsername(response.data.username || '');
      setEmail(response.data.email || '');
      setFullName(response.data.profile?.fullName || '');
      setEntryYear(response.data.profile?.entryYear || '');
      setGraduationYear(response.data.profile?.graduationYear || '');
      setSavedGraduationYear(response.data.profile?.graduationYear || null);
      setIsMentor(response.data.isMentor || false);
      setHasUniversityData(!!response.data.university?.name);
    } catch (error) {
      console.error('Error fetching profile:', error);
      Toast('Gagal mengambil data profil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Field validation
    const fullNameTrimmed = fullName.trim();
    if (!fullNameTrimmed) {
      Toast('Nama lengkap wajib diisi', 'error');
      return;
    }
    if (fullNameTrimmed.length < 3) {
      Toast('Nama lengkap terlalu pendek (minimal 3 karakter)', 'error');
      return;
    }
    // Only allow letters, spaces, and basic punctuation (dot, apostrophe)
    if (!/^[a-zA-Z\s.']+$/.test(fullNameTrimmed)) {
      Toast('Nama lengkap hanya boleh berisi huruf', 'error');
      return;
    }
    // Block common placeholder patterns like "...", "---", etc.
    if (/^[.\-_ \s]+$/.test(fullNameTrimmed) || fullNameTrimmed.toLowerCase() === 'null' || fullNameTrimmed.toLowerCase() === 'undefined') {
      Toast('Nama lengkap tidak valid', 'error');
      return;
    }
    if (!username.trim()) {
      Toast('Username wajib diisi', 'error');
      return;
    }
    if (!email.trim()) {
      Toast('Email wajib diisi', 'error');
      return;
    }

    if (user?.role !== 'admin' && user?.role !== 'school') {
      if (!entryYear) {
        Toast('Tahun masuk wajib diisi', 'error');
        return;
      }
      if (!graduationYear) {
        Toast('Tahun lulus wajib diisi', 'error');
        return;
      }
    }

    if (password && password !== confirmPassword) {
      Toast('Password tidak cocok', 'error');
      return;
    }

    setSaving(true);
    try {
      const updateData: any = {
        username,
        email,
        profile: {
          fullName,
          entryYear: entryYear || undefined,
          graduationYear: graduationYear || undefined,
        },
        isMentor: user?.role === 'alumni' ? isMentor : undefined,
      };

      if (password) {
        updateData.password = password;
      }

      const response = await axios.put('/api/users/profile', updateData);
      updateUser(response.data);
      if (response.data?.isHidden) {
        Toast('Profil berhasil diperbarui. Akses Anda tetap dibatasi hingga disetujui kembali oleh Administrator.', 'info');
      } else {
        Toast('Profil berhasil diperbarui', 'success');
      }
      setPassword('');
      setConfirmPassword('');
      setShowPasswordFields(false);

      setSavedGraduationYear(
        typeof graduationYear === 'number' ? graduationYear : null,
      );

      if ((user?.role as string) === 'student') {
        setTimeout(() => {
          navigate('/student');
        }, 1500);
      } else {
        fetchProfile();
      }

      if (isModal && onClose) {
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Toast(
        error.response?.data?.message || 'Gagal memperbarui profil',
        'error',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleGraduation = async () => {
    if (!graduationYear) {
      Toast('Harap isi tahun lulus terlebih dahulu', 'error');
      return;
    }

    setGraduating(true);
    try {
      await axios.post('/api/users/graduate');
      Toast(
        'Selamat! Akun Anda telah dikonversi menjadi akun alumni',
        'success',
      );
      setTimeout(() => {
        window.location.href = '/alumni';
      }, 1500);
    } catch (error: any) {
      console.error('Error graduating:', error);
      Toast(
        error.response?.data?.message || 'Gagal mengkonversi akun',
        'error',
      );
    } finally {
      setGraduating(false);
      setShowGraduationModal(false);
    }
  };

  if (loading) {
    if (isModal) {
      return (
        <div className='flex flex-col items-center justify-center py-20 sm:py-28'>
          <div className='relative animate-bounce mb-3'>
            <img
              src='/logo.png'
              alt='Loading...'
              className='w-12 h-12 object-contain'
            />
          </div>
          <p className='text-xs font-medium text-slate-400 animate-pulse'>
            Memuat data profil...
          </p>
        </div>
      );
    }
    return <SmartLoader />;
  }

  return (
    <div className={isModal ? 'animate-fade-in' : 'p-4 md:p-8 animate-fade-in'}>
      {!isModal && (
        <div className='mb-8 text-center md:text-left'>
          <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
            Profil Pengguna
          </h1>
          <p className='text-[color:var(--text-secondary)] text-xs md:text-sm'>
            Kelola data diri dan password akun Anda
          </p>
        </div>
      )}

      <form onSubmit={handleUpdateProfile} className='flex flex-col min-h-full'>
        <div className={isModal ? 'p-6 sm:p-8 space-y-6 flex-1' : 'space-y-6 flex-1'}>
          {/* Mentorship Status for Alumni */}
          {user?.role === 'alumni' && hasUniversityData && (
            <div className='relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-lg border border-indigo-500/30 p-5 sm:p-6 transition-all'>
              {/* Background Glow */}
              <div className='absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-blue-500/15 blur-3xl pointer-events-none' />
              <div className='absolute bottom-0 left-0 -ml-16 -mb-16 h-36 w-36 rounded-full bg-purple-500/15 blur-2xl pointer-events-none' />

              <div className='relative flex flex-col sm:flex-row sm:items-center justify-between gap-5'>
                <div className='flex items-start gap-4'>
                  <div className='flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 shadow-inner backdrop-blur-md border border-white/15'>
                    <FaGraduationCap className='text-2xl sm:text-3xl text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]' />
                  </div>
                  <div className='space-y-1 max-w-xl'>
                    <div className='flex items-center gap-2'>
                      <h3 className='text-sm sm:text-base font-bold text-white tracking-tight !mb-0'>
                        Status Mentorship
                      </h3>
                    </div>
                    <p className='text-indigo-100/85 text-xs sm:text-sm leading-relaxed font-normal'>
                      {isMentor
                        ? 'Profil Anda aktif sebagai Mentor dan dapat membimbing adik kelas dalam pemilihan jurusan dan dunia perkuliahan.'
                        : 'Aktifkan status mentor jika Anda bersedia memberikan bimbingan dan berbagi pengalaman kampus kepada siswa.'}
                    </p>
                  </div>
                </div>

                <div className='flex items-center justify-between sm:justify-end gap-4 bg-white/10 rounded-2xl px-4 py-3 backdrop-blur-md border border-white/10 shrink-0 self-stretch sm:self-center min-w-[180px]'>
                  <div className='text-left sm:text-right'>
                    <span
                      className={`block text-xs sm:text-sm font-bold ${
                        isMentor ? 'text-amber-300' : 'text-indigo-200'
                      }`}
                    >
                      {isMentor ? 'Aktif' : 'Nonaktif'}
                    </span>
                    <span className='text-[11px] text-indigo-300 font-medium whitespace-nowrap block'>
                      {isMentor ? 'Siap membimbing' : 'Geser untuk aktifkan'}
                    </span>
                  </div>

                  <button
                    type='button'
                    onClick={() => setIsMentor(!isMentor)}
                    className={`relative inline-flex h-7 w-12 sm:h-8 sm:w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                      isMentor ? 'bg-amber-400' : 'bg-white/20'
                    }`}
                  >
                    <span className='sr-only'>Toggle Mentorship</span>
                    <span
                      aria-hidden='true'
                      className={`pointer-events-none inline-block h-6 w-6 sm:h-7 sm:w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isMentor ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Personal Info Section */}
          <div className='bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs'>
            <div className='px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold'>
                  <FaUser />
                </div>
                <div>
                  <h2 className='text-sm font-bold text-slate-800 leading-tight !mb-0'>
                    Data Diri
                  </h2>
                  <p className='text-[10px] text-slate-400 font-medium'>
                    Informasi identitas akun Anda
                  </p>
                </div>
              </div>
            </div>

            <div className='p-6 sm:p-7 grid gap-5 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-slate-700 flex items-center gap-1.5'>
                  <FaIdBadge className='text-xs text-slate-400' /> Nama Lengkap{' '}
                  <span className='text-rose-500 text-xs'>*</span>
                </label>
                <input
                  type='text'
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className='text-xs sm:text-sm w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all'
                  placeholder='Masukkan nama lengkap'
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-slate-700 flex items-center gap-1.5'>
                  <FaUser className='text-xs text-slate-400' /> Username{' '}
                  <span className='text-rose-500 text-xs'>*</span>
                </label>
                <input
                  type='text'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className='text-xs sm:text-sm w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all'
                  placeholder='Username'
                  required
                />
              </div>

              <div className={`space-y-1.5 ${(user?.role as string) === 'admin' || (user?.role as string) === 'school' ? 'sm:col-span-2' : ''}`}>
                <label className='text-xs font-semibold text-slate-700 flex items-center gap-1.5'>
                  <FaEnvelope className='text-xs text-slate-400' /> Email{' '}
                  <span className='text-rose-500 text-xs'>*</span>
                </label>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='text-xs sm:text-sm w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all'
                  placeholder='Email'
                  required
                />
              </div>

              {(user?.role as string) !== 'admin' && (user?.role as string) !== 'school' && (
                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-1.5'>
                    <label className='text-xs font-semibold text-slate-700 flex items-center gap-1.5'>
                      <FaIdBadge className='text-xs text-slate-400' /> Tahun Masuk{' '}
                      <span className='text-rose-500 text-xs'>*</span>
                    </label>
                    <input
                      type='number'
                      value={entryYear}
                      onChange={(e) =>
                        setEntryYear(e.target.value ? parseInt(e.target.value) : '')
                      }
                      className='text-xs sm:text-sm w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all'
                      placeholder='Contoh: 2023'
                      min='1900'
                      max='2100'
                      required
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <label className='text-xs font-semibold text-slate-700 flex items-center gap-1.5'>
                      <FaGraduationCap className='text-xs text-slate-400' /> Tahun Lulus{' '}
                      <span className='text-rose-500 text-xs'>*</span>
                    </label>
                    <input
                      type='number'
                      value={graduationYear}
                      onChange={(e) =>
                        setGraduationYear(
                          e.target.value ? parseInt(e.target.value) : '',
                        )
                      }
                      className='text-xs sm:text-sm w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all'
                      placeholder='Contoh: 2026'
                      min='1900'
                      max='2100'
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Graduation Alert for Students */}
          {user?.role === 'student' &&
            savedGraduationYear &&
            (new Date().getFullYear() > savedGraduationYear ||
              (new Date().getFullYear() === savedGraduationYear &&
                (new Date().getMonth() > 4 ||
                  (new Date().getMonth() === 4 && new Date().getDate() >= 4)))) && (
              <div className='bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl border border-emerald-500/30 overflow-hidden shadow-xs'>
                <div className='p-6'>
                  <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                    <div className='flex items-start gap-3.5'>
                      <div className='p-3 bg-emerald-500/20 rounded-xl text-emerald-600 shrink-0'>
                        <FaGraduationCap className='text-2xl' />
                      </div>
                      <div>
                        <h3 className='text-base font-bold text-slate-900 !mb-1'>
                          Selamat! Anda Sudah Lulus
                        </h3>
                        <p className='text-xs sm:text-sm text-slate-600 mb-1'>
                          Tahun lulus Anda adalah {graduationYear}. Anda dapat mengonversi akun Anda menjadi akun alumni.
                        </p>
                        <p className='text-[10px] text-slate-500'>
                          Dengan menjadi alumni, Anda dapat mengisi kuesioner tracer study dan berbagi pengalaman kampus.
                        </p>
                      </div>
                    </div>
                    <button
                      type='button'
                      onClick={() => setShowGraduationModal(true)}
                      className='flex w-full sm:w-auto justify-center items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer'
                    >
                      <FaGraduationCap /> Lulus Sekarang
                    </button>
                  </div>
                </div>
              </div>
            )}

          {/* Password Section */}
          {(user?.role as string) === 'school' ? (
            <div className='bg-blue-50/50 rounded-2xl border border-blue-200/60 p-5 overflow-hidden shadow-xs'>
              <div className='flex items-start gap-3.5'>
                <div className='p-2.5 bg-blue-100 text-blue-600 rounded-xl shrink-0'>
                  <FaLock className='text-lg' />
                </div>
                <div>
                  <h2 className='text-sm font-bold text-slate-900 !mb-0.5'>
                    Keamanan Password
                  </h2>
                  <p className='text-xs text-slate-600 leading-relaxed'>
                    Jika Anda perlu mengganti password, silakan hubungi kami melalui Instagram:{' '}
                    <a
                      href='https://www.instagram.com/tracerstudysmanta/'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='font-bold text-blue-600 hover:underline underline-offset-2 transition-colors'
                    >
                      @tracerstudysmanta
                    </a>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className='bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs'>
              <div className='px-6 py-4 border-b border-slate-100 bg-slate-50/50'>
                <div className='flex items-center justify-between gap-4'>
                  <div className='flex items-center gap-3'>
                    <div className='h-8 w-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center text-sm font-bold'>
                      <FaLock />
                    </div>
                    <div>
                      <h2 className='text-sm font-bold text-slate-800 leading-tight !mb-0'>
                        Ubah Password
                      </h2>
                      <p className='text-[10px] text-slate-400 font-medium'>
                        Perbarui kata sandi akun Anda untuk keamanan
                      </p>
                    </div>
                  </div>
                  <button
                    type='button'
                    onClick={() => {
                      setShowPasswordFields(!showPasswordFields);
                      if (showPasswordFields) {
                        setPassword('');
                        setConfirmPassword('');
                      }
                    }}
                    className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer ${
                      showPasswordFields
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                        : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/60'
                    }`}
                  >
                    {showPasswordFields ? 'Batal Ubah' : 'Ganti Password'}
                  </button>
                </div>
              </div>

              {showPasswordFields && (
                <div className='p-6 grid gap-5 sm:grid-cols-2 animate-slide-down border-t border-slate-100'>
                  <div className='space-y-1.5'>
                    <label className='text-xs font-semibold text-slate-700 flex items-center gap-1.5'>
                      <FaLock className='text-[10px] text-slate-400' /> Password Baru
                    </label>
                    <div className='relative'>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='text-xs sm:text-sm w-full px-4 py-2.5 sm:py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all'
                        placeholder='Masukkan password baru'
                        required={showPasswordFields}
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute inset-y-0 right-0 px-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer'
                        tabIndex={-1}
                      >
                        {showPassword ? <FaEyeSlash className='text-sm' /> : <FaEye className='text-sm' />}
                      </button>
                    </div>
                  </div>

                  <div className='space-y-1.5'>
                    <label className='text-xs font-semibold text-slate-700 flex items-center gap-1.5'>
                      <FaLock className='text-[10px] text-slate-400' /> Konfirmasi Password
                    </label>
                    <div className='relative'>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className='text-xs sm:text-sm w-full px-4 py-2.5 sm:py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all'
                        placeholder='Ulangi password baru'
                        required={showPasswordFields}
                      />
                      <button
                        type='button'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className='absolute inset-y-0 right-0 px-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer'
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <FaEyeSlash className='text-sm' /> : <FaEye className='text-sm' />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div className={`sticky bottom-0 px-6 sm:px-8 py-4 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-end gap-3 z-10 shadow-xs mt-auto ${!isModal ? 'rounded-2xl border' : ''}`}>
          {isModal && onClose && (
            <button
              type='button'
              onClick={onClose}
              className='px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs sm:text-sm transition-all cursor-pointer'
            >
              Batal
            </button>
          )}
          <button
            type='submit'
            disabled={saving}
            className='flex items-center gap-2 px-6 sm:px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer'
          >
            {saving ? (
              <>
                <div className='h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                Menyimpan...
              </>
            ) : (
              <>
                <FaSave /> Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>

      {/* Graduation Confirmation Modal */}
      {showGraduationModal && createPortal(
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-[color:var(--bg-card)] rounded-2xl border border-[color:var(--border-color)] max-w-md w-full shadow-2xl animate-fade-in'>
            <div className='p-6 border-b border-[color:var(--border-color)]'>
              <h3 className='text-xl font-bold text-[color:var(--text-primary)] flex items-center gap-3'>
                <div className='p-2 bg-green-500/10 rounded-lg text-green-500'>
                  <FaUser className='text-xl' />
                </div>
                Konfirmasi Kelulusan
              </h3>
            </div>
            <div className='p-6'>
              <p className='text-[color:var(--text-secondary)] mb-4'>
                Apakah Anda yakin ingin mengkonversi akun Anda menjadi akun
                alumni?
              </p>
              <div className='bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4'>
                <p className='text-sm text-yellow-600 dark:text-yellow-400'>
                  <strong>Perhatian:</strong> Setelah dikonversi, Anda tidak
                  dapat kembali menjadi akun student.
                </p>
              </div>
              <div className='space-y-2 text-sm text-[color:var(--text-tertiary)]'>
                <p>✓ Anda akan mendapatkan akses ke kuesioner alumni</p>
                <p>✓ Data Anda akan ditampilkan di halaman alumni</p>
                <p>✓ Anda dapat berbagi pengalaman dengan siswa</p>
              </div>
            </div>
            <div className='p-6 border-t border-[color:var(--border-color)] flex gap-3'>
              <button
                type='button'
                onClick={() => setShowGraduationModal(false)}
                disabled={graduating}
                className='flex-1 px-4 py-3 bg-[color:var(--bg-secondary)] text-[color:var(--text-secondary)] rounded-xl font-bold border border-[color:var(--border-color)] hover:bg-[color:var(--bg-tertiary)] transition-all disabled:opacity-50'
              >
                Batal
              </button>
              <button
                type='button'
                onClick={handleGraduation}
                disabled={graduating}
                className='flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2'
              >
                {graduating ? (
                  <>
                    <div className='h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    Memproses...
                  </>
                ) : (
                  <>
                    <FaUser /> Ya, Lulus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Profile;
