import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaTimes,
  FaArrowLeft,
  FaKey,
} from 'react-icons/fa';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Password rules validation
  const rules = [
    { label: 'Minimal 8 karakter', valid: password.length >= 8 },
    { label: 'Mengandung huruf besar (A-Z)', valid: /[A-Z]/.test(password) },
    { label: 'Mengandung huruf kecil (a-z)', valid: /[a-z]/.test(password) },
    { label: 'Mengandung angka (0-9)', valid: /\d/.test(password) },
    { label: 'Mengandung simbol (@$!%*?&)', valid: /[@$!%*?&]/.test(password) },
  ];

  const allRulesValid = rules.every((r) => r.valid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Token reset password tidak ditemukan pada URL.');
      return;
    }

    if (!allRulesValid) {
      setError('Password belum memenuhi seluruh kriteria keamanan.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/auth/reset-password', {
        token,
        password,
      });

      setSuccess(response.data.message || 'Password berhasil diperbarui!');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Gagal memperbarui password. Token mungkin sudah kedaluwarsa atau tidak valid.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='relative w-screen h-screen min-h-[680px] overflow-hidden bg-slate-50 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between items-center'>
      {/* Background Decorative Rings & Blur Glows matching AuthLayout */}
      <div className='absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none'>
        <div className='absolute -top-[10%] -right-[10%] w-[650px] h-[650px] rounded-full border border-blue-500/10 animate-[spin_180s_linear_infinite]'></div>
        <div className='absolute top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full border border-indigo-500/10'></div>
        <div className='absolute -bottom-[15%] left-[20%] w-[550px] h-[550px] rounded-full bg-blue-400/10 blur-3xl'></div>
        <div className='absolute top-[10%] right-[30%] w-[450px] h-[450px] rounded-full bg-indigo-400/10 blur-3xl'></div>
      </div>

      {/* Floating Header */}
      <div className='absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 z-50 flex items-center justify-between pointer-events-none'>
        <Link
          to='/'
          className='pointer-events-auto inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-650 transition-all group bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200/90 shadow-md'
        >
          <div className='p-1.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all'>
            <FaArrowLeft size={11} />
          </div>
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* Main Content Card */}
      <div className='w-full h-full flex items-center justify-center p-4 sm:p-6 z-10 relative overflow-y-auto custom-scrollbar'>
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 26 }}
          className='w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-500/10 my-auto'
        >
          {/* Header */}
          {!success && <div className='text-center space-y-2 mb-6'>
            <div className='inline-flex items-center justify-center p-3.5 bg-blue-50 rounded-2xl shadow-sm mb-1 border border-blue-100'>
              <img src='/logo.png' alt='Logo SMANTA' className='h-12 w-12 filter drop-shadow-sm' />
            </div>
            <h1 className='text-2xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2'>
              <FaKey className='text-blue-600 text-xl' /> Reset Password
            </h1>
            <p className='text-xs sm:text-sm text-slate-500 font-bold'>
              Silakan buat password baru yang kuat untuk akun Tracer Study Anda.
            </p>
          </div>}

          {/* Error Message */}
          {error && (
            <div className='mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 font-semibold shadow-sm animate-slide-up'>
              <svg className='h-5 w-5 shrink-0 text-red-500 mt-0.5' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Success Message & CTA */}
          {success ? (
            <div className='space-y-6 text-center py-4 animate-slide-up'>
              <div className='inline-flex items-center justify-center w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl mb-1 shadow-sm'>
                <FaCheck size={26} />
              </div>
              <div className='space-y-2'>
                <h2 className='text-xl font-extrabold text-slate-900'>Password Berhasil Diubah!</h2>
                <p className='text-xs text-slate-600 font-semibold leading-relaxed'>{success}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/login')}
                className='w-full rounded-xl bg-gradient-to-r from-blue-600 via-blue-650 to-indigo-650 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40'
              >
                LOGIN DENGAN PASSWORD BARU
              </motion.button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
              {/* New Password */}
              <div className='flex flex-col gap-2'>
                <label className='block text-xs font-bold uppercase tracking-widest text-slate-400'>
                  Password Baru
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
                    placeholder='Masukkan password baru'
                    className='w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-10 pr-12 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
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

              {/* Real-time Password Strength Criteria */}
              {password.length > 0 && (
                <div className='p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5 text-xs'>
                  <p className='font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wider'>
                    Kriteria Password:
                  </p>
                  {rules.map((rule, idx) => (
                    <div key={idx} className='flex items-center gap-2'>
                      {rule.valid ? (
                        <FaCheck className='text-emerald-500 shrink-0' size={11} />
                      ) : (
                        <FaTimes className='text-slate-400 shrink-0' size={11} />
                      )}
                      <span className={rule.valid ? 'text-emerald-700 font-bold' : 'text-slate-500 font-medium'}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Confirm Password */}
              <div className='flex flex-col gap-2'>
                <label className='block text-xs font-bold uppercase tracking-widest text-slate-400'>
                  Konfirmasi Password Baru
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400'>
                    <FaLock />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder='Ulangi password baru'
                    className='w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-10 pr-12 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-0 top-0 h-full px-3.5 text-slate-400 hover:text-slate-650 transition-colors'
                  >
                    {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type='submit'
                disabled={loading || !token}
                className='w-full rounded-xl bg-gradient-to-r from-blue-600 via-blue-650 to-indigo-650 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-70 mt-2'
              >
                {loading ? (
                  <span className='flex items-center justify-center gap-2'>
                    <svg className='animate-spin h-5 w-5 text-white' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Menyimpan Password...
                  </span>
                ) : (
                  'SIMPAN PASSWORD BARU'
                )}
              </motion.button>

              <div className='text-center pt-2'>
                <Link
                  to='/login'
                  className='inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-650 transition-colors'
                >
                  <FaArrowLeft size={12} /> Kembali ke halaman Login
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <div className='pb-4 text-center z-10 relative'>
        <p className='text-[11px] text-slate-400 font-semibold'>
          &copy; {new Date().getFullYear()} Tracer Study SMAN 1 Tawangsari
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
