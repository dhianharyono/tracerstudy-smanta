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
  FaArrowLeft,
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

    // Match backend complexity requirement
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
    if (formData.password.length < 8) {
      setError('Password minimal harus 8 karakter');
      return;
    }
    
    if (!passwordRegex.test(formData.password)) {
      setError('Password harus mengandung huruf besar, huruf kecil, angka, dan simbol');
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

      <div className='w-full max-w-md z-10 animate-fade-in space-y-6'>
        {/* Back to Landing */}
        <div className='flex justify-start'>
          <Link
            to="/"
            className='inline-flex items-center gap-2 text-sm font-bold text-[color:var(--text-secondary)] hover:text-[var(--primary)] transition-all group'
          >
            <div className='p-2 rounded-full bg-[color:var(--bg-card)] border border-[color:var(--border-color)] group-hover:border-[var(--primary)] group-hover:scale-110 transition-all shadow-sm'>
              <FaArrowLeft />
            </div>
            Kembali ke Beranda
          </Link>
        </div>

        <div className='overflow-hidden rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] shadow-2xl backdrop-blur-sm'>
          {/* Header */}
          <div className='bg-[color:var(--bg-tertiary)]/30 p-8 text-center border-b border-[color:var(--border-color)] relative overflow-hidden'>
            <div className='absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -z-0'></div>
            <div className='flex items-center justify-center'>
              <img src='/logo.png' alt='Logo' className='h-14 w-1h-14' />
            </div>
            <div className='text-lg md:text-xl font-bold text-[color:var(--text-primary)]'>
              Buat Akun Baru
            </div>
            <p className='mt-1 text-xs text-[color:var(--text-secondary)]'>
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
              <div className='space-y-3'>
                <label className='block text-sm font-medium text-[color:var(--text-secondary)]'>
                  Pilih Role
                </label>
                <div className='grid grid-cols-2 gap-4'>
                  {/* Alumni Option */}
                  <button
                    type='button'
                    onClick={() => setFormData({ ...formData, role: 'alumni' })}
                    className={`relative overflow-hidden rounded-xl border-2 p-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 text-center h-full ${formData.role === 'alumni'
                      ? 'border-[var(--primary)] bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]'
                      : 'border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                  >
                    <div>
                      <div
                        className={`font-bold ${formData.role === 'alumni' ? 'text-[var(--primary)]' : 'text-[color:var(--text-primary)]'}`}
                      >
                        Alumni
                      </div>
                      <div className='text-[10px] sm:text-xs text-[color:var(--text-tertiary)] leading-tight'>
                        Sudah lulus sekolah
                      </div>
                    </div>
                  </button>

                  {/* Student Option */}
                  <button
                    type='button'
                    onClick={() =>
                      setFormData({ ...formData, role: 'student' })
                    }
                    className={`relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-200 flex flex-col items-center justify-center gap-2 text-center h-full ${formData.role === 'student'
                      ? 'border-[var(--primary)] bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]'
                      : 'border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                  >
                    <div>
                      <div
                        className={`font-bold ${formData.role === 'student' ? 'text-[var(--primary)]' : 'text-[color:var(--text-primary)]'}`}
                      >
                        Student
                      </div>
                      <div className='text-[10px] sm:text-xs text-[color:var(--text-tertiary)] leading-tight'>
                        Masih aktif belajar
                      </div>
                    </div>
                  </button>
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
                    placeholder='Buat password kuat'
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
                
                {/* Real-time Validation Checklist */}
                {formData.password.length > 0 && (
                  <div className='mt-2 grid grid-cols-2 gap-x-2 gap-y-1 p-3 rounded-lg bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] animate-slide-up'>
                    {[
                      { label: 'Min. 8 Karakter', met: formData.password.length >= 8 },
                      { label: 'Huruf Besar & Kecil', met: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) },
                      { label: 'Angka', met: /\d/.test(formData.password) },
                      { label: 'Simbol (@$!%*?&)', met: /[@$!%*?&]/.test(formData.password) }
                    ].map((req, i) => (
                      <div key={i} className={`flex items-center gap-1.5 text-[10px] font-bold ${req.met ? 'text-green-500' : 'text-[color:var(--text-tertiary)]'}`}>
                        <div className={`w-3 h-3 rounded-full flex items-center justify-center ${req.met ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          {req.met && <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
                        </div>
                        {req.label}
                      </div>
                    ))}
                  </div>
                )}
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
                {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                  <p className='text-[10px] font-bold text-red-500 mt-1 animate-pulse'>
                    Password tidak cocok!
                  </p>
                )}
                {formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword && (
                  <p className='text-[10px] font-bold text-green-500 mt-1 flex items-center gap-1'>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>
                    Password cocok
                  </p>
                )}
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
