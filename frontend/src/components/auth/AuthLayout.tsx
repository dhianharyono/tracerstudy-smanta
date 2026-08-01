import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Toast from '@/components/toast';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaGraduationCap,
  FaUserGraduate,
  FaUserCheck,
  FaPaperPlane,
  FaCheckCircle,
} from 'react-icons/fa';

interface AuthLayoutProps {
  initialMode?: 'login' | 'register' | 'forgot';
}

const springConfig = { type: 'spring' as const, stiffness: 220, damping: 26, mass: 0.8 };

const AuthLayout: React.FC<AuthLayoutProps> = ({ initialMode = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const toastShown = useRef(false);

  // Active view mode: 'login', 'register', 'forgot', or 'verify'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'verify'>(() => {
    if (location.pathname === '/register') return 'register';
    if (location.pathname === '/login') return 'login';
    if (location.pathname === '/forgot-password') return 'forgot';
    return initialMode;
  });

  // Email yang sedang menunggu verifikasi
  const [pendingVerifyEmail, setPendingVerifyEmail] = useState('');

  // Sync state with URL changes (e.g. browser back/forward)
  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/login') {
      setMode('login');
    } else if (location.pathname === '/forgot-password') {
      setMode('forgot');
    }
  }, [location.pathname]);

  // ------------ LOGIN STATE ------------
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Toast check for success message on login
  useEffect(() => {
    if (location.state?.successMessage && !toastShown.current) {
      toastShown.current = true;
      Toast(location.state.successMessage, 'success');

      const timer = setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [location.state, location.pathname, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      await login(loginUsername, loginPassword);
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
      // Cek apakah error karena email belum diverifikasi
      if (err.message?.includes('belum diverifikasi') || err.__requiresVerification) {
        // Coba extract email dari error
        setLoginError(err.message);
      } else {
        setLoginError(err.message || 'Login gagal. Periksa kembali username dan password Anda.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // ------------ REGISTER STATE ------------
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'alumni',
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const captchaRef = useRef<ReCAPTCHA>(null);

  const handleRegisterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const onCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    if (token) setRegisterError('');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('Password konfirmasi tidak cocok');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
    if (registerData.password.length < 8) {
      setRegisterError('Password minimal harus 8 karakter');
      return;
    }

    if (!passwordRegex.test(registerData.password)) {
      setRegisterError(
        'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol'
      );
      return;
    }

    if (!captchaToken) {
      setRegisterError('Silakan selesaikan CAPTCHA terlebih dahulu');
      return;
    }

    setRegisterLoading(true);

    try {
      const result = await register(
        registerData.username,
        registerData.email,
        registerData.password,
        registerData.role,
        captchaToken
      );

      // Tampilkan layar "Cek Email"
      setPendingVerifyEmail(result.email);
      setMode('verify');
      navigate('/register', { replace: true, state: {} });
    } catch (err: any) {
      console.error('Registration error:', err);
      setRegisterError(err.message || 'Pendaftaran gagal');
      captchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setRegisterLoading(false);
    }
  };

  const siteKey =
    import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
    '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

  // Mode switching helper with optional success toast state
  const switchMode = (targetMode: 'login' | 'register' | 'forgot', successMsg?: string) => {
    setMode(targetMode);
    let targetUrl = '/login';
    if (targetMode === 'register') targetUrl = '/register';
    if (targetMode === 'forgot') targetUrl = '/forgot-password';

    navigate(targetUrl, {
      replace: false,
      state: successMsg ? { successMessage: successMsg } : {},
    });
  };

  // ------------ RESEND VERIFICATION STATE ------------
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [resendError, setResendError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setResendError('');
    setResendSuccess('');
    try {
      await axios.post('/api/auth/resend-verification', { email: pendingVerifyEmail });
      setResendSuccess('Email verifikasi baru telah dikirim. Silakan cek kotak masuk Anda.');
      setResendCooldown(60);
    } catch (err: any) {
      setResendError(
        err.response?.data?.message || err.message || 'Gagal mengirim ulang email verifikasi.'
      );
    } finally {
      setResendLoading(false);
    }
  };

  // Render layar Cek Email (setelah registrasi berhasil)
  const renderCheckEmailScreen = () => (
    <div className='w-full max-w-md my-auto space-y-6 animate-fadeIn'>
      {/* Ikon */}
      <div className='text-center space-y-3'>
        <div className='inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 mx-auto'>
          <FaPaperPlane className='text-white text-3xl' />
        </div>
        <h2 className='text-2xl font-extrabold text-slate-900 tracking-tight'>
          Cek Email Anda!
        </h2>
        <p className='text-sm text-slate-500 font-medium leading-relaxed'>
          Kami telah mengirimkan link verifikasi ke
        </p>
        <div className='inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2'>
          <FaEnvelope className='text-blue-500 shrink-0' />
          <span className='text-sm font-bold text-blue-700 break-all'>{pendingVerifyEmail}</span>
        </div>
      </div>

      {/* Info Box */}
      <div className='bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 font-medium space-y-1'>
        <p className='font-bold text-amber-900'>⏰ Tautan berlaku 24 jam</p>
        <p>Buka email Anda dan klik tombol <strong>"Verifikasi Email Saya"</strong> untuk mengaktifkan akun.</p>
      </div>

      {/* Feedback resend */}
      {resendSuccess && (
        <div className='flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-700 font-semibold'>
          <FaCheckCircle className='text-emerald-500 shrink-0' />
          <span>{resendSuccess}</span>
        </div>
      )}
      {resendError && (
        <div className='flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 font-semibold'>
          <span>{resendError}</span>
        </div>
      )}

      {/* Tombol Kirim Ulang */}
      <motion.button
        whileHover={{ scale: resendCooldown > 0 || resendLoading ? 1 : 1.01 }}
        whileTap={{ scale: resendCooldown > 0 || resendLoading ? 1 : 0.98 }}
        onClick={handleResendVerification}
        disabled={resendCooldown > 0 || resendLoading}
        className='w-full rounded-xl border-2 border-blue-600 py-3 px-4 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-all disabled:cursor-not-allowed disabled:opacity-60 disabled:border-slate-300 disabled:text-slate-400'
      >
        {resendLoading ? (
          <span className='flex items-center justify-center gap-2'>
            <svg className='animate-spin h-4 w-4' fill='none' viewBox='0 0 24 24'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
            </svg>
            Mengirim...
          </span>
        ) : resendCooldown > 0 ? (
          `Kirim Ulang (${resendCooldown}s)`
        ) : (
          '📧 Kirim Ulang Email Verifikasi'
        )}
      </motion.button>

      {/* Link kembali */}
      <div className='text-center pt-1'>
        <button
          type='button'
          onClick={() => switchMode('login')}
          className='inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors'
        >
          <FaArrowLeft size={11} /> Kembali ke halaman Login
        </button>
      </div>

      <p className='text-[11px] text-slate-400 font-semibold text-center'>
        &copy; {new Date().getFullYear()} Tracer Study SMAN 1 Tawangsari
      </p>
    </div>
  );

  // ------------ FORGOT PASSWORD STATE ------------
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const res = await axios.post('/api/auth/forgot-password', { email: forgotEmail });
      setForgotSuccess(res.data.message || 'Instruksi reset password telah dikirim ke email Anda.');
      setCooldown(60);
    } catch (err: any) {
      setForgotError(
        err.response?.data?.message ||
        err.message ||
        'Terjadi kesalahan saat memproses permintaan reset password.'
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const renderForgotPasswordForm = () => (
    <div className='w-full max-w-md my-auto space-y-6 animate-fadeIn'>
      <div className='text-center space-y-2'>
        <div className='inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl shadow-sm mb-1'>
          <img src='/logo.png' alt='Logo SMANTA' className='h-12 w-12 filter drop-shadow-sm' />
        </div>
        <h2 className='text-2xl font-extrabold text-slate-900 tracking-tight'>
          Lupa Password
        </h2>
        <p className='text-xs sm:text-sm text-slate-500 font-bold'>
          Masukkan email akun Tracer Study Anda untuk menerima instruksi reset password.
        </p>
      </div>

      {forgotError && (
        <div className='flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 font-semibold shadow-sm animate-slide-up'>
          <svg className='h-5 w-5 shrink-0 text-red-500' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
              clipRule='evenodd'
            />
          </svg>
          <span>{forgotError}</span>
        </div>
      )}

      {forgotSuccess && (
        <div className='flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 font-semibold shadow-sm animate-slide-up'>
          <div className='flex items-center gap-2'>
            <svg className='h-5 w-5 text-emerald-600 shrink-0' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                clipRule='evenodd'
              />
            </svg>
            <span>{forgotSuccess}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleForgotSubmit} className='flex flex-col gap-5'>
        <div className='flex flex-col gap-2'>
          <label className='block text-xs font-bold uppercase tracking-widest text-slate-400'>
            Email Terdaftar
          </label>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400'>
              <FaEnvelope />
            </div>
            <input
              type='email'
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
              disabled={forgotLoading || cooldown > 0}
              placeholder='Masukkan alamat email Anda'
              className='w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100 disabled:cursor-not-allowed'
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: cooldown > 0 || forgotLoading ? 1 : 1.01 }}
          whileTap={{ scale: cooldown > 0 || forgotLoading ? 1 : 0.99 }}
          type='submit'
          disabled={forgotLoading || cooldown > 0}
          className='w-full rounded-xl bg-gradient-to-r from-blue-600 via-blue-650 to-indigo-650 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-70 disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none mt-2'
        >
          {forgotLoading ? (
            <span className='flex items-center justify-center gap-2'>
              <svg className='animate-spin h-5 w-5 text-white' fill='none' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
              </svg>
              Mengirim...
            </span>
          ) : cooldown > 0 ? (
            `TUNGGU ${cooldown} DETIK UNTUK MENGIRIM ULANG`
          ) : (
            'KIRIM INSTRUKSI RESET'
          )}
        </motion.button>
      </form>

      <div className='text-center pt-2'>
        <button
          type='button'
          onClick={() => switchMode('login')}
          className='inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-650 transition-colors'
        >
          <FaArrowLeft size={12} /> Kembali ke halaman Login
        </button>
      </div>
    </div>
  );

  const isSignUp = mode === 'register';

  // Reusable Login Form JSX
  const renderLoginForm = () => (
    <div className='w-full max-w-md my-auto space-y-6 animate-fadeIn'>
      {/* Header */}
      <div className='text-center space-y-2'>
        <div className='inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl shadow-sm mb-1'>
          <img src='/logo.png' alt='Logo SMANTA' className='h-12 w-12 filter drop-shadow-sm' />
        </div>
        <h2 className='text-2xl font-extrabold text-slate-900 tracking-tight'>
          Selamat Datang
        </h2>
        <p className='text-xs sm:text-sm text-slate-500 font-bold'>
          Silahkan masuk ke akun Tracer Study SMANTA
        </p>
      </div>

      {/* Error Message */}
      {loginError && (
        <div className='flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 font-semibold shadow-sm animate-slide-up'>
          <svg className='h-5 w-5 shrink-0 text-red-500' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
              clipRule='evenodd'
            />
          </svg>
          <span>{loginError}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLoginSubmit} className='flex flex-col gap-5'>
        <div className='flex flex-col gap-2'>
          <label className='block text-xs font-bold uppercase tracking-widest text-slate-400'>
            Username
          </label>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400'>
              <FaUser />
            </div>
            <input
              type='text'
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              required
              placeholder='Masukkan username Anda'
              className='w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
            />
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <label className='block text-xs font-bold uppercase tracking-widest text-slate-400'>
            Password
          </label>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400'>
              <FaLock />
            </div>
            <input
              type={showLoginPassword ? 'text' : 'password'}
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              placeholder='Masukkan password Anda'
              className='w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-10 pr-12 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
            />
            <button
              type='button'
              onClick={() => setShowLoginPassword(!showLoginPassword)}
              className='absolute right-0 top-0 h-full px-3.5 text-slate-400 hover:text-slate-650 transition-colors'
            >
              {showLoginPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
            </button>
          </div>
          <div className='flex justify-end items-center mt-1'>
            <button
              type='button'
              onClick={() => switchMode('forgot')}
              className='text-xs font-bold text-blue-650 hover:text-blue-700 hover:underline transition-colors'
            >
              Lupa Password?
            </button>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type='submit'
          disabled={loginLoading}
          className='w-full rounded-xl bg-gradient-to-r from-blue-600 via-blue-650 to-indigo-650 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-70 mt-2'
        >
          {loginLoading ? (
            <span className='flex items-center justify-center gap-2'>
              <svg className='animate-spin h-5 w-5 text-white' fill='none' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
              </svg>
              Masuk...
            </span>
          ) : (
            'SIGN IN'
          )}
        </motion.button>
      </form>

      {/* Mobile Switch Link & Footer */}
      <div className='text-center pt-4'>
        <div className='lg:hidden pt-4 border-t border-slate-200/80'>
          <p className='text-xs text-slate-500 font-semibold'>
            Belum memiliki akun?{' '}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => switchMode('register')}
              className='font-bold text-blue-650 transition-colors hover:underline ml-1'
            >
              Daftar sekarang
            </motion.button>
          </p>
        </div>
        <p className='text-[11px] text-slate-400 font-semibold mt-2'>
          &copy; {new Date().getFullYear()} Tracer Study SMAN 1 Tawangsari
        </p>
      </div>
    </div>
  );

  // Reusable Register Form JSX
  const renderRegisterForm = () => (
    <div className='w-full max-w-md my-auto space-y-4'>
      {/* Header */}
      <div className='text-center space-y-1.5'>
        <div className='inline-flex items-center justify-center p-2.5 bg-blue-50 rounded-2xl shadow-sm mb-1'>
          <img src='/logo.png' alt='Logo SMANTA' className='h-10 w-10 filter drop-shadow-sm' />
        </div>
        <h2 className='text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight'>
          Buat Akun Baru
        </h2>
        <p className='text-xs sm:text-sm text-slate-500 font-bold'>
          Bergabung dan berkontribusi di Tracer Study SMANTA
        </p>
      </div>

      {/* Error Message */}
      {registerError && (
        <div className='flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 font-semibold shadow-sm animate-slide-up'>
          <svg className='h-5 w-5 shrink-0 text-red-500' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
              clipRule='evenodd'
            />
          </svg>
          <span>{registerError}</span>
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleRegisterSubmit} className='flex flex-col gap-3'>
        {/* Role Selector */}
        <div className='flex flex-col gap-1.5'>
          <label className='block text-[11px] font-bold uppercase tracking-widest text-slate-400'>
            Pilih Akun
          </label>
          <div className='grid grid-cols-2 gap-3'>
            <button
              type='button'
              onClick={() => setRegisterData({ ...registerData, role: 'alumni' })}
              className={`relative rounded-xl border-2 p-2.5 transition-all duration-200 flex items-center justify-center gap-2 text-center ${registerData.role === 'alumni'
                ? 'border-blue-600 bg-blue-50/60 text-blue-650 font-extrabold ring-1 ring-blue-500/30'
                : 'border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100/50'
                }`}
            >
              <FaUserGraduate className={registerData.role === 'alumni' ? 'text-blue-600' : 'text-slate-400'} />
              <span className='text-xs'>Alumni</span>
            </button>

            <button
              type='button'
              onClick={() => setRegisterData({ ...registerData, role: 'student' })}
              className={`relative rounded-xl border-2 p-2.5 transition-all duration-200 flex items-center justify-center gap-2 text-center ${registerData.role === 'student'
                ? 'border-blue-600 bg-blue-50/60 text-blue-650 font-extrabold ring-1 ring-blue-500/30'
                : 'border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100/50'
                }`}
            >
              <FaGraduationCap className={registerData.role === 'student' ? 'text-blue-600' : 'text-slate-400'} />
              <span className='text-xs'>Siswa Aktif</span>
            </button>
          </div>
        </div>

        {/* Username */}
        <div className='flex flex-col gap-1.5'>
          <label className='block text-[11px] font-bold uppercase tracking-widest text-slate-400'>
            Username
          </label>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400'>
              <FaUser size={13} />
            </div>
            <input
              type='text'
              name='username'
              value={registerData.username}
              onChange={handleRegisterChange}
              required
              placeholder='Buat username'
              className='w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
            />
          </div>
        </div>

        {/* Email */}
        <div className='flex flex-col gap-1.5'>
          <label className='block text-[11px] font-bold uppercase tracking-widest text-slate-400'>
            Email
          </label>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400'>
              <FaEnvelope size={13} />
            </div>
            <input
              type='email'
              name='email'
              value={registerData.email}
              onChange={handleRegisterChange}
              required
              placeholder='alamat@email.com'
              className='w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
            />
          </div>
        </div>

        {/* Password */}
        <div className='flex flex-col gap-1.5'>
          <label className='block text-[11px] font-bold uppercase tracking-widest text-slate-400'>
            Password
          </label>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400'>
              <FaLock size={13} />
            </div>
            <input
              type={showRegPassword ? 'text' : 'password'}
              name='password'
              value={registerData.password}
              onChange={handleRegisterChange}
              required
              placeholder='Buat password kuat'
              className='w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
            />
            <button
              type='button'
              onClick={() => setShowRegPassword(!showRegPassword)}
              className='absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-650 transition-colors'
            >
              {showRegPassword ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
            </button>
          </div>

          {/* Password Strength Requirements Checklist */}
          {registerData.password.length > 0 && (
            <div className='grid grid-cols-2 gap-x-2 gap-y-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 animate-slide-up text-[10px]'>
              {[
                { label: 'Min. 8 Karakter', met: registerData.password.length >= 8 },
                { label: 'Huruf Besar & Kecil', met: /[a-z]/.test(registerData.password) && /[A-Z]/.test(registerData.password) },
                { label: 'Angka', met: /\d/.test(registerData.password) },
                { label: 'Simbol (@$!%*?&)', met: /[@$!%*?&]/.test(registerData.password) },
              ].map((req, i) => (
                <div key={i} className={`flex items-center gap-1.5 font-bold ${req.met ? 'text-green-600' : 'text-slate-400'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${req.met ? 'bg-green-500 text-white' : 'bg-slate-200'}`}>
                    {req.met && (
                      <svg className='w-2.5 h-2.5' fill='currentColor' viewBox='0 0 20 20'>
                        <path d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' />
                      </svg>
                    )}
                  </div>
                  <span>{req.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className='flex flex-col gap-1.5'>
          <label className='block text-[11px] font-bold uppercase tracking-widest text-slate-400'>
            Konfirmasi Password
          </label>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400'>
              <FaLock size={13} />
            </div>
            <input
              type={showRegConfirmPassword ? 'text' : 'password'}
              name='confirmPassword'
              value={registerData.confirmPassword}
              onChange={handleRegisterChange}
              required
              placeholder='Ulangi password'
              className='w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
            />
            <button
              type='button'
              onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
              className='absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-650 transition-colors'
            >
              {showRegConfirmPassword ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
            </button>
          </div>
          {registerData.confirmPassword.length > 0 && registerData.password !== registerData.confirmPassword && (
            <p className='text-[10px] font-bold text-red-500 mt-0.5 animate-pulse'>
              Password tidak cocok!
            </p>
          )}
          {registerData.confirmPassword.length > 0 && registerData.password === registerData.confirmPassword && (
            <p className='text-[10px] font-bold text-green-650 mt-0.5 flex items-center gap-1'>
              <FaUserCheck className='text-green-500 shrink-0' />
              Password cocok
            </p>
          )}
        </div>

        {/* ReCAPTCHA Container */}
        <div className='flex justify-center py-0.5 overflow-hidden transform scale-90 origin-center'>
          <ReCAPTCHA
            ref={captchaRef}
            sitekey={siteKey}
            onChange={onCaptchaChange}
            theme='light'
          />
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type='submit'
          disabled={registerLoading}
          className='w-full rounded-xl bg-gradient-to-r from-blue-600 via-blue-650 to-indigo-650 py-3.5 px-4 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-70 mt-1'
        >
          {registerLoading ? (
            <span className='flex items-center justify-center gap-2'>
              <FaGraduationCap className='animate-pulse' />
              Mendaftar...
            </span>
          ) : (
            'SIGN UP'
          )}
        </motion.button>
      </form>

      {/* Mobile Switch Link & Footer */}
      <div className='text-center pt-2'>
        <div className='lg:hidden pt-3 border-t border-slate-200/80'>
          <p className='text-xs text-slate-500 font-semibold'>
            Sudah punya akun?{' '}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => switchMode('login')}
              className='font-bold text-blue-650 transition-colors hover:underline ml-1'
            >
              Login di sini
            </motion.button>
          </p>
        </div>
        <p className='text-[11px] text-slate-400 font-semibold mt-1'>
          &copy; {new Date().getFullYear()} Tracer Study SMAN 1 Tawangsari
        </p>
      </div>
    </div>
  );

  return (
    <div className='relative w-screen h-screen min-h-[680px] overflow-hidden bg-slate-50 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between'>
      {/* Background Decorative Rings */}
      <div className='absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none'>
        <div className='absolute -top-[10%] -right-[10%] w-[650px] h-[650px] rounded-full border border-blue-500/10 animate-[spin_180s_linear_infinite]'></div>
        <div className='absolute top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full border border-indigo-500/10'></div>
        <div className='absolute -bottom-[15%] left-[20%] w-[550px] h-[550px] rounded-full bg-blue-400/5 blur-3xl'></div>
        <div className='absolute top-[10%] right-[30%] w-[450px] h-[450px] rounded-full bg-indigo-400/5 blur-3xl'></div>
      </div>

      {/* Floating Top Header Bar */}
      <div className='absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 z-50 flex items-center justify-between gap-2 pointer-events-none'>
        {/* Back to Home Button */}
        <Link
          to='/'
          className='pointer-events-auto inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-650 transition-all group bg-white/90 backdrop-blur-md px-3 sm:px-4 py-2 rounded-full border border-slate-200/90 shadow-md shrink-0'
        >
          <div className='p-1.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all'>
            <FaArrowLeft size={11} />
          </div>
          <span className='hidden sm:inline'>Kembali ke Beranda</span>
          <span className='inline sm:hidden'>Beranda</span>
        </Link>

        {/* Mobile View Top Mode Switcher Pill with Framer Motion Layout Animation */}
        <div className='pointer-events-auto flex lg:hidden bg-slate-200/90 p-1 rounded-full border border-slate-300/80 shadow-inner text-xs font-bold backdrop-blur-md shrink-0 relative'>
          <button
            type='button'
            onClick={() => switchMode('login')}
            className={`relative px-3.5 py-1.5 rounded-full transition-colors duration-200 ${!isSignUp ? 'text-blue-650 font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            {!isSignUp && (
              <motion.div
                layoutId='activeTabPill'
                className='absolute inset-0 bg-white rounded-full shadow-md'
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className='relative z-10'>Masuk</span>
          </button>

          <button
            type='button'
            onClick={() => switchMode('register')}
            className={`relative px-3.5 py-1.5 rounded-full transition-colors duration-200 ${isSignUp ? 'text-blue-650 font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            {isSignUp && (
              <motion.div
                layoutId='activeTabPill'
                className='absolute inset-0 bg-white rounded-full shadow-md'
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className='relative z-10'>Daftar</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. MOBILE VIEW (lg:hidden): FRAMER MOTION SPRING SLIDE   */}
      {/* ======================================================== */}
      <div className='flex lg:hidden relative w-full h-full overflow-hidden z-10'>
        <AnimatePresence mode='wait' initial={false}>
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'register' || mode === 'verify' ? '100%' : '-100%' }}
            animate={{ opacity: 1, x: '0%' }}
            exit={{ opacity: 0, x: mode === 'register' || mode === 'verify' ? '-100%' : '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className='w-full h-full absolute inset-0 p-6 pt-20 pb-8 flex flex-col justify-center items-center overflow-y-auto custom-scrollbar'
          >
            {mode === 'verify'
              ? renderCheckEmailScreen()
              : mode === 'register'
                ? renderRegisterForm()
                : mode === 'forgot'
                  ? renderForgotPasswordForm()
                  : renderLoginForm()}
          </motion.div>
        </AnimatePresence>
      </div>


      {/* ======================================================== */}
      {/* 2. DESKTOP VIEW (lg:flex): UNIFIED FRAMER MOTION SPRING  */}
      {/* ======================================================== */}
      <div className='hidden lg:flex relative w-full h-full z-10'>

        {/* LEFT HALF: LOGIN / FORGOT PASSWORD FORM */}
        <motion.div
          initial={false}
          className='w-1/2 h-full absolute left-0 top-0 p-12 lg:p-16 flex flex-col justify-center items-center overflow-y-auto custom-scrollbar'
          animate={{
            opacity: !isSignUp && mode !== 'verify' ? 1 : 0,
            x: !isSignUp && mode !== 'verify' ? 0 : -60,
            scale: !isSignUp && mode !== 'verify' ? 1 : 0.95,
            pointerEvents: !isSignUp && mode !== 'verify' ? 'auto' : 'none',
            zIndex: !isSignUp && mode !== 'verify' ? 20 : 10,
          }}
          transition={springConfig}
        >
          {mode === 'forgot' ? renderForgotPasswordForm() : renderLoginForm()}
        </motion.div>

        {/* RIGHT HALF: REGISTER FORM */}
        <motion.div
          className='w-1/2 h-full absolute left-1/2 top-0 p-12 lg:p-16 flex flex-col justify-center items-center overflow-y-auto custom-scrollbar'
          animate={{
            opacity: mode === 'register' ? 1 : 0,
            x: mode === 'register' ? 0 : 60,
            scale: mode === 'register' ? 1 : 0.95,
            pointerEvents: mode === 'register' ? 'auto' : 'none',
            zIndex: mode === 'register' ? 20 : 10,
          }}
          transition={springConfig}
        >
          {renderRegisterForm()}
        </motion.div>

        {/* VERIFY EMAIL FULL SCREEN PANEL */}
        <AnimatePresence>
          {mode === 'verify' && (
            <motion.div
              key='verify-panel'
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className='w-full h-full absolute inset-0 z-40 bg-slate-50 flex flex-col justify-center items-center p-12 lg:p-16 overflow-y-auto custom-scrollbar'
            >
              {renderCheckEmailScreen()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* FULL HEIGHT SLIDING OVERLAY PANEL WITH FRAMER MOTION */}
        <motion.div
          initial={false}
          className='w-1/2 h-full absolute top-0 left-0 z-30 shadow-2xl overflow-hidden pointer-events-auto'
          animate={{ x: isSignUp ? '0%' : '100%' }}
          transition={springConfig}
        >
          {/* Double-width inner container that slides content synchronously */}
          <motion.div
            initial={false}
            className='relative w-[200%] h-full flex bg-gradient-to-br from-blue-600 via-blue-650 to-indigo-700 text-white shadow-2xl'
            animate={{ x: isSignUp ? '0%' : '-50%' }}
            transition={springConfig}
          >
            {/* Background Decorative Rings & Glows */}
            <div className='absolute inset-0 overflow-hidden pointer-events-none opacity-25'>
              <div className='absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full border-2 border-white/30 animate-[spin_180s_linear_infinite]'></div>
              <div className='absolute -bottom-32 -right-32 w-[550px] h-[550px] rounded-full border-2 border-white/30'></div>
              <div className='absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl'></div>
              <div className='absolute top-1/3 right-1/4 -translate-y-1/2 w-[450px] h-[450px] bg-indigo-400/20 rounded-full blur-3xl'></div>
            </div>

            {/* OVERLAY PANEL LEFT (Visible when isSignUp is TRUE - Prompts to SIGN IN) */}
            <motion.div
              animate={{ opacity: isSignUp ? 1 : 0.4, scale: isSignUp ? 1 : 0.95 }}
              transition={springConfig}
              className='w-1/2 h-full p-12 lg:p-16 flex flex-col justify-center items-center text-center relative z-10 select-none'
            >
              <div className='flex items-center gap-3 mb-6 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 shadow-md'>
                <img src='/logo.png' alt='Logo' className='w-8 h-8 filter drop-shadow' />
                <span className='font-extrabold text-xs sm:text-sm tracking-wider uppercase text-white'>
                  Tracer Study SMANTA
                </span>
              </div>
              <p className='text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-sm mb-4 leading-tight'>
                Selamat Datang Kembali!
              </p>
              <p className='text-base text-blue-100 font-medium leading-relaxed max-w-lg mb-10'>
                Untuk tetap terhubung dengan sekolah dan rekan alumni SMAN 1 Tawangsari, silakan masuk ke akun Anda.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type='button'
                onClick={() => switchMode('login')}
                className='px-10 py-4 rounded-full border-2 border-white text-white font-extrabold text-sm tracking-widest hover:bg-white hover:text-blue-700 transition-all duration-300 shadow-2xl uppercase'
              >
                SIGN IN
              </motion.button>
            </motion.div>

            {/* OVERLAY PANEL RIGHT (Visible when isSignUp is FALSE - Prompts to SIGN UP) */}
            <motion.div
              animate={{ opacity: !isSignUp ? 1 : 0.4, scale: !isSignUp ? 1 : 0.95 }}
              transition={springConfig}
              className='w-1/2 h-full p-12 lg:p-16 flex flex-col justify-center items-center text-center relative z-10 select-none'
            >
              <div className='flex items-center gap-3 mb-6 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 shadow-md'>
                <img src='/logo.png' alt='Logo' className='w-8 h-8 filter drop-shadow' />
                <span className='font-extrabold text-xs sm:text-sm tracking-wider uppercase text-white'>
                  Tracer Study SMANTA
                </span>
              </div>
              <p className='text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-sm mb-4 leading-tight'>
                Halo, SMANTA!
              </p>
              <p className='text-base text-blue-100 font-medium leading-relaxed max-w-lg mb-10'>
                Belum punya akun? Daftarkan diri Anda sekarang untuk membantu pemutakhiran data &amp; memperluas jejaring alumni!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type='button'
                onClick={() => switchMode('register')}
                className='px-10 py-4 rounded-full border-2 border-white text-white font-extrabold text-sm tracking-widest hover:bg-white hover:text-blue-700 transition-all duration-300 shadow-2xl uppercase'
              >
                SIGN UP
              </motion.button>
            </motion.div>

          </motion.div>
        </motion.div>

      </div>
    </div>
  );
};

export default AuthLayout;
