import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaSearch, FaUserGraduate, FaUniversity, FaFilter, FaCalendarAlt } from 'react-icons/fa';
import Toast from '@/components/toast';
import ConfirmationModal from '@/components/ConfirmationModal';

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
        graduationYear: ''
    });

    const [filterOptions, setFilterOptions] = useState({
        universities: [],
        majors: [],
        graduationYears: []
    });

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        fetchPlans();
    }, [pagination.page, filters]);

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
            setPlans(res.data.plans);
            setPagination(res.data.pagination);

            // Update filter options if available
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

    return (
        <div className='p-6 md:p-8 animate-fade-in space-y-8'>
            <div className='mb-2 text-center md:text-left'>
                <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
                    Monitoring Rencana Kuliah
                </h1>
                <p className='text-[color:var(--text-secondary)] text-sm md:text-base'>
                    Pantau dan kelola data rencana studi lanjut siswa
                </p>
            </div>

            {/* Filters */}
            <div className='bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-color)] shadow-sm'>
                <div className='flex items-center gap-3 mb-6'>
                    <div className='p-2 bg-[var(--bg-tertiary)] rounded-xl text-[var(--text-primary)]'>
                        <FaFilter />
                    </div>
                    <div className='font-bold text-[var(--text-primary)]'>Filter Data</div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                    <div className='relative'>
                        <input
                            type='text'
                            placeholder='Cari Nama Siswa...'
                            value={filters.name}
                            onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                            className='w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none'
                        />
                        <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]' />
                    </div>
                    <div className='relative'>
                        <select
                            value={filters.university}
                            onChange={(e) => setFilters(prev => ({ ...prev, university: e.target.value }))}
                            className='w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none appearance-none'
                        >
                            <option value="">Semua Universitas</option>
                            {filterOptions.universities.map((uni: string, idx: number) => (
                                <option key={idx} value={uni}>{uni}</option>
                            ))}
                        </select>
                        <FaUniversity className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]' />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-tertiary)] opacity-50">▼</div>
                    </div>
                    <div className='relative'>
                        <select
                            value={filters.major}
                            onChange={(e) => setFilters(prev => ({ ...prev, major: e.target.value }))}
                            className='w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none appearance-none'
                        >
                            <option value="">Semua Jurusan</option>
                            {filterOptions.majors.map((major: string, idx: number) => (
                                <option key={idx} value={major}>{major}</option>
                            ))}
                        </select>
                        <FaUserGraduate className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]' />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-tertiary)] opacity-50">▼</div>
                    </div>
                    <div className='relative'>
                        <select
                            value={filters.graduationYear}
                            onChange={(e) => setFilters(prev => ({ ...prev, graduationYear: e.target.value }))}
                            className='w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none appearance-none'
                        >
                            <option value="">Semua Angkatan</option>
                            {filterOptions.graduationYears.map((year: number, idx: number) => (
                                <option key={idx} value={year}>{year}</option>
                            ))}
                        </select>
                        <FaCalendarAlt className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]' />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-tertiary)] opacity-50">▼</div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className='bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-sm overflow-hidden'>
                <div className='overflow-x-auto'>
                    <table className='w-full text-left border-collapse'>
                        <thead className='bg-[var(--bg-tertiary)] border-b border-[var(--border-color)]'>
                            <tr>
                                <th className='p-6 text-xs font-bold text-[var(--text-secondary)] uppercase'>Siswa</th>
                                <th className='p-6 text-xs font-bold text-[var(--text-secondary)] uppercase'>Target Kampus</th>
                                <th className='p-6 text-xs font-bold text-[var(--text-secondary)] uppercase'>Jurusan</th>
                                <th className='p-6 text-xs font-bold text-[var(--text-secondary)] uppercase'>Detail</th>
                                <th className='p-6 text-xs font-bold text-[var(--text-secondary)] uppercase text-center'>Aksi</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-[var(--border-color)]'>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className='p-8 text-center'>
                                        <div className='flex justify-center'>
                                            <div className='h-8 w-8 border-4 border-[color:var(--border-color)] border-t-[var(--primary)] rounded-full animate-spin' />
                                        </div>
                                    </td>
                                </tr>
                            ) : plans.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className='p-8 text-center text-[var(--text-secondary)]'>
                                        Tidak ada data ditemukan
                                    </td>
                                </tr>
                            ) : (
                                plans.map((plan) => (
                                    <tr key={plan._id} className='hover:bg-[var(--bg-tertiary)] transition-colors'>
                                        <td className='p-6'>
                                            <div>
                                                <p className='font-bold text-[var(--text-primary)]'>
                                                    {plan.user?.profile?.fullName || plan.user?.username || 'Unknown'}
                                                </p>
                                                <p className='text-xs text-[var(--text-secondary)]'>
                                                    Angkatan: {plan.user?.profile?.graduationYear || '-'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className='p-6'>
                                            <div className='flex items-center gap-2'>
                                                <FaUniversity className='text-[var(--primary)]' />
                                                <span className='text-sm text-[var(--text-primary)]'>{plan.targetUniversity}</span>
                                            </div>
                                        </td>
                                        <td className='p-6'>
                                            <span className='text-sm text-[var(--text-primary)]'>{plan.targetMajor}</span>
                                        </td>
                                        <td className='p-6'>
                                            <div className='space-y-1'>
                                                <span className='inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 mr-2'>
                                                    {plan.entryPath}
                                                </span>
                                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${plan.readinessStatus === 'Yakin' ? 'bg-green-100 text-green-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {plan.readinessStatus}
                                                </span>
                                                <div className="text-[10px] text-[var(--text-tertiary)] mt-1">
                                                    Edit: {plan.lockCount}/3
                                                </div>
                                            </div>
                                        </td>
                                        <td className='p-6 text-center'>
                                            <button
                                                onClick={() => {
                                                    setDeleteId(plan._id);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className='p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors'
                                                title="Hapus Data"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className='p-6 border-t border-[var(--border-color)] flex flex-col md:flex-row justify-between items-center'>
                    <p className='text-sm text-[var(--text-secondary)] mb-4 md:mb-0'>
                        Halaman {pagination.page} dari {pagination.pages} dari {pagination.total} Data
                    </p>
                    <div className='flex gap-2'>
                        <button
                            disabled={pagination.page === 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            className='px-4 py-2 text-sm font-bold rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] disabled:opacity-50 text-[var(--text-primary)]'
                        >
                            Previous
                        </button>
                        <button
                            disabled={pagination.page === pagination.pages || pagination.pages === 0}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            className='px-4 py-2 text-sm font-bold rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] disabled:opacity-50 text-[var(--text-primary)]'
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Data Rencana Kuliah"
                message="Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan."
                confirmText="Hapus"
                cancelText="Batal"
            />
        </div>
    );
};

export default AdminCollegePlans;
