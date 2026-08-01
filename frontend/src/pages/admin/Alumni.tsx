import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Toast from '@/components/toast';
import {
  FaFilter,
  FaTimes,
  FaTrash,
  FaEnvelope,
  FaLinkedin,
  FaInstagram,
  FaCheckCircle,
  FaTimesCircle,
  FaCrown,
  FaEdit,
  FaSearch,
  FaSave,
  FaUndo,
  FaEye,
  FaEyeSlash,
  FaSync,
} from 'react-icons/fa';
import ConfirmationModal from '@/components/ConfirmationModal';
import { isUniversityIncomplete } from '@/utils/validation';
import { getSocialUrl } from '@/utils/helpers';
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
import { createPortal } from 'react-dom';
import SmartLoader from '@/components/SmartLoader';
import SearchableSelect from '@/components/SearchableSelect';

const AdminAlumni = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const universityParam = searchParams.get('university') || '';
  const majorParam = searchParams.get('major') || '';

  const [alumni, setAlumni] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedName, setDebouncedName] = useState('');

  const [filters, setFilters] = useState({
    university: universityParam,
    graduationYear: '',
    major: majorParam,
    questionnaireStatus: 'completed',
    name: '',
    duplicate: '',
    nameIncomplete: '',
    hiddenStatus: 'visible',
  });

  useEffect(() => {
    if (
      filters.university !== universityParam ||
      filters.major !== majorParam
    ) {
      setFilters((prev) => ({
        ...prev,
        university: universityParam,
        major: majorParam,
      }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, [universityParam, majorParam]);
  const [filterOptions, setFilterOptions] = useState({
    universities: [] as string[],
    graduationYears: [] as number[],
    majors: [] as string[],
  });

  // Edit State
  const [editingAlumni, setEditingAlumni] = useState<any | null>(null);
  const [demotingAlumni, setDemotingAlumni] = useState<any | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [sendingBulk, setSendingBulk] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    university: '',
    universityType: '',
    major: '',
    graduationYear: '',
    jobPosition: '',
    jobInstitution: '',
  });
  const [univList, setUnivList] = useState<string[]>([]);
  const [majorList, setMajorList] = useState<string[]>([]);

  const handleDemote = async () => {
    if (!demotingAlumni) return;
    try {
      await axios.patch(`/api/admin/alumni/${demotingAlumni._id}/demote`);
      Toast('User berhasil diubah menjadi Student', 'success');
      setAlumni((prev) => prev.filter((a) => a._id !== demotingAlumni._id));
      setDemotingAlumni(null);
    } catch (error) {
      Toast('Gagal mengubah role user', 'error');
    }
  };

  const handleSendReminder = async (alumniId: string, email: string) => {
    if (
      !window.confirm(
        `Kirim email pengingat pengisian data Tracer Study ke alumni ${email}?`,
      )
    ) {
      return;
    }
    setSendingEmailId(alumniId);
    try {
      await axios.post('/api/admin/alumni/send-reminder', { alumniId });
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

  const handleSendBulkReminder = async () => {
    const defaultVal = filters.graduationYear || '';
    const inputYear = window.prompt(
      'Masukkan Tahun Lulus alumni yang ingin dikirimkan email pengingat.\n\n' +
      '- Ketik tahun kelulusan (contoh: 2023) untuk mengirim ke tahun tersebut.\n' +
      "- Ketik 'semua' untuk mengirim ke seluruh angkatan alumni yang datanya belum lengkap.\n\n" +
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

    const payload: any = {};

    if (trimmedInput === 'semua') {
      if (
        !window.confirm(
          'Apakah Anda yakin ingin mengirim email pengingat Tracer Study ke SELURUH ANGKATAN alumni yang datanya belum lengkap?',
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
          `Apakah Anda yakin ingin mengirim email pengingat Tracer Study ke alumni angkatan lulus tahun ${graduationYear} yang datanya belum lengkap?`,
        )
      ) {
        return;
      }
      payload.graduationYear = graduationYear;
    }

    setSendingBulk(true);
    try {
      const response = await axios.post(
        '/api/admin/alumni/send-reminder',
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [univRes, majorRes] = await Promise.all([
          axios.get('/api/universities'),
          axios.get('/api/majors'),
        ]);

        const univs = [
          ...new Set(univRes.data.map((u: any) => u.name)),
        ].sort() as string[];
        const majors = [
          ...new Set(majorRes.data.map((m: any) => m.name)),
        ].sort() as string[];

        const currentYear = new Date().getFullYear();
        const years = Array.from(
          { length: currentYear + 1 - 2000 },
          (_, i) => currentYear - i,
        );

        setUnivList(univs);
        setMajorList(majors);
        setFilterOptions({
          universities: univs,
          majors: majors,
          graduationYears: years,
        });
      } catch (error) {
        setUnivList([]);
        setMajorList([]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedName(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedName !== filters.name) {
      setFilters((prev) => ({ ...prev, name: debouncedName }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, [debouncedName, filters.name]);

  const fetchAlumni = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.university) params.append('university', filters.university);
      if (filters.graduationYear)
        params.append('graduationYear', filters.graduationYear);
      if (filters.major) params.append('major', filters.major);
      if (filters.questionnaireStatus)
        params.append('questionnaireStatus', filters.questionnaireStatus);
      if (filters.name) params.append('name', filters.name);
      if (filters.duplicate) params.append('duplicate', filters.duplicate);
      if (filters.nameIncomplete)
        params.append('nameIncomplete', filters.nameIncomplete);
      if (filters.hiddenStatus)
        params.append('hiddenStatus', filters.hiddenStatus);

      const response = await axios.get(
        `/api/admin/alumni?${params.toString()}`,
      );
      setAlumni(response.data.alumni);
      setPagination(response.data.pagination);
    } catch (error) {
      Toast('Gagal memuat data alumni', 'error');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  const [hidingIncomplete, setHidingIncomplete] = useState(false);

  const handleToggleHide = async (alum: any) => {
    const confirmMsg = alum.isHidden
      ? `Tampilkan kembali user ${alum.profile?.fullName || alum.username} ke daftar alumni publik?`
      : `Sembunyikan user ${alum.profile?.fullName || alum.username} dari daftar alumni publik? User ini akan diberikan akses terbatas.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await axios.patch(
        `/api/admin/alumni/${alum._id}/toggle-hide`,
      );
      Toast(res.data.message, 'success');
      setAlumni((prev) =>
        prev.map((a) =>
          a._id === alum._id ? { ...a, isHidden: res.data.isHidden } : a,
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
      'Apakah Anda yakin ingin membatasi / menyembunyikan SEMUA alumni yang nama lengkapnya tidak lengkap (pendek < 3 karakter, 1 kata saja, atau nama tidak valid)? User ini akan diberikan akses terbatas.';
    if (!window.confirm(confirmMsg)) return;

    setHidingIncomplete(true);
    try {
      const res = await axios.patch('/api/admin/alumni/hide-all-incomplete');
      Toast(res.data.message, 'success');
      fetchAlumni();
    } catch (error: any) {
      Toast(
        error.response?.data?.message ||
        'Gagal membatasi alumni nama tidak lengkap',
        'error',
      );
    } finally {
      setHidingIncomplete(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
    if (key === 'university' || key === 'major') {
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
      setSearchParams(newParams);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      university: '',
      graduationYear: '',
      major: '',
      questionnaireStatus: '',
      name: '',
      duplicate: '',
      nameIncomplete: '',
      hiddenStatus: '',
    });
    setSearchTerm('');
    setPagination({ ...pagination, page: 1 });
    setSearchParams({});
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this alumni?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/alumni/${id}`);
      Toast('Alumni berhasil dihapus!', 'success');
      fetchAlumni();
    } catch (error: any) {
      console.error('Error deleting alumni:', error);
      Toast(error.response?.data?.message || 'Gagal menghapus alumni', 'error');
    }
  };

  const handleEdit = (alum: any) => {
    setEditingAlumni(alum);
    setEditForm({
      fullName: alum.profile?.fullName || '',
      university: alum.university?.name || '',
      universityType: alum.university?.type || '',
      major: alum.university?.major || '',
      graduationYear: alum.profile?.graduationYear?.toString() || '',
      jobPosition: alum.job?.position || '',
      jobInstitution: alum.job?.institution || '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlumni) return;

    try {
      await axios.put(`/api/admin/alumni/${editingAlumni._id}`, {
        profile: {
          fullName: editForm.fullName,
          graduationYear: parseInt(editForm.graduationYear),
        },
        university: {
          name: editForm.university,
          type: editForm.universityType,
          major: editForm.major,
        },
        job: {
          position: editForm.jobPosition,
          institution: editForm.jobInstitution,
        },
      });
      Toast('Data alumni berhasil diperbarui', 'success');
      setEditingAlumni(null);
      fetchAlumni();
    } catch (error: any) {
      console.error('Error updating alumni:', error);
      Toast(error.response?.data?.message || 'Gagal memperbarui data', 'error');
    }
  };

  if (loading) {
    return <SmartLoader />;
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <PageHeader
        title='Kelola Data Alumni'
        description='Memantau dan mengelola data alumni terdaftar'
      >
        <div className='flex flex-col sm:flex-row gap-2 flex-wrap w-full sm:w-auto justify-end'>
          {filters.nameIncomplete === 'true' && (
            <button
              onClick={handleHideAllIncomplete}
              disabled={hidingIncomplete}
              className='w-full sm:w-auto text-sm flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50 whitespace-nowrap'
              title='Membatasi/menyembunyikan semua alumni yang nama lengkapnya belum lengkap (kurang dari 3 karakter, 1 kata saja, atau tidak valid)'
            >
              <FaEyeSlash />{' '}
              {hidingIncomplete
                ? 'Memproses...'
                : 'Batasi Semua Nama Tidak Lengkap'}
            </button>
          )}
          <button
            onClick={handleSendBulkReminder}
            disabled={sendingBulk}
            className='w-full sm:w-auto text-sm flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap'
            title='Kirim pengingat email ke semua alumni yang belum melengkapi data sesuai filter'
          >
            <FaEnvelope />{' '}
            {sendingBulk ? 'Mengirim...' : 'Kirim Pengingat Massal'}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className='w-full sm:w-auto text-sm flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-white hover:bg-[var(--primary-dark)] md:hidden whitespace-nowrap'
          >
            <FaFilter /> {showFilters ? 'Tutup Filter' : 'Filter Data'}
          </button>
        </div>
      </PageHeader>

      {/* Filters */}
      <Card
        className={`mb-6 transition-all duration-300 ${showFilters ? 'block' : 'hidden md:block'
          }`}
      >
        <div className='flex flex-col gap-4'>
          {/* Filter Card Header */}
          <div className='flex items-center justify-between border-b border-[color:var(--border-color)] pb-3'>
            <div className='flex items-center gap-2 text-sm font-semibold text-[color:var(--text-primary)]'>
              <FaFilter className='text-[var(--primary)]' /> Filter & Pencarian
              Alumni
            </div>
            <button
              onClick={handleClearFilters}
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
              placeholder='Cari berdasarkan Nama Alumni, Username, Perguruan Tinggi, atau Pekerjaan...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)] shadow-sm'
            />
          </div>

          {/* Filter Dropdowns Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3'>
            <div className='relative'>
              <label className='block text-xs font-medium text-[color:var(--text-secondary)] mb-1'>
                Perguruan Tinggi
              </label>
              <select
                value={filters.university}
                onChange={(e) =>
                  handleFilterChange('university', e.target.value)
                }
                className='w-full appearance-none rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-2 pl-3 pr-8 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
              >
                <option value=''>Semua PT</option>
                {filterOptions.universities.map((univ: string) => (
                  <option key={univ} value={univ}>
                    {univ}
                  </option>
                ))}
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
                Tahun Lulus
              </label>
              <select
                value={filters.graduationYear}
                onChange={(e) =>
                  handleFilterChange('graduationYear', e.target.value)
                }
                className='w-full appearance-none rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-2 pl-3 pr-8 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
              >
                <option value=''>Semua Tahun</option>
                {filterOptions.graduationYears.map((year: number) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
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
                Jurusan
              </label>
              <select
                value={filters.major}
                onChange={(e) => handleFilterChange('major', e.target.value)}
                className='w-full appearance-none rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-2 pl-3 pr-8 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
              >
                <option value=''>Semua Jurusan</option>
                {filterOptions.majors.map((major: string) => (
                  <option key={major} value={major}>
                    {major}
                  </option>
                ))}
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
                Status Survei
              </label>
              <select
                value={filters.questionnaireStatus}
                onChange={(e) =>
                  handleFilterChange('questionnaireStatus', e.target.value)
                }
                className='w-full appearance-none rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-2 pl-3 pr-8 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
              >
                <option value=''>Semua Status</option>
                <option value='completed'>Lengkap</option>
                <option value='incomplete'>Belum Lengkap</option>
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
                value={filters.duplicate}
                onChange={(e) =>
                  handleFilterChange('duplicate', e.target.value)
                }
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
                value={filters.nameIncomplete}
                onChange={(e) =>
                  handleFilterChange('nameIncomplete', e.target.value)
                }
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
                value={filters.hiddenStatus}
                onChange={(e) =>
                  handleFilterChange('hiddenStatus', e.target.value)
                }
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

      {/* Active URL Filters Banner */}
      {(universityParam || majorParam) && (
        <div className='mb-6 p-4 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-between text-sm border border-blue-100'>
          <div className='flex items-center gap-2'>
            <span className='font-bold'>Penyaringan Aktif:</span>
            {universityParam && (
              <span>
                Universitas: <strong>{universityParam}</strong>
              </span>
            )}
            {universityParam && majorParam && <span>•</span>}
            {majorParam && (
              <span>
                Jurusan: <strong>{majorParam}</strong>
              </span>
            )}
          </div>
          <button
            onClick={() => setSearchParams({})}
            className='text-xs font-bold bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm hover:bg-blue-50 transition-all text-blue-600'
          >
            Hapus Filter
          </button>
        </div>
      )}

      {/* Table Content */}
      <TableContainer>
        <TableHeader>
          <TableHeadCell>Nama & Akun</TableHeadCell>
          <TableHeadCell>Pendidikan</TableHeadCell>
          <TableHeadCell>Pekerjaan</TableHeadCell>
          <TableHeadCell>Media Sosial</TableHeadCell>
          <TableHeadCell>Tanggal Dibuat</TableHeadCell>
          <TableHeadCell>Tanggal Update</TableHeadCell>
          <TableHeadCell>Survei</TableHeadCell>
          <TableHeadCell>Aksi</TableHeadCell>
        </TableHeader>
        <TableBody>
          {alumni.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className='p-8 text-center text-[color:var(--text-secondary)]'
              >
                Tidak ada data alumni yang ditemukan.
              </TableCell>
            </TableRow>
          ) : (
            alumni.map((alum) => (
              <TableRow key={alum._id}>
                <TableCell>
                  <div>
                    <div className='font-semibold text-[color:var(--text-primary)] flex flex-wrap items-center gap-1.5'>
                      <span>{alum.profile?.fullName || '-'}</span>
                      {alum.isMentor && (
                        <FaCrown
                          className='text-amber-500 text-[10px]'
                          title='Mentor Aktif'
                        />
                      )}
                      {alum.isNameIncomplete && (
                        <span
                          className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 shadow-sm'
                          title='Nama terdeteksi pendek atau tidak lengkap'
                        >
                          Nama Pendek
                        </span>
                      )}
                      {alum.isHidden && (
                        <span
                          className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-200 shadow-sm'
                          title='User disembunyikan dari alumni publik'
                        >
                          Tersembunyi
                        </span>
                      )}
                      {alum.isDuplicateName && (
                        <span
                          className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800 border border-red-200 shadow-sm'
                          title='Nama terdeteksi ganda (duplikat)'
                        >
                          Ganda (Nama)
                        </span>
                      )}
                    </div>
                    <div className='text-xs text-[color:var(--text-secondary)] flex flex-wrap items-center gap-1.5 mt-0.5'>
                      {alum.username && (
                        <span className='font-medium text-blue-600 dark:text-blue-400'>
                          @{alum.username}
                        </span>
                      )}
                      {alum.username && alum.email && (
                        <span className='text-gray-400'>•</span>
                      )}
                      <span>{alum.email}</span>
                      {alum.isDuplicateEmail && (
                        <span
                          className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800 border border-red-200 shadow-sm'
                          title='Email terdeteksi ganda (duplikat)'
                        >
                          Ganda (Email)
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='max-w-[200px]'>
                    <div
                      className='font-medium text-[color:var(--text-primary)] truncate'
                      title={alum.university?.name}
                    >
                      {alum.university?.name || '-'}
                    </div>
                    <div
                      className='text-xs text-[color:var(--text-secondary)] truncate'
                      title={alum.university?.major}
                    >
                      {alum.profile?.graduationYear}
                      <span className='mx-1'>•</span>{' '}
                      {alum.university?.major || '-'}{' '}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='max-w-[150px]'>
                    <div className='font-medium text-[color:var(--text-primary)] truncate'>
                      {alum.job?.position || '-'}
                    </div>
                    <div className='text-xs text-[color:var(--text-secondary)] truncate'>
                      {alum.job?.institution || '-'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex gap-2'>
                    {alum.socialMedia?.linkedin && (
                      <a
                        href={getSocialUrl(
                          'linkedin',
                          alum.socialMedia.linkedin,
                        )}
                        target='_blank'
                        rel='noreferrer'
                        className='text-blue-600 hover:text-blue-800'
                      >
                        <FaLinkedin size={16} />
                      </a>
                    )}
                    {alum.socialMedia?.instagram && (
                      <a
                        href={getSocialUrl(
                          'instagram',
                          alum.socialMedia.instagram,
                        )}
                        target='_blank'
                        rel='noreferrer'
                        className='text-pink-600 hover:text-pink-800'
                      >
                        <FaInstagram size={16} />
                      </a>
                    )}
                    {alum.socialMedia?.email && (
                      <a
                        href={`mailto:${alum.socialMedia.email}`}
                        className='text-gray-300 hover:text-[color:var(--text-primary)] transition-colors rounded-lg'
                      >
                        <FaEnvelope size={16} />
                      </a>
                    )}
                    {!alum.socialMedia?.linkedin &&
                      !alum.socialMedia?.instagram &&
                      !alum.socialMedia?.email && (
                        <span className='text-xs text-gray-400'>-</span>
                      )}
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(alum.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell>
                  {alum.updatedAt
                    ? new Date(alum.updatedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                    : '-'}
                </TableCell>
                <TableCell>
                  {!isUniversityIncomplete(alum) ? (
                    <span className='flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400'>
                      <FaCheckCircle /> Lengkap
                    </span>
                  ) : (
                    <span className='flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400'>
                      <FaTimesCircle /> Belum
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className='flex gap-1'>
                    <button
                      onClick={() => handleToggleHide(alum)}
                      className={`rounded p-2 transition-colors ${alum.isHidden
                        ? 'text-purple-600 hover:bg-purple-100'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                        }`}
                      title={
                        alum.isHidden
                          ? 'Tampilkan User ke Publik'
                          : 'Sembunyikan User dari Publik'
                      }
                    >
                      {alum.isHidden ? (
                        <FaEyeSlash size={14} />
                      ) : (
                        <FaEye size={14} />
                      )}
                    </button>
                    {isUniversityIncomplete(alum) && (
                      <button
                        onClick={() => handleSendReminder(alum._id, alum.email)}
                        disabled={sendingEmailId !== null}
                        className='rounded p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors dark:text-blue-400 dark:hover:bg-blue-900/20 disabled:opacity-50'
                        title='Kirim Email Pengingat'
                      >
                        <FaEnvelope
                          className={
                            sendingEmailId === alum._id ? 'animate-pulse' : ''
                          }
                          size={14}
                        />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(alum)}
                      className='rounded p-2 text-amber-500 hover:bg-amber-50 hover:text-amber-700 transition-colors dark:hover:bg-amber-900/20'
                      title='Edit Alumni'
                    >
                      <FaEdit size={14} />
                    </button>
                    {(alum.profile?.graduationYear >=
                      new Date().getFullYear() ||
                      !alum.profile?.graduationYear) && (
                        <button
                          onClick={() => setDemotingAlumni(alum)}
                          className='rounded p-2 text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors dark:hover:bg-blue-900/20'
                          title='Ubah ke Student'
                        >
                          <FaUndo size={14} />
                        </button>
                      )}
                    <button
                      onClick={() => handleDelete(alum._id)}
                      className='rounded p-2 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors dark:hover:bg-red-900/20'
                      title='Hapus Alumni'
                    >
                      <FaTrash size={14} />
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

      {editingAlumni &&
        createPortal(
          <div className='fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in'>
            <div className='bg-[color:var(--bg-card)] border border-[color:var(--border-color)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]'>
              <div className='p-6 border-b border-[color:var(--border-color)] flex justify-between items-center bg-[color:var(--bg-tertiary)]/50 shrink-0'>
                <h3 className='text-xl font-bold text-[color:var(--text-primary)] flex items-center gap-2'>
                  <FaEdit className='text-[var(--primary)]' /> Edit Data Alumni
                </h3>
                <button
                  onClick={() => setEditingAlumni(null)}
                  className='p-2 hover:bg-[color:var(--bg-tertiary)] rounded-full transition-colors'
                >
                  <FaTimes />
                </button>
              </div>

              <form
                onSubmit={handleEditSubmit}
                className='p-6 overflow-y-auto space-y-4'
              >
                <div>
                  <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-1'>
                    Nama Lengkap
                  </label>
                  <input
                    type='text'
                    value={editForm.fullName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, fullName: e.target.value })
                    }
                    className='w-full px-4 py-2 rounded-xl bg-[color:var(--bg-tertiary)] border border-transparent focus:border-[var(--primary)] outline-none transition-all'
                    required
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-1'>
                      Tahun Lulus
                    </label>
                    <input
                      type='number'
                      value={editForm.graduationYear}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          graduationYear: e.target.value,
                        })
                      }
                      className='w-full px-4 py-2 rounded-xl bg-[color:var(--bg-tertiary)] border border-transparent focus:border-[var(--primary)] outline-none transition-all'
                      required
                    />
                  </div>
                </div>

                <div className='space-y-4 pt-2 border-t border-[color:var(--border-color)]'>
                  <h4 className='text-sm font-bold text-[color:var(--text-primary)]'>
                    Pendidikan Lanjutan
                  </h4>
                  <SearchableSelect
                    label='Perguruan Tinggi'
                    name='university'
                    value={editForm.university}
                    options={univList}
                    onChange={(e) =>
                      setEditForm({ ...editForm, university: e.target.value })
                    }
                    placeholder='Pilih Universitas...'
                  />
                  <div>
                    <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-1'>
                      Jenis Perguruan Tinggi
                    </label>
                    <select
                      value={editForm.universityType}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          universityType: e.target.value,
                        })
                      }
                      className='w-full px-4 py-2 rounded-xl bg-[color:var(--bg-tertiary)] border border-transparent focus:border-[var(--primary)] outline-none transition-all'
                    >
                      <option value=''>Pilih Jenis</option>
                      <option value='negeri'>Negeri</option>
                      <option value='swasta'>Swasta</option>
                      <option value='kedinasan'>Kedinasan</option>
                    </select>
                  </div>
                  <SearchableSelect
                    label='Jurusan'
                    name='major'
                    value={editForm.major}
                    options={majorList}
                    onChange={(e) =>
                      setEditForm({ ...editForm, major: e.target.value })
                    }
                    placeholder='Pilih Jurusan...'
                  />
                </div>

                <div className='space-y-4 pt-2 border-t border-[color:var(--border-color)]'>
                  <h4 className='text-sm font-bold text-[color:var(--text-primary)]'>
                    Pekerjaan Saat Ini
                  </h4>
                  <div>
                    <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-1'>
                      Posisi / Jabatan
                    </label>
                    <input
                      type='text'
                      value={editForm.jobPosition}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          jobPosition: e.target.value,
                        })
                      }
                      className='w-full px-4 py-2 rounded-xl bg-[color:var(--bg-tertiary)] border border-transparent focus:border-[var(--primary)] outline-none transition-all'
                      placeholder='Contoh: Software Engineer'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-1'>
                      Instansi / Perusahaan
                    </label>
                    <input
                      type='text'
                      value={editForm.jobInstitution}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          jobInstitution: e.target.value,
                        })
                      }
                      className='w-full px-4 py-2 rounded-xl bg-[color:var(--bg-tertiary)] border border-transparent focus:border-[var(--primary)] outline-none transition-all'
                      placeholder='Contoh: PT. Teknologi Indonesia'
                    />
                  </div>
                </div>

                <div className='flex gap-3 pt-4'>
                  <button
                    type='button'
                    onClick={() => setEditingAlumni(null)}
                    className='flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors'
                  >
                    Batal
                  </button>
                  <button
                    type='submit'
                    className='flex-1 py-2.5 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2'
                  >
                    <FaSave /> Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
      {createPortal(
        <ConfirmationModal
          isOpen={!!demotingAlumni}
          onClose={() => setDemotingAlumni(null)}
          onConfirm={handleDemote}
          title='Ubah ke Student'
          message={`Apakah Anda yakin ingin mengubah status ${demotingAlumni?.profile?.fullName || 'user ini'} kembali menjadi Student? Data alumni (Pekerjaan, Kuliah, Badge) akan dihapus.`}
          confirmText='Ya, Ubah ke Student'
          cancelText='Batal'
          variant='warning'
        />,
        document.body,
      )}
    </div>
  );
};

export default AdminAlumni;
