import { useEffect, useState } from 'react';
import axios from 'axios';
import Toast from '@/components/toast';
import {
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaSearch,
  FaSync,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaFilter,
} from 'react-icons/fa';
import SmartLoader from '@/components/SmartLoader';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import Pagination from '@/components/common/Pagination';
import {
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHeadCell,
} from '@/components/common/Table';

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
  const [filters, setFilters] = useState({
    search: '',
    entryYear: '',
    graduationYear: '',
    status: '',
    duplicate: '',
    nameIncomplete: '',
    hiddenStatus: '',
  });
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    entryYear: '',
    graduationYear: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [sendingBulk, setSendingBulk] = useState(false);
  const [hidingIncomplete, setHidingIncomplete] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [
    pagination.page,
    filters.entryYear,
    filters.graduationYear,
    filters.status,
    filters.duplicate,
    filters.nameIncomplete,
    filters.hiddenStatus,
  ]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination({ ...pagination, page: 1 });
      } else {
        fetchStudents();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const handleToggleHide = async (student: any) => {
    const confirmMsg = student.isHidden
      ? `Tampilkan kembali user siswa ${student.profile?.fullName || student.username}?`
      : `Sembunyikan user siswa ${student.profile?.fullName || student.username}? User ini akan diberikan akses terbatas.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await axios.patch(
        `/api/admin/students/${student._id}/toggle-hide`,
      );
      Toast(res.data.message, 'success');
      setStudents((prev) =>
        prev.map((s) =>
          s._id === student._id ? { ...s, isHidden: res.data.isHidden } : s,
        ),
      );
    } catch (error: any) {
      Toast(
        error.response?.data?.message || 'Gagal mengubah status visibilitas',
        'error',
      );
    }
  };

  const handleHideAllIncomplete = async () => {
    const confirmMsg =
      'Apakah Anda yakin ingin membatasi / menyembunyikan SEMUA siswa yang nama lengkapnya tidak lengkap (pendek < 3 karakter, 1 kata saja, atau nama tidak valid)? User ini akan diberikan akses terbatas.';
    if (!window.confirm(confirmMsg)) return;

    setHidingIncomplete(true);
    try {
      const res = await axios.patch('/api/admin/students/hide-all-incomplete');
      Toast(res.data.message, 'success');
      fetchStudents();
    } catch (error: any) {
      Toast(
        error.response?.data?.message ||
          'Gagal membatasi siswa nama tidak lengkap',
        'error',
      );
    } finally {
      setHidingIncomplete(false);
    }
  };

  const handleSendReminder = async (
    studentId: string,
    email: string,
    type: 'upgrade' | 'incomplete',
  ) => {
    const confirmMessage =
      type === 'upgrade'
        ? `Kirim email pengingat upgrade status alumni ke siswa ${email}?`
        : `Kirim email pengingat kelengkapan data ke siswa ${email}?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }
    setSendingEmailId(studentId);
    try {
      await axios.post('/api/admin/students/send-reminder', {
        studentId,
        type,
      });
      Toast('Email pengingat berhasil dikirim!', 'success');
    } catch (error: any) {
      Toast(
        error.response?.data?.message || 'Gagal mengirim email pengingat',
        'error',
      );
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleSendBulkUpgradeReminder = async () => {
    const defaultVal = filters.graduationYear || '';
    const inputYear = window.prompt(
      'Masukkan Tahun Lulus siswa yang ingin dikirimkan email pengingat upgrade status alumni.\n\n' +
        '- Ketik tahun kelulusan (contoh: 2023) untuk mengirim ke tahun tersebut.\n' +
        "- Ketik 'semua' untuk mengirim ke seluruh angkatan siswa.\n\n" +
        'Batal/kosongkan untuk membatalkan.',
      defaultVal,
    );

    if (inputYear === null) {
      return; // Batal
    }

    const trimmedInput = inputYear.trim().toLowerCase();
    if (trimmedInput === '') {
      Toast('Pengiriman dibatalkan. Tahun tidak boleh kosong.', 'error');
      return;
    }

    const payload: any = { type: 'upgrade' };

    if (trimmedInput === 'semua') {
      if (
        !window.confirm(
          'Apakah Anda yakin ingin mengirim email pengingat upgrade status alumni ke SELURUH ANGKATAN siswa?',
        )
      ) {
        return;
      }
      payload.sendToAll = true;
    } else {
      const graduationYear = parseInt(trimmedInput);
      if (
        isNaN(graduationYear) ||
        graduationYear < 1900 ||
        graduationYear > 2100
      ) {
        Toast('Tahun kelulusan tidak valid!', 'error');
        return;
      }
      if (
        !window.confirm(
          `Apakah Anda yakin ingin mengirim email pengingat upgrade status alumni ke siswa angkatan lulus tahun ${graduationYear}?`,
        )
      ) {
        return;
      }
      payload.graduationYear = graduationYear;
    }

    setSendingBulk(true);
    try {
      const response = await axios.post(
        '/api/admin/students/send-reminder',
        payload,
      );
      Toast(
        response.data.message ||
          'Proses pengiriman email massal telah dimulai!',
        'success',
      );
    } catch (error: any) {
      Toast(
        error.response?.data?.message ||
          'Gagal mengirim email pengingat massal',
        'error',
      );
    } finally {
      setSendingBulk(false);
    }
  };

  const handleSendBulkIncompleteReminder = async () => {
    const defaultVal = filters.graduationYear || '';
    const inputYear = window.prompt(
      'Masukkan Tahun Lulus siswa yang ingin dikirimkan email pengingat kelengkapan data.\n\n' +
        '- Ketik tahun kelulusan (contoh: 2023) untuk mengirim ke tahun tersebut.\n' +
        "- Ketik 'semua' untuk mengirim ke seluruh angkatan siswa yang datanya belum lengkap.\n\n" +
        'Batal/kosongkan untuk membatalkan.',
      defaultVal,
    );

    if (inputYear === null) {
      return; // Batal
    }

    const trimmedInput = inputYear.trim().toLowerCase();
    if (trimmedInput === '') {
      Toast('Pengiriman dibatalkan. Tahun tidak boleh kosong.', 'error');
      return;
    }

    const payload: any = { type: 'incomplete' };

    if (trimmedInput === 'semua') {
      if (
        !window.confirm(
          'Apakah Anda yakin ingin mengirim email pengingat kelengkapan data ke SELURUH ANGKATAN siswa yang datanya belum lengkap?',
        )
      ) {
        return;
      }
      payload.sendToAll = true;
    } else {
      const graduationYear = parseInt(trimmedInput);
      if (
        isNaN(graduationYear) ||
        graduationYear < 1900 ||
        graduationYear > 2100
      ) {
        Toast('Tahun kelulusan tidak valid!', 'error');
        return;
      }
      if (
        !window.confirm(
          `Apakah Anda yakin ingin mengirim email pengingat kelengkapan data ke siswa angkatan lulus tahun ${graduationYear} yang datanya belum lengkap?`,
        )
      ) {
        return;
      }
      payload.graduationYear = graduationYear;
    }

    setSendingBulk(true);
    try {
      const response = await axios.post(
        '/api/admin/students/send-reminder',
        payload,
      );
      Toast(
        response.data.message ||
          'Proses pengiriman email massal telah dimulai!',
        'success',
      );
    } catch (error: any) {
      Toast(
        error.response?.data?.message ||
          'Gagal mengirim email pengingat massal',
        'error',
      );
    } finally {
      setSendingBulk(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.entryYear && { entryYear: filters.entryYear }),
        ...(filters.graduationYear && {
          graduationYear: filters.graduationYear,
        }),
        ...(filters.status && { status: filters.status }),
        ...(filters.duplicate && { duplicate: filters.duplicate }),
        ...(filters.nameIncomplete && {
          nameIncomplete: filters.nameIncomplete,
        }),
        ...(filters.hiddenStatus && { hiddenStatus: filters.hiddenStatus }),
      });

      const response = await axios.get(`/api/admin/students?${params}`);
      setStudents(response.data.students);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setPagination({ ...pagination, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      entryYear: '',
      graduationYear: '',
      status: '',
      duplicate: '',
      nameIncomplete: '',
      hiddenStatus: '',
    });
    setPagination({ ...pagination, page: 1 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await axios.put(`/api/admin/students/${editingStudent._id}`, formData);
        Toast('Student berhasil diperbarui!', 'success');
      } else {
        await axios.post('/api/admin/students', formData);
        Toast('Student berhasil ditambahkan!', 'success');
      }
      setShowForm(false);
      setEditingStudent(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        entryYear: '',
        graduationYear: '',
      });
      setShowPassword(false);
      fetchStudents();
    } catch (error: any) {
      Toast(
        error.response?.data?.message || 'Gagal menyimpan student',
        'error',
      );
    }
  };

  const handleEdit = (student: any) => {
    setEditingStudent(student);
    setFormData({
      username: student.username,
      email: student.email,
      password: '',
      fullName: student.profile?.fullName || '',
      entryYear: student.profile?.entryYear || '',
      graduationYear: student.profile?.graduationYear || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus student ini?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/students/${id}`);
      Toast('Student berhasil dihapus!', 'success');
      fetchStudents();
    } catch (error: any) {
      Toast(
        error.response?.data?.message || 'Gagal menghapus student',
        'error',
      );
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingStudent(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      entryYear: '',
      graduationYear: '',
    });
    setShowPassword(false);
  };

  if (loading) {
    return <SmartLoader />;
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <PageHeader
        title='Kelola Data Student'
        description='Manajemen akun Siswa'
      >
        <div className='flex flex-col sm:flex-row gap-2 flex-wrap w-full sm:w-auto justify-end'>
          {filters.nameIncomplete === 'true' && (
            <button
              onClick={handleHideAllIncomplete}
              disabled={hidingIncomplete}
              className='w-full sm:w-auto text-sm flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50 whitespace-nowrap'
              title='Membatasi/menyembunyikan semua siswa yang nama lengkapnya belum lengkap (kurang dari 3 karakter, 1 kata saja, atau tidak valid)'
            >
              <FaEyeSlash />{' '}
              {hidingIncomplete
                ? 'Memproses...'
                : 'Batasi Semua Nama Tidak Lengkap'}
            </button>
          )}
          <button
            onClick={handleSendBulkUpgradeReminder}
            disabled={sendingBulk}
            className='w-full sm:w-auto text-sm flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap'
            title='Kirim pengingat email upgrade status alumni ke semua siswa yang datanya lengkap'
          >
            <FaEnvelope />{' '}
            {sendingBulk ? 'Mengirim...' : 'Blast Pengingat Upgrade'}
          </button>
          <button
            onClick={handleSendBulkIncompleteReminder}
            disabled={sendingBulk}
            className='w-full sm:w-auto text-sm flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700 disabled:opacity-50 whitespace-nowrap'
            title='Kirim pengingat email kelengkapan data ke semua siswa yang profilnya belum lengkap'
          >
            <FaEnvelope />{' '}
            {sendingBulk ? 'Mengirim...' : 'Blast Pengingat Kelengkapan'}
          </button>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className='w-full sm:w-auto text-sm flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-white transition-colors hover:bg-[var(--primary-dark)] whitespace-nowrap'
            >
              <FaUserPlus /> Tambah Student
            </button>
          )}
        </div>
      </PageHeader>

      {showForm && (
        <Card className='mb-6'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-[color:var(--text-primary)]'>
              {editingStudent ? 'Edit Student' : 'Tambah Student Baru'}
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
                  Nama Lengkap
                </label>
                <input
                  type='text'
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className='w-full rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] p-2.5 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
                  placeholder='Masukkan nama lengkap'
                />
              </div>
              <div className='form-group'>
                <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-1'>
                  Tahun Masuk
                </label>
                <input
                  type='number'
                  value={formData.entryYear}
                  onChange={(e) =>
                    setFormData({ ...formData, entryYear: e.target.value })
                  }
                  className='w-full rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] p-2.5 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
                  placeholder='Contoh: 2020'
                />
              </div>
              <div className='form-group'>
                <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-1'>
                  Tahun Lulus
                </label>
                <input
                  type='number'
                  value={formData.graduationYear}
                  onChange={(e) =>
                    setFormData({ ...formData, graduationYear: e.target.value })
                  }
                  className='w-full rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] p-2.5 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
                  placeholder='Contoh: 2023'
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
                  {editingStudent ? '(kosongkan jika tidak ingin diubah)' : '*'}
                </label>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className='w-full rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] p-2.5 pr-10 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
                    required={!editingStudent}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  >
                    {showPassword ? (
                      <FaEyeSlash size={14} />
                    ) : (
                      <FaEye size={14} />
                    )}
                  </button>
                </div>
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
        </Card>
      )}

      <Card className='mb-6'>
        <div className='flex flex-col gap-4'>
          {/* Filter Card Header */}
          <div className='flex items-center justify-between border-b border-[color:var(--border-color)] pb-3'>
            <div className='flex items-center gap-2 text-sm font-semibold text-[color:var(--text-primary)]'>
              <FaFilter className='text-[var(--primary)]' /> Filter & Pencarian
              Student
            </div>
            <button
              onClick={clearFilters}
              className='flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100'
            >
              <FaSync size={11} /> Reset Filter
            </button>
          </div>

          {/* Search Input Bar */}
          <div className='relative w-full'>
            <span className='absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400'>
              <FaSearch size={14} />
            </span>
            <input
              type='text'
              name='search'
              value={filters.search}
              onChange={handleFilterChange}
              placeholder='Cari berdasarkan Nama Lengkap, Username, atau Email Siswa...'
              className='w-full rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)] shadow-sm'
            />
          </div>

          {/* Filter Dropdowns Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3'>
            <div>
              <label className='block text-xs font-medium text-[color:var(--text-secondary)] mb-1'>
                Tahun Masuk
              </label>
              <input
                type='number'
                name='entryYear'
                value={filters.entryYear}
                onChange={handleFilterChange}
                placeholder='Contoh: 2021'
                className='w-full rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
              />
            </div>

            <div>
              <label className='block text-xs font-medium text-[color:var(--text-secondary)] mb-1'>
                Tahun Lulus
              </label>
              <input
                type='number'
                name='graduationYear'
                value={filters.graduationYear}
                onChange={handleFilterChange}
                placeholder='Contoh: 2024'
                className='w-full rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
              />
            </div>

            <div className='relative'>
              <label className='block text-xs font-medium text-[color:var(--text-secondary)] mb-1'>
                Kelengkapan Data
              </label>
              <select
                name='status'
                value={filters.status}
                onChange={handleFilterChange}
                className='w-full appearance-none rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-2 pl-3 pr-8 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
              >
                <option value=''>Semua Status</option>
                <option value='complete'>Lengkap</option>
                <option value='incomplete'>Kurang Lengkap</option>
              </select>
              <div className='pointer-events-none absolute right-2.5 top-[27px] text-gray-400'>
                <svg
                  className='h-4 w-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </div>
            </div>

            <div className='relative'>
              <label className='block text-xs font-medium text-[color:var(--text-secondary)] mb-1'>
                Deteksi Duplikasi
              </label>
              <select
                name='duplicate'
                value={filters.duplicate}
                onChange={handleFilterChange}
                className='w-full appearance-none rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-2 pl-3 pr-8 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
              >
                <option value=''>Semua (Tanpa Filter)</option>
                <option value='name'>Duplikasi Nama</option>
                <option value='email'>Duplikasi Email</option>
                <option value='all'>Duplikasi Nama/Email</option>
              </select>
              <div className='pointer-events-none absolute right-2.5 top-[27px] text-gray-400'>
                <svg
                  className='h-4 w-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </div>
            </div>

            <div className='relative'>
              <label className='block text-xs font-medium text-[color:var(--text-secondary)] mb-1'>
                Status Nama
              </label>
              <select
                name='nameIncomplete'
                value={filters.nameIncomplete}
                onChange={handleFilterChange}
                className='w-full appearance-none rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-2 pl-3 pr-8 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
              >
                <option value=''>Semua Status Nama</option>
                <option value='true'>Nama Pendek / 1 Kata</option>
              </select>
              <div className='pointer-events-none absolute right-2.5 top-[27px] text-gray-400'>
                <svg
                  className='h-4 w-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </div>
            </div>

            <div className='relative'>
              <label className='block text-xs font-medium text-[color:var(--text-secondary)] mb-1'>
                Visibilitas User
              </label>
              <select
                name='hiddenStatus'
                value={filters.hiddenStatus}
                onChange={handleFilterChange}
                className='w-full appearance-none rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-2 pl-3 pr-8 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
              >
                <option value=''>Semua Visibilitas</option>
                <option value='visible'>Tampil Publik</option>
                <option value='hidden'>Tersembunyi (Dibatasi)</option>
              </select>
              <div className='pointer-events-none absolute right-2.5 top-[27px] text-gray-400'>
                <svg
                  className='h-4 w-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <TableContainer>
        <TableHeader>
          <TableHeadCell>Nama Lengkap & Tahun Masuk / Lulus</TableHeadCell>
          <TableHeadCell>Email</TableHeadCell>
          <TableHeadCell>Tanggal Dibuat</TableHeadCell>
          <TableHeadCell>Tanggal Update</TableHeadCell>
          <TableHeadCell>Status</TableHeadCell>
          <TableHeadCell className='text-center'>Aksi</TableHeadCell>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className='p-8 text-center text-[color:var(--text-secondary)]'
              >
                Tidak ada data student.
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student._id}>
                <TableCell>
                  <div className='max-w-[220px]'>
                    <div className='flex flex-wrap items-center gap-1.5'>
                      <span
                        className='font-medium text-[color:var(--text-primary)] truncate'
                        title={student.profile?.fullName}
                      >
                        {student.profile?.fullName || '-'}
                      </span>
                      {student.isNameIncomplete && (
                        <span
                          className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 shadow-sm'
                          title='Nama terdeteksi pendek atau tidak lengkap'
                        >
                          Nama Pendek
                        </span>
                      )}
                      {student.isHidden && (
                        <span
                          className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-200 shadow-sm'
                          title='User disembunyikan dari publik dan dibatasi'
                        >
                          Tersembunyi
                        </span>
                      )}
                      {student.isDuplicateName && (
                        <span
                          className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800 border border-red-200 shadow-sm'
                          title='Nama terdeteksi ganda (duplikat)'
                        >
                          Ganda (Nama)
                        </span>
                      )}
                    </div>
                    {student.profile?.entryYear &&
                      student.profile?.graduationYear && (
                        <div
                          className='text-xs text-[color:var(--text-secondary)] truncate'
                          title={student.profile?.major}
                        >
                          {student.profile?.entryYear || '-'}
                          <span className='mx-1'>•</span>{' '}
                          {student.profile?.graduationYear || '-'}{' '}
                        </div>
                      )}
                  </div>
                </TableCell>
                <TableCell className='text-[color:var(--text-secondary)]'>
                  <div className='flex flex-wrap items-center gap-1.5'>
                    <span>{student.email}</span>
                    {student.isDuplicateEmail && (
                      <span
                        className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800 border border-red-200 shadow-sm'
                        title='Email terdeteksi ganda (duplikat)'
                      >
                        Ganda (Email)
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className='text-[color:var(--text-secondary)]'>
                  {new Date(student.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell className='text-[color:var(--text-secondary)]'>
                  {student.updatedAt
                    ? new Date(student.updatedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '-'}
                </TableCell>
                <TableCell>
                  {student.profile?.fullName &&
                  student.profile?.entryYear &&
                  student.profile?.graduationYear ? (
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-green-50 text-green-700 border-green-200/50'>
                      Lengkap
                    </span>
                  ) : (
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-red-50 text-red-700 border-red-200/50'>
                      Kurang Lengkap
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className='flex items-center justify-center gap-1'>
                    <button
                      onClick={() => handleToggleHide(student)}
                      className={`rounded p-2 transition-colors ${
                        student.isHidden
                          ? 'text-purple-600 hover:bg-purple-100'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                      title={
                        student.isHidden
                          ? 'Tampilkan User ke Publik'
                          : 'Sembunyikan User dari Publik'
                      }
                    >
                      {student.isHidden ? (
                        <FaEyeSlash size={14} />
                      ) : (
                        <FaEye size={14} />
                      )}
                    </button>
                    {student.profile?.fullName &&
                    student.profile?.entryYear &&
                    student.profile?.graduationYear ? (
                      <button
                        onClick={() =>
                          handleSendReminder(
                            student._id,
                            student.email,
                            'upgrade',
                          )
                        }
                        disabled={sendingEmailId !== null}
                        className='rounded p-2 text-gray-300 hover:text-[color:var(--text-primary)] transition-colors disabled:opacity-50'
                        title='Kirim Pengingat Upgrade Akun'
                      >
                        <FaEnvelope
                          className={
                            sendingEmailId === student._id
                              ? 'animate-pulse'
                              : ''
                          }
                        />
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleSendReminder(
                            student._id,
                            student.email,
                            'incomplete',
                          )
                        }
                        disabled={sendingEmailId !== null}
                        className='rounded p-2 text-gray-300 hover:text-[color:var(--text-primary)] transition-colors disabled:opacity-50'
                        title='Kirim Pengingat Kelengkapan Data'
                      >
                        <FaEnvelope
                          className={
                            sendingEmailId === student._id
                              ? 'animate-pulse'
                              : ''
                          }
                        />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(student)}
                      className='rounded p-2 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-750 transition-colors'
                      title='Edit'
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(student._id)}
                      className='rounded p-2 text-red-500 hover:bg-red-50 hover:text-red-750 transition-colors'
                      title='Hapus'
                    >
                      <FaTrash />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </TableContainer>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit}
        onPageChange={(page) =>
          setPagination({
            ...pagination,
            page,
          })
        }
      />
    </div>
  );
};

export default AdminStudents;
