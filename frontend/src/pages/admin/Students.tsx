import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';

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
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='page-header'>
        <h1 className='text-xl md:text-2xl'>Kelola Data Student</h1>
        <button
          onClick={() => setShowForm(true)}
          className='btn btn-primary mb-5'
        >
          + Tambah Student
        </button>
      </div>

      {showForm && (
        <div className='card' style={{ marginBottom: '24px' }}>
          <h2>{editingStudent ? 'Edit Student' : 'Tambah Student Baru'}</h2>
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
                {editingStudent ? '(kosongkan jika tidak ingin diubah)' : '*'}{' '}
              </label>
              <input
                type='password'
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!editingStudent}
              />
            </div>
            <div className='flex gap-3 flex-wrap'>
              <button type='submit' className='btn btn-primary'>
                {editingStudent ? 'Update' : 'Simpan'}
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
              {students.map((student) => (
                <tr key={student._id}>
                  <td>{student.username}</td>
                  <td>{student.email}</td>
                  <td>
                    {new Date(student.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td>
                    <button
                      onClick={() => handleEdit(student)}
                      className='btn btn-secondary max-w-fit lg:mx-0'
                      style={{
                        padding: '5px 10px',
                        fontSize: '14px',
                        marginRight: '8px',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(student._id)}
                      className='btn btn-secondary max-w-fit lg:mx-0'
                      style={{ padding: '5px 10px', fontSize: '14px' }}
                    >
                      Hapus
                    </button>
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

export default AdminStudents;
