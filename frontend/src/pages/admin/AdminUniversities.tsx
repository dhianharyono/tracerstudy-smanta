import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import Toast from '@/components/toast';
import {
  FaUniversity,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBuilding,
  FaGraduationCap,
  FaGlobeAmericas,
  FaSyncAlt,
  FaChevronLeft,
  FaChevronRight,
  FaMagic,
  FaUserGraduate,
} from 'react-icons/fa';
import SmartLoader from '@/components/SmartLoader';
import Card from '@/components/common/Card';
import PageHeader from '@/components/common/PageHeader';

interface UniversityData {
  _id: string;
  name: string;
  type: 'negeri' | 'swasta' | 'kedinasan' | 'luar negeri' | '';
  location?: string;
  isVerified: boolean;
  alumniCount: number;
  studentPlanCount: number;
  totalUsage: number;
  createdAt?: string;
}

interface StatsData {
  total: number;
  verified: number;
  unverified: number;
  negeri: number;
  swasta: number;
  kedinasan: number;
  luarNegeri: number;
  unassignedType?: number;
}

const AdminUniversities: React.FC = () => {
  const [universities, setUniversities] = useState<UniversityData[]>([]);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    verified: 0,
    unverified: 0,
    negeri: 0,
    swasta: 0,
    kedinasan: 0,
    luarNegeri: 0,
    unassignedType: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [alumniFilter, setAlumniFilter] = useState(''); // '' | 'has_alumni' | 'no_alumni'

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingUniversity, setEditingUniversity] =
    useState<UniversityData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '' as UniversityData['type'],
    location: '',
    isVerified: true,
    cascadeUpdate: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [autoCategorizing, setAutoCategorizing] = useState(false);

  // Delete modal state
  const [deletingUniv, setDeletingUniv] = useState<UniversityData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchUniversities();
  }, [pagination.page, typeFilter, verifiedFilter, alumniFilter]);

  const fetchUniversities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        type: typeFilter,
        isVerified: verifiedFilter,
        alumniFilter: alumniFilter,
      });

      const response = await axios.get(
        `/api/admin/universities?${params.toString()}`,
      );
      setUniversities(response.data.universities || []);
      setPagination(response.data.pagination);
      setStats(response.data.stats);
    } catch (error: any) {
      console.error('Error fetching universities:', error);
      Toast(
        error.response?.data?.message || 'Gagal memuat data perguruan tinggi',
        'error',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchUniversities();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setVerifiedFilter('');
    setAlumniFilter('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleAutoCategorize = async () => {
    setAutoCategorizing(true);
    try {
      const response = await axios.post(
        '/api/admin/universities/auto-categorize',
      );
      Toast(
        response.data.message ||
          'Berhasil mengkategori perguruan tinggi otomatis',
        'success',
      );
      fetchUniversities();
    } catch (error: any) {
      Toast(
        error.response?.data?.message || 'Gagal mengkategori otomatis',
        'error',
      );
    } finally {
      setAutoCategorizing(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingUniversity(null);
    setFormData({
      name: '',
      type: 'negeri',
      location: '',
      isVerified: true,
      cascadeUpdate: true,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (univ: UniversityData) => {
    setEditingUniversity(univ);
    setFormData({
      name: univ.name,
      type: univ.type || '',
      location: univ.location || '',
      isVerified: univ.isVerified,
      cascadeUpdate: true,
    });
    setShowModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      Toast('Nama perguruan tinggi tidak boleh kosong', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (editingUniversity) {
        const response = await axios.put(
          `/api/admin/universities/${editingUniversity._id}`,
          formData,
        );
        const { cascadeStats } = response.data;
        let successMsg = 'Perguruan tinggi berhasil diperbarui!';
        if (
          cascadeStats &&
          (cascadeStats.updatedUsersCount > 0 ||
            cascadeStats.updatedPlansCount > 0)
        ) {
          successMsg += ` (Memperbarui ${cascadeStats.updatedUsersCount} alumni & ${cascadeStats.updatedPlansCount} rencana studi)`;
        }
        Toast(successMsg, 'success');
      } else {
        await axios.post('/api/admin/universities', formData);
        Toast('Perguruan tinggi berhasil ditambahkan!', 'success');
      }
      setShowModal(false);
      fetchUniversities();
    } catch (error: any) {
      Toast(
        error.response?.data?.message ||
          'Gagal menyimpan data perguruan tinggi',
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUniv) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/admin/universities/${deletingUniv._id}`);
      Toast(
        `Perguruan tinggi "${deletingUniv.name}" berhasil dihapus`,
        'success',
      );
      setDeletingUniv(null);
      fetchUniversities();
    } catch (error: any) {
      Toast(
        error.response?.data?.message || 'Gagal menghapus perguruan tinggi',
        'error',
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'negeri':
        return (
          <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 shadow-xs'>
            PTN (Negeri)
          </span>
        );
      case 'swasta':
        return (
          <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border shadow-xs'>
            PTS (Swasta)
          </span>
        );
      case 'kedinasan':
        return (
          <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border shadow-xs'>
            Kedinasan
          </span>
        );
      case 'luar negeri':
        return (
          <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border shadow-xs'>
            Luar Negeri
          </span>
        );
      default:
        return (
          <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-800 border shadow-xs'>
            Belum Dipilih
          </span>
        );
    }
  };

  if (loading && universities.length === 0) {
    return (
      <SmartLoader
        messages={[
          'Memuat master data universitas...',
          'Menyiapkan statistik...',
        ]}
      />
    );
  }

  return (
    <div className='p-6 md:p-8 animate-fade-in space-y-6 pb-12'>
      {/* Standardized Header */}
      <PageHeader
        title='Kelola Perguruan Tinggi'
        description='Kelola master data perguruan tinggi, perbaiki typo nama, dan verifikasi status data'
      >
        <div className='flex flex-wrap items-center gap-2.5 justify-end'>
          {(stats.unassignedType || 0) > 0 && (
            <button
              onClick={handleAutoCategorize}
              disabled={autoCategorizing}
              className='flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-lg text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]'
              title='Otomatis mengisi jenis PT berdasarkan nama'
            >
              <FaMagic className='text-sm' />
              <span>
                {autoCategorizing
                  ? 'Memproses...'
                  : `Otomatis Kategori (${stats.unassignedType})`}
              </span>
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className='inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:scale-105 active:scale-95 transition-all duration-200'
          >
            <FaPlus />
            <span>Tambah Perguruan Tinggi</span>
          </button>
        </div>
      </PageHeader>

      {/* Info Banner for Unassigned Types */}
      {(stats.unassignedType || 0) > 0 && (
        <div className='p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-blue-900 shadow-sm'>
          <div className='flex items-center gap-3'>
            <FaExclamationTriangle className='text-lg text-blue-900  shrink-0' />
            <p className='font-medium leading-relaxed'>
              Terdapat{' '}
              <strong className='text-blue-900  font-bold'>
                {stats.unassignedType} perguruan tinggi
              </strong>{' '}
              yang jenis kategorinya masih{' '}
              <span className='font-bold underline'>Belum Dipilih</span>. Klik{' '}
              <strong>Proses Otomatis</strong> untuk mengisinya secara cepat
              berdasarkan kata kunci nama.
            </p>
          </div>
          <button
            onClick={handleAutoCategorize}
            disabled={autoCategorizing}
            className='px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-semibold rounded-xl shrink-0 shadow-md transition-all flex items-center gap-1.5'
          >
            <FaMagic /> {autoCategorizing ? 'Memproses...' : 'Proses Otomatis'}
          </button>
        </div>
      )}

      {/* Stats Section */}
      <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4'>
        <Card className='p-4 border border-[color:var(--border-color)]'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-xs font-medium text-[color:var(--text-tertiary)] uppercase tracking-wider'>
                Total PT
              </p>
              <h3 className='text-2xl font-bold text-[color:var(--text-primary)] mt-1'>
                {stats.total}
              </h3>
            </div>
            <div className='p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400'>
              <FaUniversity className='text-xl' />
            </div>
          </div>
        </Card>

        <Card className='p-4 border border-[color:var(--border-color)]'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-xs font-medium text-[color:var(--text-tertiary)] uppercase tracking-wider'>
                PT Negeri
              </p>
              <h3 className='text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1'>
                {stats.negeri}
              </h3>
            </div>
            <div className='p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400'>
              <FaBuilding className='text-xl' />
            </div>
          </div>
        </Card>

        <Card className='p-4 border border-[color:var(--border-color)]'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-xs font-medium text-[color:var(--text-tertiary)] uppercase tracking-wider'>
                PT Swasta
              </p>
              <h3 className='text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1'>
                {stats.swasta}
              </h3>
            </div>
            <div className='p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
              <FaGraduationCap className='text-xl' />
            </div>
          </div>
        </Card>

        <Card className='p-4 border border-[color:var(--border-color)]'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-xs font-medium text-[color:var(--text-tertiary)] uppercase tracking-wider'>
                Kedinasan / LN
              </p>
              <h3 className='text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1'>
                {stats.kedinasan + stats.luarNegeri}
              </h3>
            </div>
            <div className='p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400'>
              <FaGlobeAmericas className='text-xl' />
            </div>
          </div>
        </Card>

        <Card className='p-4 col-span-2 md:col-span-4 lg:col-span-1 border border-[color:var(--border-color)]'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-xs font-medium text-[color:var(--text-tertiary)] uppercase tracking-wider'>
                Terverifikasi
              </p>
              <div className='flex items-baseline gap-2 mt-1'>
                <h3 className='text-2xl font-bold text-emerald-600 dark:text-emerald-400'>
                  {stats.verified}
                </h3>
                <span className='text-xs text-[color:var(--text-tertiary)]'>
                  / {stats.unverified} belum
                </span>
              </div>
            </div>
            <div className='p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
              <FaCheckCircle className='text-xl' />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className='p-4 border border-[color:var(--border-color)] space-y-4'>
        <form
          onSubmit={handleSearchSubmit}
          className='grid grid-cols-1 md:grid-cols-12 gap-3'
        >
          {/* Search Field */}
          <div className='md:col-span-4 relative'>
            <FaSearch className='absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)]' />
            <input
              type='text'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Cari nama atau lokasi universitas...'
              className='w-full pl-10 pr-4 py-2.5 bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)] rounded-xl text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
            />
          </div>

          {/* Type Filter */}
          <div className='md:col-span-3'>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className='w-full px-3.5 py-2.5 bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)] rounded-xl text-sm text-[color:var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
            >
              <option value=''>Semua Jenis PT</option>
              <option value='negeri'>PTN (Negeri)</option>
              <option value='swasta'>PTS (Swasta)</option>
              <option value='kedinasan'>Kedinasan</option>
              <option value='luar negeri'>Luar Negeri</option>
              <option value='unassigned'>Belum Dipilih</option>
            </select>
          </div>

          {/* Alumni Filter */}
          <div className='md:col-span-2'>
            <select
              value={alumniFilter}
              onChange={(e) => {
                setAlumniFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className='w-full px-3 py-2.5 bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)] rounded-xl text-sm text-[color:var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
            >
              <option value=''>Semua Data Alumni</option>
              <option value='has_alumni'>Ada Alumni (≥ 1)</option>
              <option value='no_alumni'>Alumni Kosong (0)</option>
            </select>
          </div>

          {/* Verified Status Filter */}
          <div className='md:col-span-2'>
            <select
              value={verifiedFilter}
              onChange={(e) => {
                setVerifiedFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className='w-full px-3 py-2.5 bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)] rounded-xl text-sm text-[color:var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
            >
              <option value=''>Semua Status Verifikasi</option>
              <option value='true'>Terverifikasi</option>
              <option value='false'>Belum Terverifikasi</option>
            </select>
          </div>

          {/* Search & Reset Buttons */}
          <div className='md:col-span-1 flex gap-2'>
            <button
              type='submit'
              className='w-full flex items-center justify-center p-2.5 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-all'
              title='Cari'
            >
              <FaSearch />
            </button>
            {(searchTerm || typeFilter || verifiedFilter || alumniFilter) && (
              <button
                type='button'
                onClick={handleResetFilters}
                className='p-2.5 bg-gray-200 text-[color:var(--text-secondary)] rounded-xl hover:bg-gray-300 dark:hover:bg-gray-300 transition-all'
                title='Reset Filter'
              >
                <FaSyncAlt />
              </button>
            )}
          </div>
        </form>
      </Card>

      {/* Table Section */}
      <Card className='overflow-hidden border border-[color:var(--border-color)] shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse text-sm'>
            <thead>
              <tr className='bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] border-b border-[color:var(--border-color)] font-semibold uppercase tracking-wider text-xs'>
                <th className='p-4 min-w-[220px]'>Nama Perguruan Tinggi</th>
                <th className='p-4 min-w-[130px]'>Jenis</th>
                <th className='p-4 min-w-[140px]'>Lokasi</th>
                <th className='p-4 min-w-[150px]'>Status Verifikasi</th>
                <th className='p-4 min-w-[160px]'>Penggunaan Data</th>
                <th className='p-4 text-center min-w-[120px]'>Aksi</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[color:var(--border-color)]'>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className='text-center p-8 text-[color:var(--text-secondary)]'
                  >
                    Memuat data perguruan tinggi...
                  </td>
                </tr>
              ) : universities.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className='text-center p-8 text-[color:var(--text-tertiary)]'
                  >
                    <div className='flex flex-col items-center justify-center gap-2'>
                      <FaUniversity className='text-4xl opacity-30' />
                      <p>Tidak ada data perguruan tinggi yang ditemukan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                universities.map((univ) => (
                  <tr
                    key={univ._id}
                    className='hover:bg-[color:var(--bg-tertiary)]/50 transition-colors'
                  >
                    <td className='p-4 font-medium text-[color:var(--text-primary)]'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] shrink-0'>
                          <FaUniversity />
                        </div>
                        <span className='line-clamp-2'>{univ.name}</span>
                      </div>
                    </td>
                    <td className='p-4'>{getTypeBadge(univ.type)}</td>
                    <td className='p-4 text-[color:var(--text-secondary)]'>
                      {univ.location || '-'}
                    </td>
                    <td className='p-4'>
                      {univ.isVerified ? (
                        <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 shadow-xs'>
                          <FaCheckCircle className='text-xs' /> Terverifikasi
                        </span>
                      ) : (
                        <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 shadow-xs'>
                          <FaExclamationTriangle className='text-xs' /> Belum
                          Terverifikasi
                        </span>
                      )}
                    </td>
                    <td className='p-4 text-xs text-[color:var(--text-secondary)]'>
                      <div className='space-y-1'>
                        <div className='flex items-center gap-1.5'>
                          {univ.alumniCount === 0 && (
                            <span className='px-2 py-0.5 rounded-full text-red-800 bg-red-200 text-[10px] font-bold shadow-xs'>
                              Alumni Kosong
                            </span>
                          )}
                        </div>
                        <div className='flex items-center gap-3 text-[11px] text-[color:var(--text-tertiary)]'>
                          <span className='flex items-center gap-1'>
                            <FaUserGraduate className='text-[10px]' />{' '}
                            {univ.alumniCount} Alumni
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className='p-4 text-center'>
                      <div className='flex items-center justify-center gap-2'>
                        <button
                          onClick={() => handleOpenEditModal(univ)}
                          className='p-2 text-blue-600 hover:text-white hover:bg-blue-600 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white rounded-lg transition-all shadow-xs'
                          title='Edit Universitas'
                        >
                          <FaEdit className='text-base' />
                        </button>
                        <button
                          onClick={() => setDeletingUniv(univ)}
                          className='p-2 text-red-600 hover:text-white hover:bg-red-600 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white rounded-lg transition-all shadow-xs'
                          title='Hapus Universitas'
                        >
                          <FaTrash className='text-base' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div className='flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[color:var(--bg-tertiary)] border-t border-[color:var(--border-color)]'>
            <p className='text-xs text-[color:var(--text-secondary)]'>
              Menampilkan Halaman{' '}
              <span className='font-semibold'>{pagination.page}</span> dari{' '}
              <span className='font-semibold'>{pagination.pages}</span> (
              {pagination.total} total data)
            </p>
            <div className='flex items-center gap-2'>
              <button
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                className='px-3.5 py-1.5 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] text-xs font-medium text-[color:var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] dark:hover:bg-[var(--primary)] dark:hover:text-white transition-all shadow-xs flex items-center gap-1'
              >
                <FaChevronLeft className='text-[10px]' /> Prev
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                className='px-3.5 py-1.5 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] text-xs font-medium text-[color:var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] dark:hover:bg-[var(--primary)] dark:hover:text-white transition-all shadow-xs flex items-center gap-1'
              >
                Next <FaChevronRight className='text-[10px]' />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Add / Edit Modal - Rendered at root document.body level via Portal */}
      {showModal &&
        createPortal(
          <div className='fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn'>
            <div className='bg-[color:var(--bg-card)] border border-[color:var(--border-color)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden'>
              <div className='flex items-center justify-between p-5 border-b border-[color:var(--border-color)]'>
                <h3 className='text-lg font-bold text-[color:var(--text-primary)] flex items-center gap-2'>
                  <FaUniversity className='text-[var(--primary)]' />
                  {editingUniversity
                    ? 'Edit Perguruan Tinggi'
                    : 'Tambah Perguruan Tinggi Baru'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className='p-2 text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)] rounded-lg transition-colors'
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className='p-6 space-y-4'>
                <div>
                  <label className='block text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)] mb-1'>
                    Nama Perguruan Tinggi{' '}
                    <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder='misal: Universitas Gadjah Mada'
                    className='w-full px-4 py-2.5 bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)] rounded-xl text-sm text-[color:var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)] mb-1'>
                    Jenis / Kategori Perguruan Tinggi
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as UniversityData['type'],
                      })
                    }
                    className='w-full px-4 py-2.5 bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)] rounded-xl text-sm text-[color:var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
                  >
                    <option value='negeri'>
                      PTN (Perguruan Tinggi Negeri)
                    </option>
                    <option value='swasta'>
                      PTS (Perguruan Tinggi Swasta)
                    </option>
                    <option value='kedinasan'>Kedinasan</option>
                    <option value='luar negeri'>Luar Negeri</option>
                    <option value=''>Lainnya / Belum Ditentukan</option>
                  </select>
                </div>

                <div>
                  <label className='block text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)] mb-1'>
                    Lokasi / Kota
                  </label>
                  <input
                    type='text'
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder='misal: Yogyakarta, DKI Jakarta, Malang'
                    className='w-full px-4 py-2.5 bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)] rounded-xl text-sm text-[color:var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
                  />
                </div>

                <div className='flex items-center gap-3 pt-2'>
                  <input
                    type='checkbox'
                    id='isVerifiedCheck'
                    checked={formData.isVerified}
                    onChange={(e) =>
                      setFormData({ ...formData, isVerified: e.target.checked })
                    }
                    className='w-4 h-4 text-[var(--primary)] rounded focus:ring-[var(--primary)] border-[color:var(--border-color)]'
                  />
                  <label
                    htmlFor='isVerifiedCheck'
                    className='text-sm text-[color:var(--text-primary)] cursor-pointer'
                  >
                    Tandai data ini sebagai <strong>Terverifikasi</strong>
                  </label>
                </div>

                {editingUniversity && (
                  <div className='p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-xs'>
                    <div className='flex items-start gap-2.5'>
                      <input
                        type='checkbox'
                        id='cascadeUpdateCheck'
                        checked={formData.cascadeUpdate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cascadeUpdate: e.target.checked,
                          })
                        }
                        className='w-4 h-4 mt-0.5 text-blue-600 rounded focus:ring-blue-500'
                      />
                      <label
                        htmlFor='cascadeUpdateCheck'
                        className='text-blue-900 cursor-pointer font-medium leading-relaxed'
                      >
                        Otomatis perbarui nama pada seluruh data Alumni (
                        {editingUniversity.alumniCount}) &amp; Pilihan Siswa (
                        {editingUniversity.studentPlanCount}) yang memakai nama
                        lama.
                      </label>
                    </div>
                  </div>
                )}

                <div className='flex items-center justify-end gap-3 pt-4 border-t border-[color:var(--border-color)]'>
                  <button
                    type='button'
                    onClick={() => setShowModal(false)}
                    className='px-4 py-2.5 text-sm font-medium text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-tertiary)] rounded-xl transition-colors'
                  >
                    Batal
                  </button>
                  <button
                    type='submit'
                    disabled={submitting}
                    className='flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-dark,#1d4ed8)] text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-all'
                  >
                    <FaSave />
                    <span>{submitting ? 'Menyimpan...' : 'Simpan'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* Delete Confirmation Modal - Rendered at root document.body level via Portal */}
      {deletingUniv &&
        createPortal(
          <div className='fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn'>
            <div className='bg-[color:var(--bg-card)] border border-[color:var(--border-color)] rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4'>
              <div className='flex items-center gap-3 text-red-600 dark:text-red-400'>
                <div className='p-3 bg-red-100 dark:bg-red-950/60 rounded-xl'>
                  <FaExclamationTriangle className='text-xl' />
                </div>
                <h3 className='text-lg font-bold text-[color:var(--text-primary)]'>
                  Hapus Perguruan Tinggi
                </h3>
              </div>

              <p className='text-sm text-[color:var(--text-secondary)] leading-relaxed'>
                Apakah Anda yakin ingin menghapus{' '}
                <strong>"{deletingUniv.name}"</strong> dari master data?
              </p>

              {deletingUniv.totalUsage > 0 && (
                <div className='p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200'>
                  ⚠️ Perguruan tinggi ini saat ini direferensikan oleh{' '}
                  <strong>{deletingUniv.alumniCount} alumni</strong> dan{' '}
                  <strong>
                    {deletingUniv.studentPlanCount} rencana studi siswa
                  </strong>
                  .
                </div>
              )}

              <div className='flex items-center justify-end gap-3 pt-2'>
                <button
                  onClick={() => setDeletingUniv(null)}
                  className='px-4 py-2 text-sm font-medium text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-tertiary)] rounded-xl transition-colors'
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className='px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2'
                >
                  <FaTrash className='text-xs' />
                  <span>{deleteLoading ? 'Menghapus...' : 'Ya, Hapus'}</span>
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default AdminUniversities;
