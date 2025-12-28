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
    FaEnvelope,
    FaFilter,
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
    const [filteredAlumni, setFilteredAlumni] = useState<AlumniData[]>([]);
    const [loadingAlumni, setLoadingAlumni] = useState(false);

    useEffect(() => {
        fetchOptions();
    }, []);

    useEffect(() => {
        if (selectedUniversity || selectedMajor) {
            fetchAlumni();
        } else {
            setFilteredAlumni([]);
        }
    }, [selectedUniversity, selectedMajor]);

    const fetchOptions = async () => {
        try {
            setLoading(true);
            const [universitiesRes, majorsRes] = await Promise.all([
                axios.get('/api/alumni/universities'),
                axios.get('/api/alumni/majors'),
            ]);

            setUniversities(universitiesRes.data);
            setMajors(majorsRes.data);
        } catch (error) {
            console.error('Error fetching options:', error);
            Toast('Gagal mengambil data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchAlumni = async () => {
        try {
            setLoadingAlumni(true);
            const params: any = {};
            if (selectedUniversity) params.university = selectedUniversity;
            if (selectedMajor) params.major = selectedMajor;

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

    const getUniversityTypeColor = (type?: string) => {
        switch (type) {
            case 'negeri': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'swasta': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'kedinasan': return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
            default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className='p-4 md:p-8 animate-fade-in'>
            <div className='mb-8'>
                <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-2'>
                    Rencana Kuliah
                </h1>
                <p className='text-[color:var(--text-secondary)]'>
                    Temukan dan rencanakan masa depan Anda berdasarkan jejak alumni
                </p>
            </div>

            <div className='flex flex-col lg:flex-row gap-8'>
                {/* Left Side: Filter Form */}
                <div className='w-full lg:w-1/3 lg:sticky lg:top-8 h-fit'>
                    <div className='bg-[color:var(--bg-card)] rounded-2xl border border-[color:var(--border-color)] overflow-hidden shadow-sm'>
                        <div className='p-6 border-b border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)]/30'>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]'>
                                    <FaFilter className='text-lg' />
                                </div>
                                <h2 className='text-lg font-bold text-[color:var(--text-primary)] !mb-0'>
                                    Filter Rencana
                                </h2>
                            </div>
                        </div>

                        <div className='p-6 space-y-6'>
                            {/* University Field */}
                            <div className='space-y-2'>
                                <label className='text-sm font-semibold text-[color:var(--text-secondary)] flex items-center gap-2'>
                                    <FaUniversity className='text-xs' /> Universitas
                                </label>
                                <select
                                    className='w-full px-4 py-3 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] text-[color:var(--text-primary)] focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all cursor-pointer'
                                    value={selectedUniversity}
                                    onChange={(e) => {
                                        setSelectedUniversity(e.target.value);
                                        // If we want them to work together, don't clear the other one
                                        // setSelectedMajor(''); 
                                    }}
                                >
                                    <option value="">Pilih Universitas</option>
                                    {universities.map((u, i) => (
                                        <option key={i} value={u.name}>
                                            {u.name} ({u.count} Alumni)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Major Field */}
                            <div className='space-y-2'>
                                <label className='text-sm font-semibold text-[color:var(--text-secondary)] flex items-center gap-2'>
                                    <FaGraduationCap className='text-xs' /> Jurusan
                                </label>
                                <select
                                    className='w-full px-4 py-3 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] text-[color:var(--text-primary)] focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all cursor-pointer'
                                    value={selectedMajor}
                                    onChange={(e) => {
                                        setSelectedMajor(e.target.value);
                                        // setSelectedUniversity('');
                                    }}
                                >
                                    <option value="">Pilih Jurusan</option>
                                    {majors.map((m, i) => (
                                        <option key={i} value={m.name}>
                                            {m.name} ({m.count} Alumni)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {(selectedUniversity || selectedMajor) && (
                                <button
                                    onClick={() => {
                                        setSelectedUniversity('');
                                        setSelectedMajor('');
                                    }}
                                    className='w-full py-3 text-sm font-bold text-red-500 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-all'
                                >
                                    Reset Filter
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Results */}
                <div className='flex-1 lg:max-h-[calc(100vh-180px)] overflow-y-auto pr-2 custom-scrollbar'>
                    {!selectedUniversity && !selectedMajor ? (
                        <div className='bg-[color:var(--bg-card)] rounded-2xl border border-[color:var(--border-color)] p-12 text-center animate-fade-in'>
                            <div className='w-20 h-20 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--primary)]'>
                                <FaSearch className='text-3xl' />
                            </div>
                            <h3 className='text-xl font-bold text-[color:var(--text-primary)] mb-2'>
                                Mulai Menjelajah
                            </h3>
                            <p className='text-[color:var(--text-secondary)] max-w-md mx-auto'>
                                Pilih universitas atau jurusan di sebelah kiri untuk melihat persebaran alumni dan peluang masa depan Anda.
                            </p>
                        </div>
                    ) : (
                        <div className='space-y-6 animate-fade-in'>
                            {/* Summary Card */}
                            <div className='bg-gradient-to-r from-[var(--primary)] to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-[var(--primary)]/20'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <h2 className='text-xl font-bold mb-1'>Hasil Pencarian</h2>
                                        <p className='text-white/80 text-sm'>
                                            Menampilkan {filteredAlumni.length} alumni yang sesuai kriteria
                                        </p>
                                    </div>
                                    <div className='hidden md:block p-3 bg-white/20 rounded-xl'>
                                        <FaUsers className='text-2xl' />
                                    </div>
                                </div>
                            </div>

                            {loadingAlumni ? (
                                <div className='py-20 flex flex-col items-center justify-center text-[color:var(--text-secondary)]'>
                                    <div className='h-10 w-10 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin mb-4' />
                                    <p>Mencari data alumni...</p>
                                </div>
                            ) : filteredAlumni.length > 0 ? (
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pb-8'>
                                    {filteredAlumni.map((alumni) => (
                                        <div
                                            key={alumni._id}
                                            className='bg-[color:var(--bg-card)] p-5 rounded-2xl border border-[color:var(--border-color)] hover:shadow-md hover:border-[var(--primary)]/40 transition-all group'
                                        >
                                            <div className='flex items-start gap-4 mb-4'>
                                                <div className='w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-purple-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform'>
                                                    {(alumni.profile?.fullName || alumni.username).charAt(0).toUpperCase()}
                                                </div>
                                                <div className='flex-1 min-w-0'>
                                                    <h3 className='font-bold text-[color:var(--text-primary)] text-lg line-clamp-1'>
                                                        {alumni.profile?.fullName || alumni.username}
                                                    </h3>
                                                    {alumni.profile?.graduationYear && (
                                                        <div className='inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] rounded-full uppercase tracking-wider'>
                                                            Lulus {alumni.profile.graduationYear}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className='space-y-3 mb-5'>
                                                <div className='flex items-start gap-3 text-sm'>
                                                    <div className='p-1.5 bg-blue-500/10 rounded text-blue-500 mt-0.5'>
                                                        <FaUniversity className='text-xs' />
                                                    </div>
                                                    <div className='flex-1 min-w-0'>
                                                        <p className='text-[color:var(--text-primary)] font-semibold line-clamp-1'>
                                                            {alumni.university?.name || 'Universitas Belum Diisi'}
                                                        </p>
                                                        {alumni.university?.type && (
                                                            <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-bold border mt-1 ${getUniversityTypeColor(alumni.university.type)}`}>
                                                                {getUniversityTypeLabel(alumni.university.type)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className='flex items-start gap-3 text-sm'>
                                                    <div className='p-1.5 bg-purple-500/10 rounded text-purple-500 mt-0.5'>
                                                        <FaGraduationCap className='text-xs' />
                                                    </div>
                                                    <p className='text-[color:var(--text-primary)] font-medium line-clamp-1'>
                                                        {alumni.university?.major || 'Jurusan Belum Diisi'}
                                                    </p>
                                                </div>

                                                {alumni.job?.position && (
                                                    <div className='flex items-start gap-3 text-sm'>
                                                        <div className='p-1.5 bg-green-500/10 rounded text-green-500 mt-0.5'>
                                                            <FaBriefcase className='text-xs' />
                                                        </div>
                                                        <div className='flex-1 min-w-0'>
                                                            <p className='text-[color:var(--text-primary)] font-medium line-clamp-1'>
                                                                {alumni.job.position}
                                                            </p>
                                                            {alumni.job.institution && (
                                                                <p className='text-xs text-[color:var(--text-tertiary)] line-clamp-1'>
                                                                    {alumni.job.institution}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Social Bar */}
                                            <div className='flex items-center gap-2 pt-4 border-t border-[color:var(--border-color)]'>
                                                {alumni.socialMedia?.email && (
                                                    <a href={`mailto:${alumni.socialMedia.email}`} className='p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all'>
                                                        <FaEnvelope className='text-sm' />
                                                    </a>
                                                )}
                                                {alumni.socialMedia?.linkedin && (
                                                    <a href={alumni.socialMedia.linkedin} target='_blank' rel='noopener noreferrer' className='p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all'>
                                                        <FaLinkedin className='text-sm' />
                                                    </a>
                                                )}
                                                {alumni.socialMedia?.instagram && (
                                                    <a href={alumni.socialMedia.instagram} target='_blank' rel='noopener noreferrer' className='p-2 rounded-xl bg-pink-500/10 text-pink-500 hover:bg-pink-500 hover:text-white transition-all'>
                                                        <FaInstagram className='text-sm' />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='bg-[color:var(--bg-card)] rounded-2xl border border-[color:var(--border-color)] p-20 text-center animate-fade-in'>
                                    <FaUsers className='text-5xl text-[color:var(--text-tertiary)] mx-auto mb-4' />
                                    <h3 className='text-lg font-bold text-[color:var(--text-primary)]'>Data Belum Tersedia</h3>
                                    <p className='text-[color:var(--text-secondary)]'>Tidak ditemukan alumni untuk kombinasi ini.</p>
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
