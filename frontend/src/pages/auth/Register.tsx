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
    <div className='flex min-h-screen items-center justify-center bg-slate-50 p-4 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white'>
      {/* Background decoration (Matching landing page concentric theme) */}
      <div className='absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none'>
        <div className='absolute -top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full border border-blue-500/5 animate-[spin_180s_linear_infinite]'></div>
        <div className='absolute bottom-[10%] -right-[10%] w-[350px] h-[350px] rounded-full border border-indigo-500/5'></div>
        <div className='absolute -bottom-[10%] left-[10%] w-[400px] h-[400px] rounded-full bg-blue-400/5 blur-3xl'></div>
        <div className='absolute top-[10%] left-[30%] w-[300px] h-[300px] rounded-full bg-indigo-400/5 blur-3xl'></div>
      </div>

      <div className='w-full max-w-md z-10 animate-fade-in space-y-6'>
        {/* Back to Landing */}
        <div className='flex justify-start'>
          <Link
            to="/"
            className='inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-650 transition-all group'
          >
            <div className='p-2.5 rounded-full bg-white border border-slate-200 group-hover:border-blue-500 group-hover:scale-110 transition-all shadow-sm'>
              <FaArrowLeft />
            </div>
            Kembali ke Beranda
          </Link>
        </div>

        <div className='overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white shadow-2xl'>
          {/* Header */}
          <div className='bg-slate-50 p-8 text-center border-b border-slate-100 relative overflow-hidden'>
            <div className='absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -z-0'></div>
            <div className='flex items-center justify-center mb-3'>
              <img src='/logo.png' alt='Logo' className='h-14 w-14 filter drop-shadow-sm' />
            </div>
            <div className='text-lg md:text-xl font-black text-slate-900 tracking-tight'>
              Buat Akun Baru
            </div>
            <p className='mt-1 text-xs text-slate-500 font-bold'>
              Bergabung dan mulai berkontribusi untuk Tracer Study SMANTA
            </p>
          </div>

          <div className='p-8'>
            {error && (
              <div className='mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 font-semibold shadow-sm'>
                <svg
                  className='h-5 w-5 shrink-0 text-red-500'
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

            <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
              <div className='flex flex-col gap-2'>
                <label className='block text-xs font-black uppercase tracking-widest text-slate-400'>
                  Pilih Peran
                </label>
                <div className='grid grid-cols-2 gap-4'>
                  {/* Alumni Option */}
                  <button
                    type='button'
                    onClick={() => setFormData({ ...formData, role: 'alumni' })}
                    className={`relative overflow-hidden rounded-xl border-2 p-3.5 transition-all duration-200 flex flex-col items-center justify-center gap-1.5 text-center h-full ${formData.role === 'alumni'
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/30'
                      }`}
                  >
                    <div>
                      <div
                        className={`font-extrabold text-sm ${formData.role === 'alumni' ? 'text-blue-600' : 'text-slate-800'
                          }`}
                      >
                        Alumni
                      </div>
                      <div className='text-[10px] text-slate-400 font-bold leading-tight mt-0.5'>
                        Sudah lulus sekolah
                      </div>
                    </div>
                  </button>

                  {/* Student Option */}
                  <button
                    type='button'
                    onClick={() => setFormData({ ...formData, role: 'student' })}
                    className={`relative overflow-hidden rounded-xl border-2 p-3.5 transition-all duration-200 flex flex-col items-center justify-center gap-1.5 text-center h-full ${formData.role === 'student'
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/30'
                      }`}
                  >
                    <div>
                      <div
                        className={`font-extrabold text-sm ${formData.role === 'student' ? 'text-blue-600' : 'text-slate-800'
                          }`}
                      >
                        Siswa aktif
                      </div>
                      <div className='text-[10px] text-slate-400 font-bold leading-tight mt-0.5'>
                        Masih aktif belajar
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className='flex flex-col gap-1.5'>
                <label className='block text-xs font-black uppercase tracking-widest text-slate-400'>
                  Username
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400'>
                    <FaUser />
                  </div>
                  <input
                    type='text'
                    name='username'
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder='Buat username unik'
                    className='w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 shadow-inner transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white'
                  />
                </div>
              </div>

              <div className='flex flex-col gap-1.5'>
                <label className='block text-xs font-black uppercase tracking-widest text-slate-400'>
                  Email
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400'>
                    <FaEnvelope />
                  </div>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder='alamat@email.com'
                    className='w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 shadow-inner transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white'
                  />
                </div>
              </div>

              <div className='flex flex-col gap-1.5'>
                <label className='block text-xs font-black uppercase tracking-widest text-slate-400'>
                  Password
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400'>
                    <FaLock />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name='password'
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder='Buat password kuat'
                    className='w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-12 text-sm text-slate-800 placeholder-slate-400 shadow-inner transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-0 top-0 h-full px-3.5 text-slate-400 hover:text-slate-650 transition-colors'
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>

                {/* Real-time Validation Checklist */}
                {formData.password.length > 0 && (
                  <div className='mt-2.5 grid grid-cols-2 gap-x-2 gap-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 animate-slide-up'>
                    {[
                      { label: 'Min. 8 Karakter', met: formData.password.length >= 8 },
                      { label: 'Huruf Besar & Kecil', met: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) },
                      { label: 'Angka', met: /\d/.test(formData.password) },
                      { label: 'Simbol (@$!%*?&)', met: /[@$!%*?&]/.test(formData.password) }
                    ].map((req, i) => (
                      <div key={i} className={`flex items-center gap-1.5 text-[10px] font-bold ${req.met ? 'text-green-600' : 'text-slate-400'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${req.met ? 'bg-green-500 text-white' : 'bg-slate-200'}`}>
                          {req.met && (
                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                            </svg>
                          )}
                        </div>
                        {req.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className='flex flex-col gap-1.5'>
                <label className='block text-xs font-black uppercase tracking-widest text-slate-400'>
                  Konfirmasi Password
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400'>
                    <FaLock />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name='confirmPassword'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder='Ulangi password'
                    className='w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-12 text-sm text-slate-800 placeholder-slate-400 shadow-inner transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white'
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-0 top-0 h-full px-3.5 text-slate-400 hover:text-slate-650 transition-colors'
                  >
                    {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
                {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                  <p className='text-[10px] font-black text-red-500 mt-1.5 animate-pulse'>
                    Password tidak cocok!
                  </p>
                )}
                {formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword && (
                  <p className='text-[10px] font-black text-green-650 mt-1.5 flex items-center gap-1'>
                    <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
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
                className='w-full transform rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 px-4 text-sm font-black text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 mt-3'
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
              <p className='text-sm text-slate-500 font-semibold'>
                Sudah punya akun?{' '}
                <Link
                  to='/login'
                  className='font-bold text-blue-650 transition-colors hover:text-blue-700 hover:underline'
                >
                  Login di sini
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className='mt-8 text-center text-xs text-slate-400 font-bold'>
          &copy; {new Date().getFullYear()} Tracer Study SMAN 1 Tawangsari. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Register;
