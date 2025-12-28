import { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingSpinner from '@/components/LoadingSpinner';
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

const Profile = () => {
  const { updateUser, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [entryYear, setEntryYear] = useState<number | ''>('');
  const [graduationYear, setGraduationYear] = useState<number | ''>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showGraduationModal, setShowGraduationModal] = useState(false);
  const [graduating, setGraduating] = useState(false);

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
    } catch (error) {
      console.error('Error fetching profile:', error);
      Toast('Gagal mengambil data profil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

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
      };

      if (password) {
        updateData.password = password;
      }

      const response = await axios.put('/api/users/profile', updateData);
      updateUser(response.data);
      Toast('Profil berhasil diperbarui', 'success');
      setPassword('');
      setConfirmPassword('');
      setShowPasswordFields(false);
      fetchProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Toast(
        error.response?.data?.message || 'Gagal memperbarui profil',
        'error'
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
      Toast('Selamat! Akun Anda telah dikonversi menjadi akun alumni', 'success');
      // Reload page to update user context
      setTimeout(() => {
        window.location.href = '/alumni/dashboard';
      }, 1500);
    } catch (error: any) {
      console.error('Error graduating:', error);
      Toast(
        error.response?.data?.message || 'Gagal mengkonversi akun',
        'error'
      );
    } finally {
      setGraduating(false);
      setShowGraduationModal(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className='p-4 md:p-8 animate-fade-in'>
      <div className='mb-8 text-center md:text-left'>
        <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
          Profil Pengguna
        </h1>
        <p className='text-[color:var(--text-secondary)]'>
          Kelola data diri dan password akun Anda
        </p>
      </div>

      <form onSubmit={handleUpdateProfile} className='space-y-6'>
        {/* Personal Info Section */}
        <div className='bg-[color:var(--bg-card)] rounded-2xl border border-[color:var(--border-color)] overflow-hidden shadow-sm'>
          <div className='p-6 border-b border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)]/30'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-blue-500/10 rounded-lg text-blue-500'>
                <FaUser className='text-xl' />
              </div>
              <h2 className='text-lg font-bold text-[color:var(--text-primary)] !mb-0'>
                Data Diri
              </h2>
            </div>
          </div>

          <div className='p-6 grid gap-6 md:grid-cols-2'>
            <div className='space-y-2'>
              <label className='text-sm font-semibold text-[color:var(--text-secondary)] flex items-center gap-2'>
                <FaIdBadge className='text-xs' /> Nama Lengkap
              </label>
              <input
                type='text'
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className='w-full px-4 py-3 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] text-[color:var(--text-primary)] focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all'
                placeholder='Masukkan nama lengkap'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-semibold text-[color:var(--text-secondary)] flex items-center gap-2'>
                <FaUser className='text-xs' /> Username
              </label>
              <input
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className='w-full px-4 py-3 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] text-[color:var(--text-primary)] focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all'
                placeholder='Username'
                required
              />
            </div>

            <div className='space-y-2 md:col-span-2'>
              <label className='text-sm font-semibold text-[color:var(--text-secondary)] flex items-center gap-2'>
                <FaEnvelope className='text-xs' /> Email
              </label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-4 py-3 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] text-[color:var(--text-primary)] focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all'
                placeholder='Email'
                required
              />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-semibold text-[color:var(--text-secondary)] flex items-center gap-2'>
                <FaIdBadge className='text-xs' /> Tahun Masuk
              </label>
              <input
                type='number'
                value={entryYear}
                onChange={(e) => setEntryYear(e.target.value ? parseInt(e.target.value) : '')}
                className='w-full px-4 py-3 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] text-[color:var(--text-primary)] focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all'
                placeholder='Contoh: 2020'
                min='1900'
                max='2100'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-semibold text-[color:var(--text-secondary)] flex items-center gap-2'>
                <FaGraduationCap className='text-xs' /> Tahun Lulus
              </label>
              <input
                type='number'
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value ? parseInt(e.target.value) : '')}
                className='w-full px-4 py-3 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] text-[color:var(--text-primary)] focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all'
                placeholder='Contoh: 2023'
                min='1900'
                max='2100'
              />
            </div>
          </div>
        </div>

        {/* Graduation Alert for Students */}
        {user?.role === 'student' && graduationYear && graduationYear <= new Date().getFullYear() && (
          <div className='bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl border border-green-500/30 overflow-hidden shadow-sm'>
            <div className='p-6'>
              <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
                <div className='flex items-start gap-4'>
                  <div className='p-3 bg-green-500/20 rounded-xl text-green-500'>
                    <FaGraduationCap className='text-2xl' />
                  </div>
                  <div>
                    <h3 className='text-lg font-bold text-[color:var(--text-primary)] mb-1'>
                      Selamat! Anda Sudah Lulus
                    </h3>
                    <p className='text-sm text-[color:var(--text-secondary)] mb-2'>
                      Tahun lulus Anda adalah {graduationYear}. Anda dapat mengkonversi akun Anda menjadi akun alumni.
                    </p>
                    <p className='text-xs text-[color:var(--text-tertiary)]'>
                      Dengan menjadi alumni, Anda dapat mengisi kuesioner dan berbagi pengalaman dengan siswa lainnya.
                    </p>
                  </div>
                </div>
                <button
                  type='button'
                  onClick={() => setShowGraduationModal(true)}
                  className='flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap'
                >
                  <FaGraduationCap /> Lulus Sekarang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password Section */}
        <div className='bg-[color:var(--bg-card)] rounded-2xl border border-[color:var(--border-color)] overflow-hidden shadow-sm'>
          <div className='p-6 border-b border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)]/30'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-red-500/10 rounded-lg text-red-500'>
                  <FaLock className='text-xl' />
                </div>
                <h2 className='text-lg font-bold text-[color:var(--text-primary)] !mb-0'>
                  Ubah Password
                </h2>
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
                className={`text-sm font-bold px-4 py-2.5 rounded-xl transition-all w-full sm:w-auto text-center ${showPasswordFields
                  ? 'bg-[color:var(--bg-secondary)] text-[color:var(--text-secondary)] border border-[color:var(--border-color)]'
                  : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                  }`}
              >
                {showPasswordFields ? 'Batal Ubah' : 'Ganti Password'}
              </button>
            </div>
          </div>

          {showPasswordFields && (
            <div className='p-6 grid gap-6 md:grid-cols-2 animate-slide-down'>
              <div className='space-y-2 relative'>
                <label className='text-sm font-semibold text-[color:var(--text-secondary)]'>
                  Password Baru
                </label>
                <div className='absolute top-6 inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[color:var(--text-tertiary)]'>
                  <FaLock />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] py-3 pl-10 pr-12 text-sm text-[color:var(--text-primary)] placeholder-gray-400 shadow-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] mobile:text-base'
                  placeholder='Masukkan password baru'
                  required={showPasswordFields}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-0 top-2 h-full px-3 text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)] transition-colors'
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className='space-y-2 relative'>
                <label className='text-sm font-semibold text-[color:var(--text-secondary)]'>
                  Konfirmasi Password
                </label>
                <div className='absolute top-6 inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[color:var(--text-tertiary)]'>
                  <FaLock />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className='w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] py-3 pl-10 pr-12 text-sm text-[color:var(--text-primary)] placeholder-gray-400 shadow-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] mobile:text-base'
                  placeholder='Ulangi password baru'
                  required={showPasswordFields}
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-0 top-2 h-full px-3 text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)] transition-colors'
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className='flex justify-end'>
          <button
            type='submit'
            disabled={saving}
            className='flex items-center gap-2 px-8 py-3 bg-[var(--primary)] text-white rounded-xl font-bold shadow-lg shadow-[var(--primary)]/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100'
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
      {showGraduationModal && (
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
                Apakah Anda yakin ingin mengkonversi akun Anda menjadi akun alumni?
              </p>
              <div className='bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4'>
                <p className='text-sm text-yellow-600 dark:text-yellow-400'>
                  <strong>Perhatian:</strong> Setelah dikonversi, Anda tidak dapat kembali menjadi akun student.
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
        </div>
      )}
    </div>
  );
};

export default Profile;
