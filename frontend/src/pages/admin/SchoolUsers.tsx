import { useEffect, useState } from 'react';
import axios from 'axios';
import Toast from '@/components/toast';
import {
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaUniversity,
} from 'react-icons/fa';
import SmartLoader from '@/components/SmartLoader';

const AdminSchoolUsers = () => {
  const [schoolUsers, setSchoolUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
  });

  useEffect(() => {
    fetchSchoolUsers();
  }, [pagination.page]);

  const fetchSchoolUsers = async () => {
    try {
      const response = await axios.get(
        `/api/admin/school-users?page=${pagination.page}&limit=${pagination.limit}`,
      );
      setSchoolUsers(response.data.schoolUsers);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching school users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(`/api/admin/school-users/${editingUser._id}`, formData);
        Toast('User sekolah berhasil diperbarui!', 'success');
      } else {
        await axios.post('/api/admin/school-users', formData);
        Toast('User sekolah berhasil ditambahkan!', 'success');
      }
      setShowForm(false);
      setEditingUser(null);
      setFormData({ username: '', email: '', password: '', fullName: '' });
      fetchSchoolUsers();
    } catch (error: any) {
      Toast(error.response?.data?.message || 'Gagal menyimpan user sekolah', 'error');
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      fullName: user.profile?.fullName || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus user sekolah ini?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/school-users/${id}`);
      Toast('User sekolah berhasil dihapus!', 'success');
      fetchSchoolUsers();
    } catch (error: any) {
      Toast(error.response?.data?.message || 'Gagal menghapus user sekolah', 'error');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ username: '', email: '', password: '', fullName: '' });
  };

  if (loading) {
    return <SmartLoader />;
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='mb-2 text-center md:text-left'>
          <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
            Kelola User Sekolah
          </h1>
          <p className='text-[color:var(--text-secondary)] text-sm md:text-base'>
            Manajemen akun monitoring untuk pihak sekolah
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className='max-w-sm flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-white transition-colors hover:bg-[var(--primary-dark)]'
          >
            <FaUserPlus /> Tambah User Sekolah
          </button>
        )}
      </div>

      {showForm && (
        <div className='mb-6 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-6 shadow-sm'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-[color:var(--text-primary)]'>
              {editingUser ? 'Edit User Sekolah' : 'Tambah User Sekolah Baru'}
            </h2>
            <button
              onClick={handleCancel}
              className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            >
              <FaTimes />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='form-group md:col-span-2'>
                <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-1'>
                  Nama Lengkap / Instansi
                </label>
                <input
                  type='text'
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className='w-full rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] p-2.5 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
                  placeholder='Contoh: Kepala Sekolah SMAN 1 Tawangsari'
                />
              </div>
              <div className='form-group'>
                <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-1'>
                  Username *
                </label>
                <input
                  type='text'
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className='w-full rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] p-2.5 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
                  required
                />
              </div>
              <div className='form-group'>
                <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-1'>
                  Email *
                </label>
                <input
                  type='email'
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className='w-full rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] p-2.5 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
                  required
                />
              </div>
              <div className='form-group md:col-span-2'>
                <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-1'>
                  Password{' '}
                  {editingUser ? '(kosongkan jika tidak ingin diubah)' : '*'}
                </label>
                <input
                  type='password'
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className='w-full rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] p-2.5 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
                  required={!editingUser}
                />
              </div>
            </div>

            <div className='mt-6 flex justify-end gap-3'>
              <button
                type='button'
                onClick={handleCancel}
                className='rounded-lg border border-[color:var(--border-color)] px-4 py-2 text-sm font-medium text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-tertiary)]'
              >
                Batal
              </button>
              <button
                type='submit'
                className='flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)]'
              >
                <FaSave /> {editingUser ? 'Update' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className='max-w-sm md:max-w-full overflow-hidden rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead className='bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] uppercase tracking-wider font-medium border-b border-[color:var(--border-color)]'>
              <tr>
                <th className='px-6 py-4'>Username</th>
                <th className='px-6 py-4'>Nama / Instansi</th>
                <th className='px-6 py-4'>Email</th>
                <th className='px-6 py-4'>Tanggal Dibuat</th>
                <th className='px-6 py-4 text-center'>Aksi</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[color:var(--border-color)]'>
              {schoolUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className='p-8 text-center text-[color:var(--text-secondary)]'
                  >
                    Tidak ada data user sekolah.
                  </td>
                </tr>
              ) : (
                schoolUsers.map((user) => (
                  <tr
                    key={user._id}
                    className='hover:bg-[color:var(--bg-tertiary)]/50 transition-colors'
                  >
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'>
                          <FaUniversity size={12} />
                        </div>
                        <span className='font-medium text-[color:var(--text-primary)]'>
                          {user.username}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <span className='font-medium text-[color:var(--text-primary)]'>
                        {user.profile?.fullName || '-'}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-[color:var(--text-secondary)]'>
                      {user.email}
                    </td>
                    <td className='px-6 py-4 text-[color:var(--text-secondary)]'>
                      {new Date(user.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center justify-center gap-2'>
                        <button
                          onClick={() => handleEdit(user)}
                          className='rounded p-2 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 transition-colors dark:text-yellow-500 dark:hover:bg-yellow-900/20'
                          title='Edit'
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className='rounded p-2 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors dark:text-red-400 dark:hover:bg-red-900/20'
                          title='Hapus'
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className='mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row'>
        <div className='text-sm text-[color:var(--text-secondary)]'>
          Menampilkan{' '}
          <span className='font-medium'>
            {(pagination.page - 1) * pagination.limit + 1}
          </span>{' '}
          -{' '}
          <span className='font-medium'>
            {Math.min(pagination.page * pagination.limit, pagination.total)}
          </span>{' '}
          dari <span className='font-medium'>{pagination.total}</span> data
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={() =>
              setPagination({
                ...pagination,
                page: Math.max(1, pagination.page - 1),
              })
            }
            disabled={pagination.page === 1}
            className='rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-card)] px-4 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition-colors hover:bg-[color:var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Previous
          </button>
          <span className='rounded-lg bg-[var(--primary)]/10 px-4 py-2 text-sm font-medium text-[var(--primary)]'>
            {pagination.page} / {pagination.pages}
          </span>
          <button
            onClick={() =>
              setPagination({
                ...pagination,
                page: Math.min(pagination.pages, pagination.page + 1),
              })
            }
            disabled={pagination.page >= pagination.pages}
            className='rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-card)] px-4 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition-colors hover:bg-[color:var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSchoolUsers;
