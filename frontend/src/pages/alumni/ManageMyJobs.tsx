import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaBriefcase, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock,
  FaExclamationTriangle,
  FaPowerOff
} from 'react-icons/fa';
import Toast from '@/components/toast';
import ConfirmationModal from '@/components/ConfirmationModal';
import SmartLoader from '@/components/SmartLoader';
import { useAuth } from '@/contexts/AuthContext';
import RestrictedAccess from '@/components/RestrictedAccess';
import { isUniversityIncomplete } from '@/utils/validation';

const ManageMyJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchMyJobs = async () => {
    try {
      const res = await axios.get('/api/jobs/my');
      setJobs(res.data);
    } catch (error) {
      console.error(error);
      Toast('Gagal memuat data lowongan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const handleDelete = async () => {
    if (!selectedJobId) return;
    try {
      await axios.delete(`/api/jobs/${selectedJobId}`);
      Toast('Lowongan berhasil dihapus', 'success');
      setJobs(jobs.filter(j => j._id !== selectedJobId));
    } catch (error) {
      Toast('Gagal menghapus lowongan', 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedJobId(null);
    }
  };

  const handleCloseJob = async (id: string) => {
    try {
      await axios.patch(`/api/jobs/${id}/close`);
      Toast('Lowongan telah ditutup', 'success');
      fetchMyJobs();
    } catch (error) {
      Toast('Gagal menutup lowongan', 'error');
    }
  };

  const getStatusBadge = (status: string, expiryDate: string) => {
    const isExpired = new Date(expiryDate) < new Date();
    
    if (status === 'approved') {
      if (isExpired) return { label: 'Sudah Berakhir', icon: FaClock, color: 'text-gray-500 bg-gray-100 dark:bg-gray-800' };
      return { label: 'Aktif / Tayang', icon: FaCheckCircle, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' };
    }
    if (status === 'pending') return { label: 'Menunggu Moderasi', icon: FaClock, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' };
    if (status === 'rejected') return { label: 'Ditolak Admin', icon: FaTimesCircle, color: 'text-red-600 bg-red-100 dark:bg-red-900/30' };
    if (status === 'closed') return { label: 'Ditutup', icon: FaPowerOff, color: 'text-gray-500 bg-gray-100 dark:bg-gray-800' };
    return { label: status, icon: FaBriefcase, color: 'text-gray-500 bg-gray-100' };
  };

  if (loading) return <SmartLoader />;

  // Alumni Restrictions
  if (user?.role === 'alumni') {
    const hasUniversityData = !!(user?.university?.name);
    if (user.questionnaireCompleted === false && !hasUniversityData) {
      return <RestrictedAccess type='questionnaire_incomplete' role='alumni' />;
    }
    if (isUniversityIncomplete(user)) {
      return <RestrictedAccess type='university_incomplete' role='alumni' />;
    }
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-[color:var(--text-primary)] !mb-1">Kelola Loker Saya</h1>
          <p className="text-[color:var(--text-secondary)] text-sm">Pantau status moderasi dan kelola lowongan aktif Anda</p>
        </div>
        <Link 
          to="/alumni/jobs/new"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl shadow-lg shadow-[var(--primary)]/20 hover:opacity-90 transition-all"
        >
          <FaPlus />
          Posting Loker
        </Link>
      </div>

      <div className="bg-[color:var(--bg-card)] rounded-2xl border border-[color:var(--border-color)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[color:var(--bg-tertiary)] border-b border-[color:var(--border-color)]">
                <th className="px-6 py-4 text-xs font-bold text-[color:var(--text-secondary)] uppercase tracking-wider">Lowongan</th>
                <th className="px-6 py-4 text-xs font-bold text-[color:var(--text-secondary)] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-[color:var(--text-secondary)] uppercase tracking-wider">Batas Akhir</th>
                <th className="px-6 py-4 text-xs font-bold text-[color:var(--text-secondary)] uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border-color)]">
              {jobs.length > 0 ? (
                jobs.map((job) => {
                  const status = getStatusBadge(job.status, job.expiryDate);
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={job._id} className="hover:bg-[color:var(--bg-tertiary)]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[color:var(--text-primary)] text-sm md:text-base">{job.title}</div>
                        <div className="text-xs text-[color:var(--text-secondary)]">{job.company}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${status.color}`}>
                            <StatusIcon />
                            {status.label}
                          </span>
                          {job.status === 'rejected' && job.rejectionReason && (
                            <div className="flex items-start gap-1 p-2 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20 max-w-xs">
                              <FaExclamationTriangle className="text-red-500 shrink-0 mt-0.5 text-[10px]" />
                              <p className="text-[10px] text-red-600 dark:text-red-400 italic">
                                "{job.rejectionReason}"
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[color:var(--text-secondary)]">
                        {new Date(job.expiryDate).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {job.status === 'approved' && (
                            <button 
                              onClick={() => handleCloseJob(job._id)}
                              className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Tutup Lowongan"
                            >
                              <FaPowerOff />
                            </button>
                          )}
                          <Link 
                            to={`/alumni/jobs/edit/${job._id}`}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit / Revisi"
                          >
                            <FaEdit />
                          </Link>
                          <button 
                            onClick={() => {
                              setSelectedJobId(job._id);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[color:var(--text-tertiary)] italic text-sm">
                    Anda belum memposting lowongan apapun.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Lowongan"
        message="Apakah Anda yakin ingin menghapus postingan lowongan ini secara permanen?"
        confirmText="Ya, Hapus"
        cancelText="Batal"
      />
    </div>
  );
};

export default ManageMyJobs;
