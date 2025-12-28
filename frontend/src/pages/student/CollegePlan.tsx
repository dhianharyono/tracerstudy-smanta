import { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
    FaUniversity,
    FaGraduationCap,
    FaSearch,
    FaUsers,
    FaBriefcase,
    FaLinkedin,
    FaInstagram,
    FaFilter,
    FaComments,
    FaCrown,
} from 'react-icons/fa';
import Toast from '@/components/toast';

interface AlumniData {
    _id: string;
    username: string;
    profile?: {
        fullName?: string;
        gender?: string;
        graduationYear?: number;
    };
    university?: {
        name?: string;
        type?: string;
        major?: string;
    };
    job?: {
        position?: string;
        institution?: string;
    };
    socialMedia?: {
        email?: string;
        linkedin?: string;
        instagram?: string;
    };
    isMentor?: boolean;
}

interface UniversityOption {
    name: string;
    type?: string;
    count: number;
}

interface MajorOption {
    name: string;
    count: number;
}

const CollegePlan = () => {
    const [loading, setLoading] = useState(true);
    const [universities, setUniversities] = useState<UniversityOption[]>([]);
    const [majors, setMajors] = useState<MajorOption[]>([]);
    const [selectedUniversity, setSelectedUniversity] = useState('');
    const [selectedMajor, setSelectedMajor] = useState('');
    const [isMentorFilter, setIsMentorFilter] = useState(false);
    const [filteredAlumni, setFilteredAlumni] = useState<AlumniData[]>([]);
    const [loadingAlumni, setLoadingAlumni] = useState(false);

    useEffect(() => {
        fetchUniversities();
    }, [selectedMajor]);

    useEffect(() => {
        fetchMajors();
    }, [selectedUniversity]);

    useEffect(() => {
        if (selectedUniversity || selectedMajor || isMentorFilter) {
            fetchAlumni();
        } else {
            setFilteredAlumni([]);
        }
    }, [selectedUniversity, selectedMajor, isMentorFilter]);

    const fetchUniversities = async () => {
        try {
            const params: any = {};
            if (selectedMajor) params.major = selectedMajor;
            const res = await axios.get('/api/alumni/universities', { params });
            setUniversities(res.data);
            if (loading) setLoading(false);
        } catch (error) {
            console.error('Error fetching universities:', error);
        }
    };

    const fetchMajors = async () => {
        try {
            const params: any = {};
            if (selectedUniversity) params.university = selectedUniversity;
            const res = await axios.get('/api/alumni/majors', { params });
            setMajors(res.data);
            if (loading) setLoading(false);
        } catch (error) {
            console.error('Error fetching majors:', error);
        }
    };

    const fetchAlumni = async () => {
        try {
            setLoadingAlumni(true);
            const params: any = {};
            if (selectedUniversity) params.university = selectedUniversity;
            if (selectedMajor) params.major = selectedMajor;
            if (isMentorFilter) params.isMentor = 'true';

            const response = await axios.get('/api/alumni', { params });
            setFilteredAlumni(response.data);
        } catch (error) {
            console.error('Error fetching alumni:', error);
            Toast('Gagal mengambil data alumni', 'error');
        } finally {
            setLoadingAlumni(false);
        }
    };

    const getUniversityTypeLabel = (type?: string) => {
        switch (type) {
            case 'negeri': return 'PTN';
            case 'swasta': return 'PTS';
            case 'kedinasan': return 'Kedinasan';
            default: return '';
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className='p-4 md:p-8 animate-fade-in'>
            <div className='text-center md:text-left mb-8'>
                <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
                    Rencana Kuliah
                </h1>
                <p className='text-[color:var(--text-secondary)]'>
                    Jelajahi jejak alumni untuk menentukan masa depan Anda
                </p>
            </div>

            <div className='flex flex-col lg:flex-row gap-10'>
                {/* Left Side: Clean Filter Card */}
                <div className='w-full lg:w-80 shrink-0'>
                    <div className='bg-[color:var(--bg-card)] rounded-3xl border border-[color:var(--border-color)] overflow-hidden shadow-sm lg:sticky lg:top-8'>
                        <div className='p-6 border-b border-[color:var(--border-color)]'>
                            <div className='flex items-center gap-3'>
                                <FaFilter className='text-[var(--primary)] text-sm' />
                                <h2 className='text-sm font-bold uppercase tracking-wider text-[color:var(--text-primary)] !mb-0'>
                                    Filter Pencarian
                                </h2>
                            </div>
                        </div>

                        <div className='p-6 space-y-8'>
                            {/* University Select */}
                            <div className='space-y-3'>
                                <label className='text-xs font-bold text-[color:var(--text-tertiary)] uppercase tracking-widest'>
                                    Universitas
                                </label>
                                <div className='relative'>
                                    <select
                                        className='w-full pl-4 pr-10 py-3 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] text-[color:var(--text-primary)] appearance-none focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all cursor-pointer text-sm font-medium'
                                        value={selectedUniversity}
                                        onChange={(e) => setSelectedUniversity(e.target.value)}
                                    >
                                        <option value="">Semua Universitas</option>
                                        {universities.map((u, i) => (
                                            <option key={i} value={u.name}>
                                                {u.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[color:var(--text-tertiary)]'>
                                        <FaUniversity className='text-xs' />
                                    </div>
                                </div>
                            </div>

                            {/* Major Select */}
                            <div className='space-y-3'>
                                <label className='text-xs font-bold text-[color:var(--text-tertiary)] uppercase tracking-widest'>
                                    Jurusan
                                </label>
                                <div className='relative'>
                                    <select
                                        className='w-full pl-4 pr-10 py-3 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] text-[color:var(--text-primary)] appearance-none focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all cursor-pointer text-sm font-medium'
                                        value={selectedMajor}
                                        onChange={(e) => setSelectedMajor(e.target.value)}
                                    >
                                        <option value="">Semua Jurusan</option>
                                        {majors.map((m, i) => (
                                            <option key={i} value={m.name}>
                                                {m.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[color:var(--text-tertiary)]'>
                                        <FaGraduationCap className='text-xs' />
                                    </div>
                                </div>
                            </div>

                            {/* Mentor Filter Toggle */}
                            <div className='flex items-center justify-between p-4 bg-amber-50/50 dark:bg-amber-500/5 rounded-2xl border border-amber-100 dark:border-amber-500/10'>
                                <div className='flex items-center gap-3'>
                                    <FaCrown className='text-amber-500 text-sm' />
                                    <span className='text-xs font-bold text-[color:var(--text-primary)]'>Hanya Mentor</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={isMentorFilter}
                                        onChange={(e) => setIsMentorFilter(e.target.checked)}
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
                                </label>
                            </div>

                            {(selectedUniversity || selectedMajor || isMentorFilter) && (
                                <button
                                    onClick={() => {
                                        setSelectedUniversity('');
                                        setSelectedMajor('');
                                        setIsMentorFilter(false);
                                    }}
                                    className='w-full py-3 text-xs font-bold text-red-500 bg-red-50 transition-all rounded-2xl border border-red-100 dark:bg-red-500/5 dark:border-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/10'
                                >
                                    Hapus Semua Filter
                                </button>
                            )}

                            <div className='pt-6 border-t border-[color:var(--border-color)]'>
                                <h4 className='text-xs font-bold text-[color:var(--text-primary)] mb-4 flex items-center gap-2'>
                                    <FaCrown className='text-amber-500' /> Program Mentorship
                                </h4>
                                <div className='p-4 bg-amber-50 dark:bg-amber-500/5 rounded-2xl border border-amber-100 dark:border-amber-500/10'>
                                    <p className='text-[10px] leading-relaxed text-amber-800 dark:text-amber-300'>
                                        Alumni dengan <strong>warna profil berbeda</strong> dan memiliki <strong>kontak sosial media</strong> adalah Mentor yang bersedia membimbing Anda secara langsung.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Modern Minimalist Content */}
                <div className='flex-1'>
                    {!selectedUniversity && !selectedMajor && !isMentorFilter ? (
                        <div className='h-[500px] flex flex-col items-center justify-center text-center p-8 bg-[color:var(--bg-card)] rounded-3xl border border-[color:var(--border-color)] shadow-sm'>
                            <div className='w-16 h-16 bg-[color:var(--bg-secondary)] rounded-2xl flex items-center justify-center mb-6 border border-[color:var(--border-color)]'>
                                <FaSearch className='text-2xl text-[color:var(--text-tertiary)]' />
                            </div>
                            <h3 className='text-xl font-bold text-[color:var(--text-primary)] mb-2'>
                                Pilih Universitas atau Jurusan
                            </h3>
                            <p className='text-[color:var(--text-secondary)] max-w-sm'>
                                Gunakan filter di sebelah kiri untuk melihat daftar alumni yang pernah menempuh jalur tersebut.
                            </p>
                        </div>
                    ) : (
                        <div className='space-y-8 animate-fade-in'>
                            {/* Simple Results Summary */}
                            <div className='flex items-center justify-between gap-4'>
                                <div>
                                    <h2 className='text-lg font-bold text-[color:var(--text-primary)]'>
                                        Ditemukan {filteredAlumni.length} Alumni
                                    </h2>
                                    <p className='text-sm text-[color:var(--text-secondary)] mt-1 hidden sm:block'>
                                        Daftar alumni yang menempuh pendidikan di {(selectedUniversity && selectedMajor) ? `${selectedUniversity} - ${selectedMajor}` : (selectedUniversity || selectedMajor)}
                                    </p>
                                </div>
                                <div className='flex gap-2'>
                                    {selectedUniversity && (
                                        <span className='px-3 py-1.5 bg-[var(--primary)] text-white text-[10px] font-bold rounded-lg uppercase'>
                                            {selectedUniversity}
                                        </span>
                                    )}
                                    {selectedMajor && (
                                        <span className='px-3 py-1.5 bg-gray-800 dark:bg-gray-700 text-white text-[10px] font-bold rounded-lg uppercase'>
                                            {selectedMajor}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {loadingAlumni ? (
                                <div className='py-32 flex flex-col items-center justify-center'>
                                    <div className='h-8 w-8 border-4 border-[color:var(--border-color)] border-t-[var(--primary)] rounded-full animate-spin mb-4' />
                                    <p className='text-sm font-medium text-[color:var(--text-secondary)]'>Memuat data alumni...</p>
                                </div>
                            ) : filteredAlumni.length > 0 ? (
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                    {filteredAlumni.map((alumni) => (
                                        <div
                                            key={alumni._id}
                                            className={`p-6 rounded-3xl border transition-all group relative ${alumni.isMentor
                                                ? 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20 hover:border-amber-400'
                                                : 'bg-[color:var(--bg-card)] border-[color:var(--border-color)] hover:border-[var(--primary)]'
                                                }`}
                                        >
                                            {/* Avatar & Name */}
                                            <div className='flex items-center gap-4 mb-6'>
                                                <div className='w-12 h-12 rounded-full bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] flex items-center justify-center text-[color:var(--text-primary)] font-bold group-hover:bg-[var(--primary)] group-hover:text-white transition-colors'>
                                                    {(alumni.profile?.fullName || alumni.username).charAt(0).toUpperCase()}
                                                </div>
                                                <div className='min-w-0'>
                                                    <h3 className='font-bold text-[color:var(--text-primary)] text-base line-clamp-1'>
                                                        {alumni.profile?.fullName || alumni.username}
                                                    </h3>
                                                    <p className='text-xs font-semibold text-[color:var(--text-tertiary)] uppercase tracking-wider'>
                                                        Lulus {alumni.profile?.graduationYear || '-'}
                                                    </p>
                                                </div>
                                                {alumni.isMentor && (
                                                    <div className='ml-auto' title="Tersedia sebagai Mentor">
                                                        <div className='w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center border border-amber-100 dark:border-amber-500/20'>
                                                            <FaCrown className='text-amber-500 text-sm' />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Minimal Data List */}
                                            <div className='space-y-4 mb-8'>
                                                <div className='flex items-start gap-4'>
                                                    <FaUniversity className='text-gray-400 mt-1 shrink-0' />
                                                    <div>
                                                        <p className='text-sm font-bold text-[color:var(--text-primary)]'>
                                                            {alumni.university?.name || '-'}
                                                        </p>
                                                        {alumni.university?.type && (
                                                            <p className='text-[10px] font-bold text-[color:var(--text-tertiary)] uppercase mt-0.5 tracking-tight'>
                                                                {getUniversityTypeLabel(alumni.university.type)} • {alumni.university.major || '-'}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {alumni.job?.position && (
                                                    <div className='flex items-start gap-4'>
                                                        <FaBriefcase className='text-gray-400 mt-1 shrink-0' />
                                                        <div>
                                                            <p className='text-sm font-bold text-[color:var(--text-primary)]'>
                                                                {alumni.job.position}
                                                            </p>
                                                            <p className='text-[10px] font-bold text-[color:var(--text-tertiary)] uppercase mt-0.5 tracking-tight'>
                                                                {alumni.job.institution || 'Instansi Terdaftar'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className='flex items-center gap-3 border-t border-[color:var(--border-color)] pt-5'>
                                                <div className='flex gap-2'>
                                                    {alumni.isMentor && alumni.socialMedia?.linkedin && (
                                                        <a href={alumni.socialMedia.linkedin} target='_blank' rel='noopener noreferrer' className='w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all border border-[color:var(--border-color)]'>
                                                            <FaLinkedin className='text-base' />
                                                        </a>
                                                    )}
                                                    {alumni.isMentor && alumni.socialMedia?.instagram && (
                                                        <a href={alumni.socialMedia.instagram} target='_blank' rel='noopener noreferrer' className='w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 text-gray-500 hover:bg-pink-50 hover:text-pink-600 transition-all border border-[color:var(--border-color)]'>
                                                            <FaInstagram className='text-base' />
                                                        </a>
                                                    )}
                                                </div>

                                                {alumni.isMentor ? (
                                                    <a
                                                        href={alumni.socialMedia?.linkedin || `mailto:${alumni.socialMedia?.email}`}
                                                        target='_blank'
                                                        rel='noopener noreferrer'
                                                        className='flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-600 text-white text-xs font-bold rounded-2xl hover:bg-amber-700 shadow-sm transition-all'
                                                    >
                                                        <FaComments /> Tanya Mentor
                                                    </a>
                                                ) : (
                                                    <div className='flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50/50 dark:bg-gray-800/50 text-[color:var(--text-tertiary)] text-[10px] font-bold rounded-2xl border border-dashed border-[color:var(--border-color)]'>
                                                        Kontak Terkunci
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='py-24 text-center p-8 bg-[color:var(--bg-card)] rounded-3xl border border-[color:var(--border-color)]'>
                                    <FaUsers className='text-4xl text-[color:var(--text-tertiary)] mx-auto mb-4 opacity-30' />
                                    <h3 className='text-lg font-bold text-[color:var(--text-primary)]'>Data Belum Tersedia</h3>
                                    <p className='text-[color:var(--text-secondary)]'>Belum ada alumni yang terdaftar untuk filter ini.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollegePlan;
