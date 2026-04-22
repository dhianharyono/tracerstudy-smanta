import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaBriefcase, 
  FaCheck, 
  FaTimes, 
  FaClock, 
  FaUser, 
  FaExclamationCircle
} from 'react-icons/fa';
import Toast from '@/components/toast';
import SmartLoader from '@/components/SmartLoader';

const AdminOpportunityManagement = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [expandedJobs, setExpandedJobs] = useState<string[]>([]);
  
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchAllJobs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/jobs/admin', { params: { status: filterStatus } });
      setJobs(res.data);
      setExpandedJobs([]); // Reset expansions on filter change
    } catch (error) {
      console.error(error);
      Toast('Gagal memuat data moderasi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllJobs();
  }, [filterStatus]);

  const toggleExpand = (jobId: string) => {
    setExpandedJobs(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  const handleApprove = async (id: string) => {
    try {
      await axios.patch(`/api/jobs/${id}/status`, { status: 'approved' });
      Toast('Lowongan berhasil disetujui', 'success');
      setJobs(jobs.filter(j => j._id !== id));
    } catch (error) {
      Toast('Gagal menyetujui lowongan', 'error');
    }
  };

  const openRejectModal = (job: any) => {
    setSelectedJob(job);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      return Toast('Alasan penolakan harus diisi', 'error');
    }
    
    setSubmitLoading(true);
    try {
      await axios.patch(`/api/jobs/${selectedJob._id}/status`, { 
        status: 'rejected', 
        rejectionReason 
      });
      Toast('Lowongan telah ditolak', 'success');
      setJobs(jobs.filter(j => j._id !== selectedJob._id));
      setIsRejectModalOpen(false);
    } catch (error) {
      Toast('Gagal menolak lowongan', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading && jobs.length === 0) return <SmartLoader />;

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-[color:var(--text-primary)] !mb-1">Moderasi Bursa Kerja</h1>
        <p className="text-[color:var(--text-secondary)] text-sm">Tinjau dan setujui peluang karir yang diposting oleh alumni</p>
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {['pending', 'approved', 'rejected', 'closed'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all whitespace-nowrap ${
              filterStatus === status 
                ? 'bg-[var(--primary)] text-white shadow-md' 
                : 'bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] hover:bg-gray-200'
            }`}
          >
            {status === 'pending' ? 'Perlu Moderasi' : status}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {jobs.length > 0 ? (
          jobs.map((job) => {
            const isExpanded = expandedJobs.includes(job._id);
            return (
              <div key={job._id} className="bg-[color:var(--bg-card)] rounded-2xl border border-[color:var(--border-color)] overflow-hidden shadow-sm flex flex-col h-fit transition-all duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[color:var(--bg-tertiary)] flex items-center justify-center text-xl text-[var(--primary)]">
                        <FaBriefcase />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[color:var(--text-primary)] !mb-0">{job.title}</h3>
                        <p className="text-xs text-[color:var(--text-secondary)] font-semibold">{job.company}</p>
                      </div>
                    </div>
                    {filterStatus === 'pending' && (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-600">
                        <FaClock />
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-y-3 text-xs">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[color:var(--text-tertiary)] mb-0.5">Kategori</p>
                        <p className="text-[color:var(--text-primary)] font-medium">{job.category}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[color:var(--text-tertiary)] mb-0.5">Tipe</p>
                        <p className="text-[color:var(--text-primary)] font-medium">{job.type}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] uppercase font-bold text-[color:var(--text-tertiary)] mb-0.5">Pemosting</p>
                        <div className="flex items-center gap-2 text-[color:var(--text-secondary)]">
                          <FaUser className="text-[10px]" />
                          <span className="font-semibold">{job.postedBy?.profile?.fullName || job.postedBy?.username}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-[color:var(--text-tertiary)] mb-1 flex justify-between items-center">
                        Isi Lowongan
                        <button 
                          onClick={() => toggleExpand(job._id)}
                          className="text-[var(--primary)] hover:underline capitalize"
                        >
                          {isExpanded ? 'Sembunyikan' : 'Lihat Selengkapnya'}
                        </button>
                      </p>
                      <div className={`text-xs text-[color:var(--text-secondary)] italic transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
                        <p className="whitespace-pre-wrap">"{job.description}"</p>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="pt-4 border-t border-[color:var(--border-color)] animate-fade-in">
                        {job.requirements && job.requirements.length > 0 && (
                          <div className="mb-4">
                            <p className="text-[10px] uppercase font-bold text-[color:var(--text-tertiary)] mb-1">Persyaratan</p>
                            <ul className="list-disc list-inside text-xs text-[color:var(--text-secondary)] space-y-1">
                              {job.requirements.map((req: string, idx: number) => (
                                <li key={idx}>{req}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] uppercase font-bold text-[color:var(--text-tertiary)] mb-1">Link Pendaftaran</p>
                          {job.applicationLink ? (
                            <a href={job.applicationLink} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline break-all">
                              {job.applicationLink}
                            </a>
                          ) : (
                            <p className="text-xs text-[color:var(--text-tertiary)] italic">Tidak ada link (Hubungi kontak alumni)</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-[color:var(--border-color)] flex gap-3">
                    {filterStatus === 'pending' ? (
                      <>
                        <button 
                          onClick={() => handleApprove(job._id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white text-xs font-bold rounded-xl hover:bg-green-600 transition-all shadow-sm"
                        >
                          <FaCheck />
                          Approve
                        </button>
                        <button 
                          onClick={() => openRejectModal(job)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-all shadow-sm"
                        >
                          <FaTimes />
                          Reject
                        </button>
                      </>
                    ) : (
                      <button 
                        disabled
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] text-xs font-bold rounded-xl"
                      >
                        {isExpanded ? 'Detail Info' : 'Postingan Telah Diproses'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center bg-[color:var(--bg-card)] rounded-3xl border border-dashed border-[color:var(--border-color)]">
            <FaCheck className="text-4xl text-green-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[color:var(--text-primary)]">Tidak ada data</h3>
            <p className="text-sm text-[color:var(--text-secondary)]">Semua lowongan sudah diproses atau tidak ditemukan yang sesuai filter.</p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-[color:var(--bg-card)] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 bg-red-500 text-white">
              <div className="flex items-center gap-3 mb-2">
                <FaExclamationCircle className="text-2xl" />
                <h2 className="text-xl font-bold !mb-0">Tolak Lowongan</h2>
              </div>
              <p className="text-white/80 text-xs">Berikan alasan penolakan agar alumni dapat merevisi data mereka.</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-[color:var(--text-tertiary)] mb-2 block tracking-wide">
                  Alasan Penolakan
                </label>
                <textarea 
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Contoh: Deskripsi kurang jelas atau kategori tidak sesuai..."
                  className="w-full p-4 rounded-2xl bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] text-sm focus:border-red-400 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleReject}
                  disabled={submitLoading}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 disabled:opacity-50 transition-all"
                >
                  {submitLoading ? 'Memproses...' : 'Tolak & Kirim Alasan'}
                </button>
                <button 
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-6 py-3 bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] font-bold rounded-2xl hover:bg-gray-200 transition-all"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOpportunityManagement;
