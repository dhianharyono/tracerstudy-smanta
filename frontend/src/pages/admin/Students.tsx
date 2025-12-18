import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSpinner, FaUserPlus, FaEdit, FaTrash, FaTimes, FaSave, FaUser } from 'react-icons/fa';

const AdminStudents = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    fetchStudents();
  }, [pagination.page]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        `/api/admin/students?page=${pagination.page}&limit=${pagination.limit}`
      );
      setStudents(response.data.students);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await axios.put(`/api/admin/students/${editingStudent._id}`, formData);
        toast.success('Student berhasil diperbarui!');
      } else {
        await axios.post('/api/admin/students', formData);
        toast.success('Student berhasil ditambahkan!');
      }
      setShowForm(false);
      setEditingStudent(null);
      setFormData({ username: '', email: '', password: '' });
      fetchStudents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan student');
    }
  };

  const handleEdit = (student: any) => {
    setEditingStudent(student);
    setFormData({
      username: student.username,
      email: student.email,
      password: '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus student ini?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/students/${id}`);
      toast.success('Student berhasil dihapus!');
      fetchStudents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus student');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingStudent(null);
    setFormData({ username: '', email: '', password: '' });
  };

  if (loading && students.length === 0) {
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
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='mb-2 text-center md:text-left'>
          <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>Kelola Data Student</h1>
          <p className='text-sm text-[color:var(--text-secondary)] text-sm md:text-base'>Manajemen akun mahasiswa</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className='max-w-sm flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-white transition-colors hover:bg-[var(--primary-dark)]'
          >
            <FaUserPlus /> Tambah Student
          </button>
        )}
      </div>

      {showForm && (
        <div className='mb-6 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-6 shadow-sm'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-[color:var(--text-primary)]'>
              {editingStudent ? 'Edit Student' : 'Tambah Student Baru'}
            </h2>
            <button onClick={handleCancel} className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'>
              <FaTimes />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='form-group'>
                <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-1'>Username *</label>
                <input
                  type='text'
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className='w-full rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] p-2.5 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
                  required
                />
              </div>
              <div className='form-group'>
                <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-1'>Email *</label>
                <input
                  type='email'
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className='w-full rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] p-2.5 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
                  required
                />
              </div>
              <div className='form-group md:col-span-2'>
                <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-1'>
                  Password {editingStudent ? '(kosongkan jika tidak ingin diubah)' : '*'}
                </label>
                <input
                  type='password'
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className='w-full rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] p-2.5 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
                  required={!editingStudent}
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
                <FaSave /> {editingStudent ? 'Update' : 'Simpan'}
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
                <th className='px-6 py-4'>Email</th>
                <th className='px-6 py-4'>Tanggal Dibuat</th>
                <th className='px-6 py-4 text-center'>Aksi</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[color:var(--border-color)]'>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className='p-8 text-center text-[color:var(--text-secondary)]'>
                    Tidak ada data student.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className='hover:bg-[color:var(--bg-tertiary)]/50 transition-colors'>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'>
                          <FaUser size={12} />
                        </div>
                        <span className='font-medium text-[color:var(--text-primary)]'>{student.username}</span>
                      </div>
                    </td>
                    <td className='px-6 py-4 text-[color:var(--text-secondary)]'>{student.email}</td>
                    <td className='px-6 py-4 text-[color:var(--text-secondary)]'>
                      {new Date(student.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center justify-center gap-2'>
                        <button
                          onClick={() => handleEdit(student)}
                          className='rounded p-2 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 transition-colors dark:text-yellow-500 dark:hover:bg-yellow-900/20'
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className='rounded p-2 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors dark:text-red-400 dark:hover:bg-red-900/20'
                          title="Hapus"
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
          Menampilkan <span className='font-medium'>{((pagination.page - 1) * pagination.limit) + 1}</span> - <span className='font-medium'>{Math.min(pagination.page * pagination.limit, pagination.total)}</span> dari <span className='font-medium'>{pagination.total}</span> data
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
            disabled={pagination.page === 1}
            className='rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-card)] px-4 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition-colors hover:bg-[color:var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Previous
          </button>
          <span className='rounded-lg bg-[var(--primary)]/10 px-4 py-2 text-sm font-medium text-[var(--primary)]'>
            {pagination.page} / {pagination.pages}
          </span>
          <button
            onClick={() => setPagination({ ...pagination, page: Math.min(pagination.pages, pagination.page + 1) })}
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

export default AdminStudents;
