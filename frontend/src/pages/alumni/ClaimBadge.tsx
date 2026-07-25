import { useState } from 'react';
import axios from 'axios';
import { FaMedal, FaTicketAlt } from 'react-icons/fa';
import Toast from '@/components/toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import RestrictedAccess from '@/components/RestrictedAccess';
import { isUniversityIncomplete } from '@/utils/validation';

const ClaimBadge = () => {
  const { updateUser, user } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/alumni/badges/claim', { code });
      Toast('Badge berhasil diklaim!', 'success');

      const userRes = await axios.get('/api/users/profile');
      updateUser(userRes.data);

      navigate('/alumni');
    } catch (error: any) {
      Toast(error.response?.data?.message || 'Gagal klaim badge', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.questionnaireCompleted) {
    return <RestrictedAccess type='questionnaire_incomplete' role='alumni' />;
  }

  if (user && isUniversityIncomplete(user)) {
    return <RestrictedAccess type='university_incomplete' role='alumni' />;
  }

  return (
    <div className='min-h-[80vh] flex items-center justify-center p-4 sm:p-6 page-fade-in'>
      <div className='max-w-md w-full bg-[color:var(--bg-card)] rounded-3xl border border-[color:var(--border-color)] shadow-2xl overflow-hidden'>
        {/* Card Header */}
        <div className='relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-8 text-center text-white'>
          <div className='absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none' />
          <div className='relative z-10'>
            <div className='w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 flex items-center justify-center mb-4 text-white shadow-xl shadow-blue-500/20'>
              <FaMedal className='text-3xl sm:text-4xl text-amber-300 drop-shadow-md' />
            </div>
            <h1 className='text-lg sm:text-xl font-extrabold text-white mb-2 tracking-tight'>
              Klaim Badge Prestasi
            </h1>
            <p className='text-blue-100/90 text-xs sm:text-sm font-medium leading-relaxed max-w-xs mx-auto'>
              Masukkan kode unik yang Anda terima untuk mendapatkan badge khusus di profil Anda.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className='p-6 sm:p-8 space-y-6'>
          <form onSubmit={handleClaim} className='space-y-6'>
            <div className='space-y-2'>
              <label className='block text-xs font-extrabold text-[color:var(--text-secondary)] uppercase tracking-wider'>
                Kode Badge
              </label>
              <div className='relative'>
                <FaTicketAlt className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm' />
                <input
                  type='text'
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className='w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[color:var(--bg-tertiary)]/70 border border-[color:var(--border-color)] focus:border-blue-600 focus:bg-[color:var(--bg-card)] focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-mono text-center text-base sm:text-lg font-bold tracking-widest text-[color:var(--text-primary)] shadow-sm'
                  placeholder='XXXXXXXX'
                  required
                />
              </div>
            </div>

            <button
              type='submit'
              disabled={loading || !code}
              className='w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-extrabold rounded-2xl hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none shadow-md shadow-blue-500/20'
            >
              {loading ? 'Memproses...' : 'Klaim Badge Sekarang'}
            </button>
          </form>

          <div className='pt-5 border-t border-[color:var(--border-color)] text-center'>
            <p className='text-xs text-[color:var(--text-tertiary)] leading-relaxed'>
              Badge akan ditampilkan di profil dan dashboard Anda, serta dapat
              dilihat oleh siswa sebagai tanda verifikasi prestasi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimBadge;
