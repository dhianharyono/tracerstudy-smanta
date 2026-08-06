import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaTrash,
  FaSearch,
  FaUserGraduate,
  FaUniversity,
  FaFilter,
  FaCalendarAlt,
  FaGraduationCap,
  FaBookOpen,
} from 'react-icons/fa';
import Toast from '@/components/toast';
import ConfirmationModal from '@/components/ConfirmationModal';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import Pagination from '@/components/common/Pagination';
import {
  TableContainer,
  TableHeader,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/common/Table';

interface Plan {
  _id: string;
  targetUniversity: string;
  targetMajor: string;
  entryPath: string;
  readinessStatus: string;
  rumpun: string;
  lockCount: number;
  user: {
    _id: string;
    username: string;
    profile: {
      fullName: string;
      graduationYear?: number;
    };
  };
  createdAt: string;
  updatedAt?: string;
}

const AdminCollegePlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const [filters, setFilters] = useState({
    university: '',
    major: '',
    name: '',
    graduationYear: '',
  });

  const [filterOptions, setFilterOptions] = useState<{
    universities: string[];
    majors: string[];
    graduationYears: number[];
  }>({
    universities: [],
    majors: [],
    graduationYears: [],
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, [pagination.page, filters.university, filters.major, filters.graduationYear]);

  // Debounced search for student name
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination((prev) => ({ ...prev, page: 1 }));
      } else {
        fetchPlans();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.name]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (filters.university) params.university = filters.university;
      if (filters.major) params.major = filters.major;
      if (filters.name) params.name = filters.name;
      if (filters.graduationYear) params.graduationYear = filters.graduationYear;

      const res = await axios.get('/api/admin/college-plans', { params });
      setPlans(res.data.plans || []);
      setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });

      if (res.data.filters) {
        setFilterOptions(res.data.filters);
      }
    } catch (error) {
      console.error(error);
      Toast('Gagal memuat data rencana kuliah', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/api/admin/college-plans/${deleteId}`);
      Toast('Rencana kuliah berhasil dihapus', 'success');
      setIsDeleteModalOpen(false);
      setDeleteId(null);
      fetchPlans();
    } catch (error: any) {
      Toast(error.response?.data?.message || 'Gagal menghapus data', 'error');
    }
  };

  const clearFilters = () => {
    setFilters({
      university: '',
      major: '',
      name: '',
      graduationYear: '',
    });
  };

  // Stats calculation
  const totalUniversities = filterOptions.universities.length;
  const totalMajors = filterOptions.majors.length;

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in space-y-6'>
      <PageHeader
        title='Monitoring Rencana Kuliah'
        description='Pantau dan kelola data rencana studi lanjut siswa yang telah diinputkan'
      />

      {/* Summary Stat Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <Card className='flex items-center gap-4'>
          <div className='p-3 bg-blue-500/10 text-blue-600 rounded-xl text-xl shrink-0'>
            <FaGraduationCap />
          </div>
          <div>
            <p className='text-xs text-[color:var(--text-secondary)] font-medium'>Total Rencana Studi</p>
            <h3 className='text-xl font-bold text-[color:var(--text-primary)]'>{pagination.total}</h3>
          </div>
        </Card>

        <Card className='flex items-center gap-4'>
          <div className='p-3 bg-indigo-500/10 text-indigo-600 rounded-xl text-xl shrink-0'>
            <FaUniversity />
          </div>
          <div>
            <p className='text-xs text-[color:var(--text-secondary)] font-medium'>Perguruan Tinggi Target</p>
            <h3 className='text-xl font-bold text-[color:var(--text-primary)]'>{totalUniversities}</h3>
          </div>
        </Card>

        <Card className='flex items-center gap-4'>
          <div className='p-3 bg-purple-500/10 text-purple-600 rounded-xl text-xl shrink-0'>
            <FaBookOpen />
          </div>
          <div>
            <p className='text-xs text-[color:var(--text-secondary)] font-medium'>Jurusan Target</p>
            <h3 className='text-xl font-bold text-[color:var(--text-primary)]'>{totalMajors}</h3>
          </div>
        </Card>
      </div>

      {/* Filter Section */}
      <Card>
        <div className='flex items-center justify-between gap-3 mb-4'>
          <div className='flex items-center gap-2 text-sm font-bold text-[color:var(--text-primary)]'>
            <FaFilter className='text-[color:var(--primary)]' /> Filter Data Rencana Kuliah
          </div>
          {(filters.name || filters.university || filters.major || filters.graduationYear) && (
            <button
              onClick={clearFilters}
              className='text-xs font-semibold text-red-500 hover:underline'
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
          <div className='relative'>
            <input
              type='text'
              placeholder='Cari Nama Siswa...'
              value={filters.name}
              onChange={(e) => setFilters((prev) => ({ ...prev, name: e.target.value }))}
              className='w-full pl-9 pr-3 py-2.5 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] text-sm text-[color:var(--text-primary)] focus:ring-2 focus:ring-[color:var(--primary)] outline-none transition-all'
            />
            <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[color:var(--text-tertiary)]' />
          </div>

          <div className='relative'>
            <select
              value={filters.university}
              onChange={(e) => setFilters((prev) => ({ ...prev, university: e.target.value }))}
              className='w-full pl-9 pr-8 py-2.5 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] text-sm text-[color:var(--text-primary)] focus:ring-2 focus:ring-[color:var(--primary)] outline-none appearance-none transition-all'
            >
              <option value=''>Semua Perguruan Tinggi</option>
              {filterOptions.universities.map((uni: string, idx: number) => (
                <option key={idx} value={uni}>
                  {uni}
                </option>
              ))}
            </select>
            <FaUniversity className='absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[color:var(--text-tertiary)]' />
            <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-[color:var(--text-tertiary)] opacity-60'>
              ▼
            </div>
          </div>

          <div className='relative'>
            <select
              value={filters.major}
              onChange={(e) => setFilters((prev) => ({ ...prev, major: e.target.value }))}
              className='w-full pl-9 pr-8 py-2.5 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] text-sm text-[color:var(--text-primary)] focus:ring-2 focus:ring-[color:var(--primary)] outline-none appearance-none transition-all'
            >
              <option value=''>Semua Jurusan</option>
              {filterOptions.majors.map((major: string, idx: number) => (
                <option key={idx} value={major}>
                  {major}
                </option>
              ))}
            </select>
            <FaUserGraduate className='absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[color:var(--text-tertiary)]' />
            <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-[color:var(--text-tertiary)] opacity-60'>
              ▼
            </div>
          </div>

          <div className='relative'>
            <select
              value={filters.graduationYear}
              onChange={(e) => setFilters((prev) => ({ ...prev, graduationYear: e.target.value }))}
              className='w-full pl-9 pr-8 py-2.5 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] text-sm text-[color:var(--text-primary)] focus:ring-2 focus:ring-[color:var(--primary)] outline-none appearance-none transition-all'
            >
              <option value=''>Semua Angkatan</option>
              {filterOptions.graduationYears.map((year: number, idx: number) => (
                <option key={idx} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <FaCalendarAlt className='absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[color:var(--text-tertiary)]' />
            <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-[color:var(--text-tertiary)] opacity-60'>
              ▼
            </div>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <TableContainer>
        <TableHeader>
          <TableHeadCell>Siswa</TableHeadCell>
          <TableHeadCell>Target Kampus</TableHeadCell>
          <TableHeadCell>Target Jurusan</TableHeadCell>
          <TableHeadCell>Terakhir Diperbarui</TableHeadCell>
          <TableHeadCell className='text-center'>Aksi</TableHeadCell>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className='text-center py-12'>
                <div className='flex justify-center items-center gap-3 text-slate-500'>
                  <div className='h-6 w-6 border-2 border-[color:var(--border-color)] border-t-[color:var(--primary)] rounded-full animate-spin' />
                  <span className='text-sm font-medium'>Memuat data rencana kuliah...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : plans.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className='text-center py-12 text-[color:var(--text-secondary)]'>
                Belum ada data rencana kuliah yang ditemukan
              </TableCell>
            </TableRow>
          ) : (
            plans.map((plan) => (
              <TableRow key={plan._id}>
                <TableCell>
                  <div className='space-y-0.5'>
                    <p className='font-bold text-[color:var(--text-primary)]'>
                      {plan.user?.profile?.fullName || plan.user?.username || 'Unknown Student'}
                    </p>
                    <div className='flex items-center gap-2 text-xs text-[color:var(--text-secondary)]'>
                      <span>Angkatan: {plan.user?.profile?.graduationYear || '-'}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className='flex items-center gap-2'>
                    <FaUniversity className='text-[#3b6ebb] shrink-0 text-sm' />
                    <span className='font-medium text-[color:var(--text-primary)]'>
                      {plan.targetUniversity}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <span className='font-medium text-[color:var(--text-primary)]'>
                    {plan.targetMajor}
                  </span>
                </TableCell>

                <TableCell>
                  <span className='text-xs text-[color:var(--text-secondary)] font-medium'>
                    {plan.updatedAt || plan.createdAt
                      ? new Date(plan.updatedAt || plan.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </span>
                </TableCell>

                <TableCell className='text-center'>
                  <button
                    onClick={() => {
                      setDeleteId(plan._id);
                      setIsDeleteModalOpen(true);
                    }}
                    className='p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors inline-flex items-center justify-center'
                    title='Hapus Data Rencana Kuliah'
                  >
                    <FaTrash className='text-sm' />
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </TableContainer>

      {/* Pagination */}
      {pagination.total > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title='Hapus Data Rencana Kuliah'
        message='Apakah Anda yakin ingin menghapus data rencana kuliah ini? Tindakan ini tidak dapat dibatalkan.'
        confirmText='Hapus'
        cancelText='Batal'
      />
    </div>
  );
};

export default AdminCollegePlans;
