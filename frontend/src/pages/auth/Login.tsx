import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Toast from '@/components/toast';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toastShown = useRef(false);

  useEffect(() => {
    if (location.state?.successMessage && !toastShown.current) {
      toastShown.current = true;
      Toast(location.state.successMessage, 'success');

      // Clear the state after a short delay to ensure the toast registers
      const timer = setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 500);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [location.state, location.pathname, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};

      if (user.role === 'alumni') {
        navigate('/alumni');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'student') {
        navigate('/student');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 p-4 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white'>
      {/* Background decoration (Matching landing page concentric theme) */}
      <div className='absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none'>
        <div className='absolute -top-[10%] -right-[10%] w-[500px] h-[500px] rounded-full border border-blue-500/5 animate-[spin_180s_linear_infinite]'></div>
        <div className='absolute top-[20%] -left-[10%] w-[350px] h-[350px] rounded-full border border-indigo-500/5'></div>
        <div className='absolute -bottom-[10%] left-[20%] w-[400px] h-[400px] rounded-full bg-blue-400/5 blur-3xl'></div>
        <div className='absolute top-[10%] right-[30%] w-[300px] h-[300px] rounded-full bg-indigo-400/5 blur-3xl'></div>
      </div>

      <div className='w-full max-w-md z-10 animate-fade-in space-y-6'>
        {/* Back to Landing */}
        <Link
          to="/"
          className='inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-650 transition-all group'
        >
          <div className='p-2.5 rounded-full bg-white border border-slate-200 group-hover:border-blue-500 group-hover:scale-110 transition-all shadow-sm'>
            <FaArrowLeft />
          </div>
          Kembali ke Beranda
        </Link>
        <div className='overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white shadow-2xl'>
          {/* Header */}
          <div className='bg-slate-50 p-8 text-center border-b border-slate-100 relative overflow-hidden'>
            <div className='absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -z-0'></div>
            <div className='flex items-center justify-center mb-3'>
              <img src='/logo.png' alt='Logo' className='h-14 w-14 filter drop-shadow-sm' />
            </div>
            <div className='text-xl font-black text-slate-900 tracking-tight'>
              Selamat Datang
            </div>
            <p className='mt-1 text-xs text-slate-500 font-bold'>
              Masuk ke akun Tracer Study SMANTA
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
                  Username
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400'>
                    <FaUser />
                  </div>
                  <input
                    type='text'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder='Masukkan username'
                    className='w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 shadow-inner transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white'
                  />
                </div>
              </div>

              <div className='flex flex-col gap-2'>
                <label className='block text-xs font-black uppercase tracking-widest text-slate-400'>
                  Password
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400'>
                    <FaLock />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder='Masukkan password'
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
              </div>

              <button
                type='submit'
                disabled={loading}
                className='w-full transform rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 px-4 text-sm font-black text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 mt-2'
              >
                {loading ? (
                  <span className='flex items-center justify-center gap-2'>
                    <svg
                      className='animate-spin h-5 w-5 text-white'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Masuk...
                  </span>
                ) : (
                  'Masuk'
                )}
              </button>
            </form>

            <div className='mt-8 text-center'>
              <p className='text-sm text-slate-500 font-semibold'>
                Belum punya akun?{' '}
                <Link
                  to='/register'
                  className='font-bold text-blue-650 transition-colors hover:text-blue-700 hover:underline'
                >
                  Daftar di sini
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

export default Login;
