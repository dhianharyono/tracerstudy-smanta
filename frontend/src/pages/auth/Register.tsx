import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '../../contexts/AuthContext';

import {
  FaGraduationCap,
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserGraduate,
  FaUserTag,
} from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'alumni',
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const captchaRef = useRef<ReCAPTCHA>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const onCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    if (token) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password harus minimal 6 karakter');
      return;
    }

    if (!captchaToken) {
      setError('Silakan selesaikan CAPTCHA');
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.username,
        formData.email,
        formData.password,
        formData.role,
        captchaToken,
      );

      console.log('Registration successful, showing toast...');
      console.log('Registration successful, navigating to login...');
      navigate('/login', {
        state: {
          successMessage: 'Pendaftaran berhasil! Silakan login untuk masuk.',
        },
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Pendaftaran gagal');
      captchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const siteKey =
    import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
    '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

  if (!import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
    console.warn(
      'Using reCAPTCHA test site key. Ensure backend also uses test secret key.',
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-[color:var(--bg-primary)] p-4 relative overflow-hidden'>
      {/* Background decoration */}
      <div className='absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none'>
        <div className='absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[var(--primary)] opacity-10 blur-3xl'></div>
        <div className='absolute -bottom-[20%] -right-[10%] w-[30%] h-[30%] rounded-full bg-blue-400 opacity-10 blur-3xl'></div>
      </div>

      <div className='w-full max-w-md z-10 animate-fade-in'>
        <div className='overflow-hidden rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] shadow-2xl backdrop-blur-sm'>
          {/* Header */}
          <div className='bg-[color:var(--bg-tertiary)]/30 p-8 text-center border-b border-[color:var(--border-color)]'>
            <div className='flex items-center justify-center'>
              <img src='/logo.png' alt='Logo' className='h-14 w-1h-14' />
            </div>
            <div className='text-xl font-bold text-[color:var(--text-primary)]'>
              Buat Akun Baru
            </div>
            <p className='mt-2 text-xs text-[color:var(--text-secondary)]'>
              Bergabung dan mulai berkontribusi untuk Tracer Study SMANTA
            </p>
          </div>

          <div className='p-8'>
            {error && (
              <div className='mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400'>
                <svg
                  className='h-5 w-5 shrink-0'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                    clipRule='evenodd'
                  />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-1.5'>
                <label className='block text-sm font-medium text-[color:var(--text-secondary)]'>
                  Role
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[color:var(--text-tertiary)]'>
                    <FaUserTag />
                  </div>
                  <select
                    name='role'
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className='w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] py-3 pl-10 pr-4 text-sm text-[color:var(--text-primary)] shadow-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] mobile:text-base appearance-none'
                  >
                    <option value='alumni'>Alumni</option>
                    <option disabled value='student'>
                      Student (Coming Soon)
                    </option>
                  </select>
                  <div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)]'>
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
              </div>

              <div className='space-y-1.5'>
                <label className='block text-sm font-medium text-[color:var(--text-secondary)]'>
                  Username
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[color:var(--text-tertiary)]'>
                    <FaUser />
                  </div>
                  <input
                    type='text'
                    name='username'
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder='Buat username unik'
                    className='w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] py-3 pl-10 pr-4 text-sm text-[color:var(--text-primary)] placeholder-gray-400 shadow-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] mobile:text-base'
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className='block text-sm font-medium text-[color:var(--text-secondary)]'>
                  Email
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[color:var(--text-tertiary)]'>
                    <FaEnvelope />
                  </div>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder='alamat@email.com'
                    className='w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] py-3 pl-10 pr-4 text-sm text-[color:var(--text-primary)] placeholder-gray-400 shadow-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] mobile:text-base'
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className='block text-sm font-medium text-[color:var(--text-secondary)]'>
                  Password
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[color:var(--text-tertiary)]'>
                    <FaLock />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name='password'
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder='Minimal 6 karakter'
                    className='w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] py-3 pl-10 pr-12 text-sm text-[color:var(--text-primary)] placeholder-gray-400 shadow-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] mobile:text-base'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-0 top-0 h-full px-3 text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)] transition-colors'
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className='block text-sm font-medium text-[color:var(--text-secondary)]'>
                  Konfirmasi Password
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[color:var(--text-tertiary)]'>
                    <FaLock />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name='confirmPassword'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder='Ulangi password'
                    className='w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] py-3 pl-10 pr-12 text-sm text-[color:var(--text-primary)] placeholder-gray-400 shadow-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] mobile:text-base'
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-0 top-0 h-full px-3 text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)] transition-colors'
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* CAPTCHA Section */}
              <div className='flex justify-center py-2'>
                <ReCAPTCHA
                  ref={captchaRef}
                  sitekey={siteKey}
                  onChange={onCaptchaChange}
                  theme='light'
                />
              </div>

              <button
                type='submit'
                disabled={loading}
                className='w-full transform rounded-xl bg-gradient-to-r from-[var(--primary)] to-blue-500 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 mt-4'
              >
                {loading ? (
                  <span className='flex items-center justify-center gap-2'>
                    <FaGraduationCap className='animate-pulse' />
                    Mendaftar...
                  </span>
                ) : (
                  'Daftar Sekarang'
                )}
              </button>
            </form>

            <div className='mt-8 text-center'>
              <p className='text-sm text-[color:var(--text-tertiary)]'>
                Sudah punya akun?{' '}
                <Link
                  to='/login'
                  className='font-semibold text-[color:var(--primary)] transition-colors hover:text-blue-400'
                >
                  Login di sini
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
