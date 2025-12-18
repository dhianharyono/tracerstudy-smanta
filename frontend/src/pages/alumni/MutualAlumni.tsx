import { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaUserGraduate, FaUniversity, FaBuilding, FaUserCircle } from 'react-icons/fa';

interface AlumniData {
    _id: string;
    profile?: {
        fullName?: string;
        graduationYear?: number;
        gender?: 'male' | 'female';
    };
    university?: {
        name?: string;
        major?: string;
    };
    job?: {
        position?: string;
        institution?: string;
    };
}

const MutualAlumni = () => {
    const [alumni, setAlumni] = useState<AlumniData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMutualAlumni = async () => {
            try {
                const response = await axios.get('/api/alumni/mutual-alumni');
                setAlumni(response.data);
            } catch (error) {
                console.error('Error fetching mutual alumni:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMutualAlumni();
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className='p-4 sm:p-6 lg:p-8 min-h-screen page-fade-in'>
            <div className='mb-8 text-center md:text-left'>
                <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
                    Mutual Alumni
                </h1>
                <p className='text-[color:var(--text-secondary)]'>
                    Rekan alumni yang lulus pada tahun yang sama dengan Anda
                </p>
            </div>

            {alumni.length === 0 ? (
                <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-[color:var(--bg-card)] p-12 text-center dark:border-gray-700'>
                    <div className='mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800'>
                        <FaUserGraduate className='text-4xl text-gray-400' />
                    </div>
                    <h3 className='text-lg font-medium text-[color:var(--text-primary)]'>
                        Belum ada data
                    </h3>
                    <p className='text-gray-500'>
                        Tidak ditemukan rekan alumni dari tahun kelulusan yang sama.
                    </p>
                </div>
            ) : (
                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                    {alumni.map((person) => (
                        <div
                            key={person._id}
                            className='group relative overflow-hidden rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'
                        >
                            <div className='mb-4 flex items-center gap-4'>
                                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-md'>
                                    <FaUserCircle className='text-3xl' />
                                </div>
                                <div>
                                    <h3 className='font-bold text-[color:var(--text-primary)] group-hover:text-[var(--primary)] transition-colors line-clamp-1'>
                                        {person.profile?.fullName || 'Anonymous'}
                                    </h3>
                                    <p className='text-xs text-[color:var(--text-tertiary)]'>
                                        Lulus Tahun {person.profile?.graduationYear}
                                    </p>
                                </div>
                            </div>

                            <div className='space-y-3'>
                                {person.university?.name && (
                                    <div className='flex items-start gap-3'>
                                        <FaUniversity className='mt-1 shrink-0 text-blue-500' />
                                        <div>
                                            <p className='text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider'>Pendidikan</p>
                                            <p className='text-sm text-[color:var(--text-primary)] font-medium leading-tight'>
                                                {person.university.name}
                                            </p>
                                            <p className='text-[10px] text-[color:var(--text-tertiary)]'>
                                                {person.university.major}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {person.job?.institution && (
                                    <div className='flex items-start gap-3'>
                                        <FaBuilding className='mt-1 shrink-0 text-green-500' />
                                        <div>
                                            <p className='text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider'>Pekerjaan</p>
                                            <p className='text-sm text-[color:var(--text-primary)] font-medium leading-tight'>
                                                {person.job.institution}
                                            </p>
                                            <p className='text-[10px] text-[color:var(--text-tertiary)]'>
                                                {person.job.position}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {!person.university?.name && !person.job?.institution && (
                                    <div className='py-2 text-center'>
                                        <p className='text-xs italic text-[color:var(--text-tertiary)]'>Belum melengkapi data kuesioner</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MutualAlumni;
