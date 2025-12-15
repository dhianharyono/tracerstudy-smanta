import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';

const AdminAdmins = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    fetchAdmins();
  }, [pagination.page]);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get(
        `/api/admin/admins?page=${pagination.page}&limit=${pagination.limit}`
      );
      setAdmins(response.data.admins);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        await axios.put(`/api/admin/admins/${editingAdmin._id}`, formData);
        toast.success('Admin berhasil diperbarui!');
      } else {
        await axios.post('/api/admin/admins', formData);
        toast.success('Admin berhasil ditambahkan!');
      }
      setShowForm(false);
      setEditingAdmin(null);
      setFormData({ username: '', email: '', password: '' });
      fetchAdmins();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan admin');
    }
  };

  const handleEdit = (admin: any) => {
    setEditingAdmin(admin);
    setFormData({
      username: admin.username,
      email: admin.email,
      password: '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus admin ini?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/admins/${id}`);
      toast.success('Admin berhasil dihapus!');
      fetchAdmins();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus admin');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAdmin(null);
    setFormData({ username: '', email: '', password: '' });
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-[calc(100vh-64px)]'>
        <div className='flex items-center gap-3 text-lg font-medium text-gray-400'>
          <FaSpinner className='animate-spin text-xl' />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='page-header'>
        <h1 className='page-title'>Kelola Data Admin</h1>
        <button onClick={() => setShowForm(true)} className='btn btn-primary'>
          + Tambah Admin
        </button>
      </div>

      {showForm && (
        <div className='card' style={{ marginBottom: '24px' }}>
          <h2>{editingAdmin ? 'Edit Admin' : 'Tambah Admin Baru'}</h2>
          <form onSubmit={handleSubmit}>
            <div className='form-group'>
              <label>Username *</label>
              <input
                type='text'
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
            </div>
            <div className='form-group'>
              <label>Email *</label>
              <input
                type='email'
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className='form-group'>
              <label>
                Password{' '}
                {editingAdmin ? '(kosongkan jika tidak ingin diubah)' : '*'}{' '}
              </label>
              <input
                type='password'
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!editingAdmin}
              />
            </div>
            <div className='flex gap-3 flex-wrap'>
              <button type='submit' className='btn btn-primary'>
                {editingAdmin ? 'Update' : 'Simpan'}
              </button>
              <button
                type='button'
                onClick={handleCancel}
                className='btn btn-secondary'
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className='card max-w-sm md:max-w-md lg:max-w-full'>
        <div className='table-container'>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Tanggal Dibuat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin._id}>
                  <td>{admin.username}</td>
                  <td>{admin.email}</td>
                  <td>
                    {new Date(admin.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td>
                    <div className='flex gap-2 flex-wrap'>
                      <button
                        onClick={() => handleEdit(admin)}
                        className='btn btn-secondary max-w-fit lg:mx-0'
                        style={{ padding: '5px 10px', fontSize: '14px' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(admin._id)}
                        className='btn btn-secondary max-w-fit lg:mx-0'
                        style={{ padding: '5px 10px', fontSize: '14px' }}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className='flex flex-wrap gap-3 justify-center items-center mt-6'>
          <button
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page - 1 })
            }
            disabled={pagination.page === 1}
            className='btn btn-secondary max-w-fit lg:mx-0'
          >
            Previous
          </button>
          <span className='p-2 lg:py-3 lg:px-3 bg-gray-100 rounded-lg font-semibold text-gray-700'>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page + 1 })
            }
            disabled={pagination.page >= pagination.pages}
            className='btn btn-secondary max-w-fit lg:mx-0'
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAdmins;
