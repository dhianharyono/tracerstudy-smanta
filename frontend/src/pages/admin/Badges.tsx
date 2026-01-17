import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaPlus, FaMedal } from 'react-icons/fa';
import Toast from '@/components/toast';
import LoadingSpinner from '@/components/LoadingSpinner';

const AdminBadges = () => {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBadge, setEditingBadge] = useState<any | null>(null);
  const [viewingBadge, setViewingBadge] = useState<any | null>(null);
  const [badgeAlumni, setBadgeAlumni] = useState<any[]>([]);
  const [loadingAlumni, setLoadingAlumni] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    expiredDate: '',
  });

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await axios.get('/api/admin/badges');
      setBadges(response.data);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBadgeAlumni = async (badgeId: string) => {
    setLoadingAlumni(true);
    try {
      const response = await axios.get(`/api/admin/alumni?badgeId=${badgeId}`);
      setBadgeAlumni(response.data.alumni);
    } catch (error) {
      console.error('Error fetching badge alumni:', error);
      Toast('Gagal mengambil data alumni', 'error');
    } finally {
      setLoadingAlumni(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBadge) {
        await axios.put(`/api/admin/badges/${editingBadge._id}`, formData);
        Toast('Badge berhasil diperbarui', 'success');
        setEditingBadge(null);
      } else {
        await axios.post('/api/admin/badges', formData);
        Toast('Badge berhasil ditambahkan', 'success');
      }
      setFormData({ name: '', description: '', code: '', expiredDate: '' });
      fetchBadges();
    } catch (error: any) {
      Toast(error.response?.data?.message || 'Gagal menyimpan badge', 'error');
    }
  };

  const handleEdit = (badge: any) => {
    setEditingBadge(badge);
    setFormData({
      name: badge.name,
      description: badge.description,
      code: badge.code,
      expiredDate: new Date(badge.expiredDate).toISOString().split('T')[0],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleView = (badge: any) => {
    setViewingBadge(badge);
    fetchBadgeAlumni(badge._id);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus badge "${name}"?`)) return;
    try {
      await axios.delete(`/api/admin/badges/${id}`);
      Toast('Badge berhasil dihapus', 'success');
      fetchBadges();
    } catch (error: any) {
      Toast(error.response?.data?.message || 'Gagal menghapus badge', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingBadge(null);
    setFormData({ name: '', description: '', code: '', expiredDate: '' });
  };

  const handleRemoveAlumni = async (alumniId: string, alumniName: string) => {
    if (
      !window.confirm(
        `Yakin ingin menghapus badge dari alumni "${alumniName}"?`,
      )
    )
      return;
    try {
      await axios.delete(
        `/api/admin/alumni/${alumniId}/badges/${viewingBadge._id}`,
      );
      Toast('Badge berhasil dihapus dari alumni', 'success');
      fetchBadgeAlumni(viewingBadge._id); // Refresh the list
    } catch (error: any) {
      Toast(
        error.response?.data?.message || 'Gagal menghapus badge dari alumni',
        'error',
      );
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <div className='mb-8'>
        <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
          Kelola Badge
        </h1>
        <p className='text-[color:var(--text-secondary)]'>
          Tambah dan kelola badge penghargaan untuk alumni
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Form Section */}
        <div className='lg:col-span-1'>
          <div className='bg-[color:var(--bg-card)] p-6 rounded-2xl border border-[color:var(--border-color)] shadow-sm sticky top-6'>
            <h2 className='text-lg font-bold text-[color:var(--text-primary)] mb-4 flex items-center gap-2'>
              <FaPlus className='text-[var(--primary)]' />{' '}
              {editingBadge ? 'Edit Badge' : 'Tambah Badge Baru'}
            </h2>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-1'>
                  Nama Badge
                </label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className='w-full px-4 py-2 rounded-xl bg-[color:var(--bg-tertiary)] border border-transparent focus:border-[var(--primary)] outline-none transition-all'
                  placeholder='Contoh: Alumni Berprestasi'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-1'>
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className='w-full px-4 py-2 rounded-xl bg-[color:var(--bg-tertiary)] border border-transparent focus:border-[var(--primary)] outline-none transition-all'
                  placeholder='Deskripsi pencapaian...'
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-1'>
                  Kode Claim
                </label>
                <input
                  type='text'
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className='w-full px-4 py-2 rounded-xl bg-[color:var(--bg-tertiary)] border border-transparent focus:border-[var(--primary)] outline-none transition-all'
                  placeholder='Unik kode untuk claim'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-1'>
                  Tanggal Kadaluarsa
                </label>
                <input
                  type='date'
                  value={formData.expiredDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiredDate: e.target.value })
                  }
                  className='w-full px-4 py-2 rounded-xl bg-[color:var(--bg-tertiary)] border border-transparent focus:border-[var(--primary)] outline-none transition-all'
                  required
                />
              </div>
              <div className='flex gap-2'>
                <button
                  type='submit'
                  className='flex-1 py-2.5 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity'
                >
                  {editingBadge ? 'Simpan Perubahan' : 'Simpan Badge'}
                </button>
                {editingBadge && (
                  <button
                    type='button'
                    onClick={handleCancelEdit}
                    className='px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:opacity-90 transition-opacity'
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className='lg:col-span-2'>
          <div className='bg-[color:var(--bg-card)] rounded-2xl border border-[color:var(--border-color)] overflow-hidden shadow-sm'>
            <div className='p-6 border-b border-[color:var(--border-color)]'>
              <h2 className='text-lg font-bold text-[color:var(--text-primary)]'>
                Daftar Badge
              </h2>
            </div>
            {badges.length === 0 ? (
              <div className='p-8 text-center text-[color:var(--text-secondary)]'>
                Belum ada badge yang dibuat.
              </div>
            ) : (
              <div className='divide-y divide-[color:var(--border-color)]'>
                {badges.map((badge) => (
                  <div
                    key={badge._id}
                    className='p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[color:var(--bg-tertiary)] transition-colors'
                  >
                    <div className='flex items-start gap-4'>
                      <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 shrink-0'>
                        <FaMedal className='text-xl' />
                      </div>
                      <div>
                        <h3 className='font-bold text-[color:var(--text-primary)] text-lg'>
                          {badge.name}
                        </h3>
                        <p className='text-sm text-[color:var(--text-secondary)] mb-1'>
                          {badge.description}
                        </p>
                        <div className='flex flex-wrap gap-2 text-xs font-mono'>
                          <span className='px-2 py-1 bg-blue-100 text-blue-700 rounded-md dark:bg-blue-900/30 dark:text-blue-300'>
                            Code: {badge.code}
                          </span>
                          <span className='px-2 py-1 bg-red-100 text-red-700 rounded-md dark:bg-red-900/30 dark:text-red-300'>
                            Exp:{' '}
                            {new Date(badge.expiredDate).toLocaleDateString(
                              'id-ID',
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 self-end md:self-center'>
                      <button
                        onClick={() => handleView(badge)}
                        className='px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors'
                      >
                        Lihat Alumni
                      </button>
                      <button
                        onClick={() => handleEdit(badge)}
                        className='px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg transition-colors'
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(badge._id, badge.name)}
                        className='p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'
                        title='Hapus Badge'
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Modal */}
      {viewingBadge && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in'>
          <div className='bg-[color:var(--bg-card)] w-full max-w-2xl rounded-2xl shadow-2xl border border-[color:var(--border-color)] max-h-[80vh] flex flex-col'>
            <div className='p-6 border-b border-[color:var(--border-color)] flex justify-between items-center'>
              <h3 className='text-xl font-bold text-[color:var(--text-primary)] flex items-center gap-2'>
                <FaMedal className='text-amber-500' /> Penerima Badge:{' '}
                {viewingBadge.name}
              </h3>
              <button
                onClick={() => setViewingBadge(null)}
                className='p-2 hover:bg-[color:var(--bg-tertiary)] rounded-full transition-colors'
              >
                ✕
              </button>
            </div>
            <div className='p-6 overflow-y-auto'>
              {loadingAlumni ? (
                <LoadingSpinner />
              ) : badgeAlumni.length === 0 ? (
                <div className='text-center py-8 text-[color:var(--text-secondary)]'>
                  Belum ada alumni yang mengklaim badge ini.
                </div>
              ) : (
                <div className='space-y-4'>
                  {badgeAlumni.map((alumni) => (
                    <div
                      key={alumni._id}
                      className='flex items-center justify-between gap-4 p-4 rounded-xl bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)]'
                    >
                      <div className='flex items-center gap-4'>
                        <div className='w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-lg'>
                          {(alumni.profile?.fullName || alumni.username)
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className='font-bold text-[color:var(--text-primary)]'>
                            {alumni.profile?.fullName || alumni.username}
                          </p>
                          <p className='text-xs text-[color:var(--text-secondary)]'>
                            Lulus: {alumni.profile?.graduationYear || '-'} •{' '}
                            {alumni.university?.name || '-'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleRemoveAlumni(
                            alumni._id,
                            alumni.profile?.fullName || alumni.username,
                          )
                        }
                        className='p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'
                        title='Hapus Badge dari Alumni'
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBadges;
