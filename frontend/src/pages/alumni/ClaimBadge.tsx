import { useState } from 'react';
import axios from 'axios';
import { FaMedal, FaTicketAlt } from 'react-icons/fa';
import Toast from '@/components/toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import RestrictedAccess from '@/components/RestrictedAccess';

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

  if (user?.questionnaireCompleted === false) {
    return <RestrictedAccess type='questionnaire_incomplete' role='alumni' />;
  }

  return (
    <div className='min-h-[80vh] flex items-center justify-center p-5 page-fade-in'>
      <div className='max-w-md w-full bg-[color:var(--bg-card)] rounded-2xl border border-[color:var(--border-color)] shadow-xl overflow-hidden'>
        <div className='bg-[var(--primary)] p-8 text-center text-white'>
          <div className='w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4'>
            <FaMedal className='text-4xl' />
          </div>
          <h1 className='text-lg md:text-xl font-bold mb-2'>
            Klaim Badge Prestasi
          </h1>
          <p className='text-white/80 text-xs md:text-sm'>
            Masukkan kode unik yang Anda terima untuk mendapatkan badge khusus
            di profil Anda.
          </p>
        </div>

        <div className='p-8'>
          <form onSubmit={handleClaim} className='space-y-6'>
            <div>
              <label className='block text-xs md:text-sm font-bold text-[color:var(--text-secondary)] mb-2 uppercase tracking-wide'>
                Kode Badge
              </label>
              <div className='relative'>
                <FaTicketAlt className='absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)]' />
                <input
                  type='text'
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className='w-full pl-11 pr-4 py-3 rounded-xl bg-[color:var(--bg-tertiary)] border border-transparent focus:border-[var(--primary)] outline-none transition-all font-mono text-center text-lg tracking-widest'
                  placeholder='XXXXXXXX'
                  required
                />
              </div>
            </div>

            <button
              type='submit'
              disabled={loading || !code}
              className='w-full py-3 bg-[var(--primary)] text-white text-xs md:text-sm font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--primary)]/30'
            >
              {loading ? 'Memproses...' : 'Klaim Badge Sekarang'}
            </button>
          </form>

          <div className='mt-6 pt-6 border-t border-[color:var(--border-color)] text-center'>
            <p className='text-xs text-[color:var(--text-tertiary)]'>
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
