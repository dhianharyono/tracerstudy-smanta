import { useState } from 'react';
import axios from 'axios';
import { FaGraduationCap, FaCheckCircle, FaTimes } from 'react-icons/fa';
import Toast from '@/components/toast';
import { motion, AnimatePresence } from 'framer-motion';

interface GraduationConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const GraduationConfirmationModal = ({ isOpen, onClose, onSuccess }: GraduationConfirmationModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await axios.post('/api/student/confirm-graduation');
      Toast('Selamat! Anda sekarang terdaftar sebagai Alumni.', 'success');
      onSuccess();
    } catch (error: any) {
      Toast(error.response?.data?.message || 'Gagal memproses kelulusan', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[color:var(--bg-card)] border border-[color:var(--border-color)] shadow-2xl"
          >
            {/* Header Illustration */}
            <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white rounded-full blur-2xl"></div>
              </div>
              <motion.div
                initial={{ rotate: -20, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30"
              >
                <FaGraduationCap className="text-white text-3xl" />
              </motion.div>
            </div>

            <div className="p-8 text-center">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>

              <h2 className="text-2xl font-black text-[color:var(--text-primary)] mb-3 leading-tight">
                Selamat atas Kelulusanmu! 🥳
              </h2>
              <p className="text-sm text-[color:var(--text-secondary)] mb-6 leading-relaxed">
                Bulan Mei adalah momen spesial bagi siswa kelas 12. Jika kamu sudah resmi lulus, mari bergabung sebagai bagian dari Keluarga Besar Alumni SMANTA.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 mb-8 flex items-start gap-3 text-left">
                <FaCheckCircle className="text-blue-500 mt-1 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-tighter mb-1">
                    Apa yang berubah?
                  </p>
                  <p className="text-[11px] text-blue-700 dark:text-blue-200 leading-normal font-medium">
                    Role Anda akan berubah menjadi <span className="font-bold underline decoration-blue-500/50 underline-offset-2">Alumni</span>. Anda akan memiliki akses ke fitur Alumni, mengisi kuesioner tracer study, dan tetap terhubung dengan sekolah.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full py-4 px-6 bg-[color:var(--primary)] hover:bg-[color:var(--primary-dark)] text-white font-black rounded-2xl shadow-lg shadow-[var(--primary)]/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? 'Memproses...' : (
                    <>
                      <FaCheckCircle /> Yes, Saya Sudah Lulus!
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="w-full py-3 px-6 text-[color:var(--text-secondary)] font-bold rounded-2xl hover:bg-[color:var(--bg-tertiary)] transition-all grayscale opacity-70 hover:opacity-100 disabled:opacity-50"
                >
                  Belum, Masih Berjuang
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

};

export default GraduationConfirmationModal;
