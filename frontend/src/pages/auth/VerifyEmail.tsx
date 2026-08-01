import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaEnvelope, FaSpinner, FaPaperPlane } from 'react-icons/fa';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const hasCalledVerify = useRef(false);

  type Status = 'loading' | 'success' | 'error' | 'no-token';
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  // State untuk Kirim Ulang Email di Halaman Verifikasi
  const [resendEmail, setResendEmail] = useState('');
  const [showResendForm, setShowResendForm] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [resendError, setResendError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    if (hasCalledVerify.current) return;
    hasCalledVerify.current = true;

    const verify = async () => {
      try {
        const res = await axios.get(`/api/auth/verify-email?token=${token}`);
        setMessage(res.data.message || 'Email berhasil diverifikasi!');
        setStatus('success');
      } catch (err: any) {
        setMessage(
          err.response?.data?.message ||
            'Token verifikasi tidak valid atau sudah kedaluwarsa.'
        );
        setStatus('error');
      }
    };

    verify();
  }, [token]);

  // Cooldown countdown untuk resend email
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // Countdown redirect setelah sukses verifikasi
  useEffect(() => {
    if (status !== 'success') return;
    if (countdown <= 0) {
      navigate('/login', {
        state: { successMessage: 'Email berhasil diverifikasi! Silakan login.' },
      });
      return;
    }
    const t = setTimeout(() => setCountdown((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, navigate]);

  const handleResendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail || resendLoading || resendCooldown > 0) return;

    setResendLoading(true);
    setResendError('');
    setResendSuccess('');

    try {
      const res = await axios.post('/api/auth/resend-verification', {
        email: resendEmail,
      });
      setResendSuccess(
        res.data.message || 'Email verifikasi baru telah dikirim! Silakan periksa inbox/spam Anda.'
      );
      setResendCooldown(60);
    } catch (err: any) {
      setResendError(
        err.response?.data?.message || 'Gagal mengirim ulang email verifikasi.'
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className='relative w-screen h-screen bg-slate-50 font-sans flex flex-col items-center justify-center overflow-hidden selection:bg-blue-600 selection:text-white'>
      {/* Background decorative blobs */}
      <div className='absolute inset-0 pointer-events-none overflow-hidden'>
        <div className='absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-blue-400/8 blur-3xl' />
        <div className='absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-400/8 blur-3xl' />
      </div>

      {/* Back to home */}
      <Link
        to='/'
        className='absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition-all bg-white/90 backdrop-blur-md px-3 py-2 rounded-full border border-slate-200/90 shadow-md'
      >
        <FaArrowLeft size={11} />
        <span>Beranda</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className='w-full max-w-md mx-auto px-6'
      >
        <div className='bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 space-y-6 text-center'>
          {/* LOADING */}
          {status === 'loading' && (
            <>
              <div className='flex justify-center'>
                <div className='w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center'>
                  <FaSpinner className='text-blue-500 text-3xl animate-spin' />
                </div>
              </div>
              <h2 className='text-xl font-extrabold text-slate-900'>Memverifikasi Email...</h2>
              <p className='text-sm text-slate-500 font-medium'>
                Mohon tunggu, kami sedang memproses verifikasi akun Anda.
              </p>
            </>
          )}

          {/* SUCCESS */}
          {status === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className='flex justify-center'
              >
                <div className='w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center shadow-lg shadow-emerald-100'>
                  <FaCheckCircle className='text-emerald-500 text-4xl' />
                </div>
              </motion.div>
              <div className='space-y-2'>
                <h2 className='text-xl font-extrabold text-slate-900'>Email Terverifikasi!</h2>
                <p className='text-sm text-slate-500 font-medium leading-relaxed'>
                  {message}
                </p>
              </div>
              <div className='bg-emerald-50 border border-emerald-200 rounded-xl p-4'>
                <p className='text-sm font-bold text-emerald-800'>
                  Anda akan diarahkan ke halaman login dalam{' '}
                  <span className='text-emerald-600 text-lg'>{countdown}</span> detik...
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  navigate('/login', {
                    state: { successMessage: 'Email berhasil diverifikasi! Silakan login.' },
                  })
                }
                className='w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40'
              >
                Login Sekarang
              </motion.button>
            </>
          )}

          {/* ERROR / EXPIRED */}
          {(status === 'error' || status === 'no-token') && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className='flex justify-center'
              >
                <div className='w-20 h-20 rounded-full bg-red-50 flex items-center justify-center shadow-lg shadow-red-100'>
                  <FaTimesCircle className='text-red-500 text-4xl' />
                </div>
              </motion.div>
              <div className='space-y-2'>
                <h2 className='text-xl font-extrabold text-slate-900'>Verifikasi Gagal</h2>
                <p className='text-sm text-slate-500 font-medium leading-relaxed'>
                  {status === 'no-token'
                    ? 'Token verifikasi tidak ditemukan. Pastikan Anda membuka link yang benar dari email.'
                    : message}
                </p>
              </div>

              {!showResendForm ? (
                <>
                  <div className='bg-amber-50 border border-amber-200 rounded-xl p-4 text-left space-y-1'>
                    <p className='text-sm font-bold text-amber-900'>Apa yang bisa dilakukan?</p>
                    <ul className='text-xs text-amber-700 font-medium space-y-1 list-disc list-inside'>
                      <li>Cek apakah link sudah kedaluwarsa (berlaku 24 jam)</li>
                      <li>Minta kirim ulang email verifikasi menggunakan tombol di bawah</li>
                      <li>Pastikan Anda membuka link terbaru dari email</li>
                    </ul>
                  </div>
                  <div className='flex flex-col gap-3'>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowResendForm(true)}
                      className='w-full rounded-xl border-2 border-blue-600 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2'
                    >
                      <FaEnvelope />
                      Minta Kirim Ulang Email
                    </motion.button>
                    <button
                      onClick={() => navigate('/login')}
                      className='text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center justify-center gap-1.5'
                    >
                      <FaArrowLeft size={10} /> Kembali ke Login
                    </button>
                  </div>
                </>
              ) : (
                <motion.form
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleResendSubmit}
                  className='space-y-4 text-left border-t border-slate-100 pt-4'
                >
                  <p className='text-xs font-bold text-slate-700 text-center'>
                    Masukkan email Anda untuk menerima link verifikasi baru:
                  </p>
                  <div>
                    <input
                      type='email'
                      required
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder='nama@email.com'
                      className='w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium transition-all'
                    />
                  </div>

                  {resendSuccess && (
                    <div className='bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl p-3 flex items-start gap-2'>
                      <FaCheckCircle className='text-emerald-500 shrink-0 mt-0.5' />
                      <span>{resendSuccess}</span>
                    </div>
                  )}

                  {resendError && (
                    <div className='bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl p-3'>
                      {resendError}
                    </div>
                  )}

                  <div className='flex flex-col gap-2'>
                    <motion.button
                      whileHover={{ scale: resendCooldown > 0 || resendLoading ? 1 : 1.01 }}
                      whileTap={{ scale: resendCooldown > 0 || resendLoading ? 1 : 0.98 }}
                      type='submit'
                      disabled={resendCooldown > 0 || resendLoading || !resendEmail}
                      className='w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                    >
                      {resendLoading ? (
                        <>
                          <FaSpinner className='animate-spin' />
                          <span>Mengirim...</span>
                        </>
                      ) : resendCooldown > 0 ? (
                        <span>Kirim Ulang ({resendCooldown}s)</span>
                      ) : (
                        <>
                          <FaPaperPlane />
                          <span>Kirim Email Verifikasi</span>
                        </>
                      )}
                    </motion.button>
                    <button
                      type='button'
                      onClick={() => setShowResendForm(false)}
                      className='text-xs font-bold text-slate-400 hover:text-slate-600 text-center py-1'
                    >
                      Batal
                    </button>
                  </div>
                </motion.form>
              )}
            </>
          )}
        </div>

        <p className='text-center text-[11px] text-slate-400 font-semibold mt-6'>
          &copy; {new Date().getFullYear()} Tracer Study SMAN 1 Tawangsari
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
