import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaUsers, FaBriefcase, FaUniversity, FaQuoteLeft } from 'react-icons/fa';
import SmartLoader from '@/components/SmartLoader';

const LandingPage = () => {
    const [stats, setStats] = useState<any>(null);
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, testimonialsRes] = await Promise.all([
                    axios.get('/api/public/stats'),
                    axios.get('/api/public/testimonials')
                ]);
                setStats(statsRes.data);
                setTestimonials(testimonialsRes.data);
            } catch (error) {
                console.error('Error fetching landing page data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (loading) return <SmartLoader />;

    return (
        <div className="bg-[color:var(--bg-primary)] min-h-screen font-sans selection:bg-[var(--primary)] selection:text-white">
            {/* Navigation Overlay */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[color:var(--bg-card)]/80 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-4'}`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
                    <div className="flex items-center gap-2 md:gap-3">
                        <img src="/logo.png" alt="Smanta Logo" className="h-8 w-8 md:h-12 md:w-12" />
                        <div className="hidden xs:block">
                            <div className="text-sm md:text-lg font-bold text-[color:var(--text-primary)] leading-none tracking-tight">TRACER STUDY</div>
                            <p className="text-[8px] md:text-[10px] text-[color:var(--text-secondary)] uppercase font-semibold">SMAN 1 Tawangsari</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 scale-90 md:scale-100 origin-right">
                        <Link to="/login" className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-[color:var(--text-secondary)] hover:text-[var(--primary)] transition-colors px-2 md:px-4 py-2">
                            <span className="sm:inline">Login</span>
                        </Link>
                        <Link to="/register" className="flex items-center gap-1.5 text-xs md:text-sm font-bold bg-gradient-to-r from-[var(--primary)] to-blue-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 transition-all">
                            <span className="whitespace-nowrap">Kontribusi Sekarang</span>
                        </Link>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="relative pt-24 pb-16 md:pt-48 md:pb-32 overflow-hidden px-4 sm:px-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-blue-500/10 rounded-full blur-[80px] md:blur-[120px]"></div>
                    <div className="absolute bottom-[-5%] left-[-10%] w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-indigo-500/10 rounded-full blur-[60px] md:blur-[100px]"></div>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="space-y-6 md:space-y-8 text-center lg:text-left"
                    >
                        <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border border-blue-500/20 mx-auto lg:mx-0">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Tracker Study SMANTA
                        </div>
                        <div className="text-3xl sm:text-4xl md:text-6xl font-black text-[color:var(--text-primary)] leading-[1.2] md:leading-[1.1] tracking-tight">
                            Membangun <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-blue-500">Database dan Kolaborasi</span> Keluarga Besar SMANTA
                        </div>
                        <p className="text-sm md:text-lg text-[color:var(--text-secondary)] leading-relaxed max-w-2xl mx-auto lg:mx-0 px-4 sm:px-0">
                            Bukan sekedar database alumni, tapi wadah kolaborasi antara alumni, siswa, dan sekolah untuk melacak perkembangan karir serta memberikan kontribusi bagi perkembangan SMAN 1 Tawangsari.
                        </p>
                        <div className="flex flex-col-2 sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start px-4 sm:px-0">
                            <Link to="/register" className="text-xs md:text-lg flex items-center justify-center bg-[var(--primary)] text-white px-6 py-3.5 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg shadow-xl shadow-blue-500/40 hover:bg-blue-600 hover:shadow-blue-500/60 hover:-translate-y-1 transition-all">
                                Mulai Kontribusi
                            </Link>
                            <a href="#stats" className="text-xs md:text-lg flex items-center justify-center bg-[color:var(--bg-card)] text-[color:var(--text-primary)] px-6 py-3.5 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg border border-[color:var(--border-color)] hover:bg-[color:var(--bg-tertiary)] transition-all">
                                Lihat Statistik
                            </a>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative pt-10 lg:pt-0"
                    >
                        <div className="relative z-10 w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border-2 md:border-4 border-white/10 group bg-[color:var(--bg-tertiary)]">
                            <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-all duration-300"></div>
                            <img src="/smanta.webp" alt="Alumni SMANTA" className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-all duration-700 min-h-[250px] md:min-h-[400px]" />
                            <div className="absolute bottom-3 left-3 right-3 md:bottom-6 md:left-6 md:right-6 p-4 md:p-6 rounded-xl md:rounded-2xl bg-[color:var(--bg-card)]/80 backdrop-blur-md border border-white/10 text-white">
                                <p className="text-xs md:text-sm font-medium italic opacity-90">"SMANTA Juara! SMA Kita Tercinta"</p>
                                <div className="flex items-center gap-3 md:gap-4 mt-2">
                                    <div className="flex -space-x-2 md:-space-x-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-indigo-400 bg-gray-200 overflow-hidden">
                                                <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="avatar" />
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-[10px] md:text-xs font-bold text-blue-200">+{stats?.totalAlumni || 0} Alumni Tertaut</span>
                                </div>
                            </div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -top-6 -left-6 md:-top-10 md:-left-10 w-24 h-24 md:w-32 md:h-32 bg-blue-500/20 rounded-full -z-10 blur-xl md:blur-2xl"></div>
                        <div className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 w-32 h-32 md:w-48 md:h-48 bg-indigo-500/20 rounded-full -z-10 blur-2xl md:blur-3xl"></div>
                    </motion.div>
                </div>
            </section>

            {/* Mission/Philosophy Section */}
            <motion.section
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8 }}
                className="py-20 px-4 sm:px-6 relative overflow-hidden"
            >
                <div className="max-w-5xl mx-auto">
                    <div className="bg-gradient-to-br from-[color:var(--bg-card)] to-[color:var(--bg-secondary)] p-8 md:p-16 rounded-[40px] border border-[color:var(--border-color)] shadow-2xl relative">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <FaUniversity size={120} />
                        </div>

                        <div className="relative z-10 space-y-10">
                            <div className="space-y-4">
                                <motion.h3
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="text-xl md:text-3xl font-black text-[color:var(--text-primary)] leading-tight"
                                >
                                    Menavigasi Persimpangan Jalan <br className="hidden md:block" />
                                    <span className="text-[var(--primary)]">Masa Depan Alumni SMANTA</span>
                                </motion.h3>
                                <div className="w-16 h-1 bg-[var(--primary)] rounded-full"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                                <div className="space-y-4">
                                    <p className="text-sm md:text-lg text-[color:var(--text-secondary)] leading-relaxed italic border-l-4 border-blue-500/30 pl-6">
                                        "Masa transisi setelah SMA adalah persimpangan jalan yang menantang. Tanpa data yang terintegrasi, siswa seringkali melangkah tanpa arah, sementara hubungan berharga dengan alumni terputus begitu saja."
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    <p className="text-sm md:text-lg font-medium text-[color:var(--text-primary)] leading-relaxed">
                                        Tracer Study SMANTA hadir untuk <span className="text-blue-400 font-bold">mengubah data menjadi peta jalan</span>, memastikan setiap jejak alumni menjadi inspirasi dan panduan nyata bagi adik-adik yang akan menyusul ke jenjang berikutnya.
                                    </p>
                                    <div className="flex items-center gap-4 pt-2">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-10 h-10 rounded-full border-2 border-[color:var(--bg-card)] bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                                                    {i === 1 ? 'Data' : i === 2 ? 'Peta' : 'Arah'}
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-[color:var(--text-tertiary)] uppercase tracking-widest">Inspirasi & Panduan</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Features Section */}
            <section className="py-20 px-4 sm:px-6 bg-[color:var(--bg-secondary)]/10">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16 space-y-4"
                    >
                        <h3 className="text-2xl md:text-4xl font-black text-[color:var(--text-primary)]">Fitur Siswa dan Alumni</h3>
                        <div className="w-16 md:w-20 h-1.5 bg-gradient-to-r from-[var(--primary)] to-blue-500 mx-auto rounded-full"></div>
                        <p className="text-sm md:text-base text-[color:var(--text-secondary)] max-w-2xl mx-auto">Dirancang untuk memudahkan interaksi dan memberikan manfaat nyata bagi seluruh warga SMANTA.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        {/* Student Features */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="bg-[color:var(--bg-card)] p-6 md:p-10 rounded-[30px] md:rounded-[40px] border border-[color:var(--border-color)] shadow-xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full group-hover:scale-110 transition-transform"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
                                        <FaGraduationCap size={24} className="md:w-[28px] md:h-[28px]" />
                                    </div>
                                    <h4 className="text-xl md:text-2xl font-black text-[color:var(--text-primary)]">Untuk Siswa Aktif</h4>
                                </div>
                                <ul className="space-y-4 md:space-y-5">
                                    {[
                                        { title: 'Eksplorasi Kampus', desc: 'Lihat data persebaran alumni di berbagai universitas favorit.' },
                                        { title: 'Daftar Jurusan', desc: 'Identifikasi jurusan paling populer dan diminati alumni SMANTA.' },
                                        { title: 'Rencana Kuliah', desc: 'Kelola dan simpan target studi lanjutan Anda.' },
                                        { title: 'Terhubung Dengan Alumni', desc: 'Konsultasi langsung dengan alumni yang berpengalaman lewat media sosial' },
                                        { title: 'Berita Terkini', desc: 'Dapatkan informasi terbaru seputar kampus dan beasiswa.' }
                                    ].map((f, i) => (
                                        <li key={i} className="flex gap-4 group/item">
                                            <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0 group-hover/item:scale-125 transition-transform"></div>
                                            <div>
                                                <p className="text-sm md:text-base font-bold text-[color:var(--text-primary)] mb-0.5">{f.title}</p>
                                                <p className="text-[11px] md:text-sm text-[color:var(--text-tertiary)]">{f.desc}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>

                        {/* Alumni Features */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="bg-[color:var(--bg-card)] p-6 md:p-10 rounded-[30px] md:rounded-[40px] border border-[color:var(--border-color)] shadow-xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full group-hover:scale-110 transition-transform"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 shadow-inner">
                                        <FaUsers size={24} className="md:w-[28px] md:h-[28px]" />
                                    </div>
                                    <h4 className="text-xl md:text-2xl font-black text-[color:var(--text-primary)]">Untuk Alumni</h4>
                                </div>
                                <ul className="space-y-4 md:space-y-5">
                                    {[
                                        { title: 'Tracer Survey', desc: 'Laporkan perkembangan karir Anda untuk data sekolah.' },
                                        { title: 'Rekan Seangkatan', desc: 'Temukan dan terhubung kembali dengan teman lama.' },
                                        { title: 'Manajemen Profil', desc: 'Bangun personal branding dan portofolio profesional.' },
                                        { title: 'Badge Prestasi', desc: 'Dapatkan lencana penghargaan atas kontribusi Anda.' },
                                        { title: 'Program Mentorship', desc: 'Berikan bimbingan kepada adik-adik kelas SMANTA.' }
                                    ].map((f, i) => (
                                        <li key={i} className="flex gap-4 group/item">
                                            <div className="mt-1.5 w-2 h-2 rounded-full bg-indigo-500 shrink-0 group-hover/item:scale-125 transition-transform"></div>
                                            <div>
                                                <p className="text-sm md:text-base font-bold text-[color:var(--text-primary)] mb-0.5">{f.title}</p>
                                                <p className="text-[11px] md:text-sm text-[color:var(--text-tertiary)]">{f.desc}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Dashboard Section */}
            <section id="stats" className="py-20 px-4 sm:px-6 relative bg-[color:var(--bg-secondary)]/20">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16 space-y-4"
                    >
                        <h3 className="text-2xl md:text-4xl font-black text-[color:var(--text-primary)]">Statistik Tracer Study</h3>
                        <div className="w-16 md:w-20 h-1.5 bg-gradient-to-r from-[var(--primary)] to-blue-500 mx-auto rounded-full"></div>
                        <p className="text-sm md:text-base text-[color:var(--text-secondary)] max-w-2xl mx-auto">Pantau pencapaian alumni kita di berbagai sektor dan perguruan tinggi favorit.</p>
                    </motion.div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-12">
                        {/* Stats Cards */}
                        {[
                            { icon: FaUsers, label: 'Total Alumni', val: stats?.totalAlumni, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                            { icon: FaBriefcase, label: 'Dunia Kerja', val: stats?.workingAlumni, color: 'text-green-500', bg: 'bg-green-500/10' },
                            { icon: FaGraduationCap, label: 'Pendidikan Lanjut', val: stats?.studyingAlumni, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                            { icon: FaUniversity, label: 'Kampus Terhubung', val: stats?.topUniversities?.length, color: 'text-amber-500', bg: 'bg-amber-500/10' }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-[color:var(--bg-card)] p-5 md:p-8 rounded-2xl md:rounded-3xl border border-[color:var(--border-color)] shadow-xl shadow-black/5 hover:-translate-y-2 transition-transform duration-300"
                            >
                                <div className={`w-10 h-10 md:w-14 md:h-14 ${item.bg} rounded-lg md:rounded-2xl flex items-center justify-center ${item.color} mb-4 md:mb-6`}>
                                    <item.icon size={20} className="md:w-[28px] md:h-[28px]" />
                                </div>
                                <h4 className="text-2xl md:text-5xl font-black text-[color:var(--text-primary)] mb-1 md:mb-2 tracking-tight">{item.val || 0}</h4>
                                <p className="font-bold text-[color:var(--text-secondary)] uppercase text-[9px] md:text-xs tracking-widest">{item.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8"
                    >
                        {/* Top Universities Card */}
                        <div className="bg-[color:var(--bg-card)] p-6 md:p-8 rounded-2xl md:rounded-3xl border border-[color:var(--border-color)] shadow-xl shadow-black/5">
                            <div className="flex items-center justify-between mb-6 md:mb-8">
                                <h5 className="text-lg md:text-xl font-black text-[color:var(--text-primary)]">Top Perguruan Tinggi</h5>
                                <div className="p-1.5 md:p-2 bg-[color:var(--bg-tertiary)] rounded-full text-[var(--primary)]">
                                    <FaUniversity className="w-4 h-4 md:w-5 md:h-5" />
                                </div>
                            </div>
                            <div className="space-y-4 md:space-y-6">
                                {stats?.topUniversities?.map((uni: any, idx: number) => (
                                    <div key={idx} className="group">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-xs md:text-sm font-bold text-[color:var(--text-primary)] group-hover:text-[var(--primary)] transition-colors truncate max-w-[70%]">{uni._id}</span>
                                            <span className="text-[10px] md:text-xs font-bold text-[color:var(--text-tertiary)] shrink-0">{uni.count} Alumni</span>
                                        </div>
                                        <div className="w-full bg-[color:var(--bg-tertiary)] h-1.5 md:h-2.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-[var(--primary)] to-blue-400 h-full rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: stats.totalAlumni > 0 ? `${(uni.count / stats.totalAlumni) * 100 * 2}%` : '0%' }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Majors Card */}
                        <div className="bg-[color:var(--bg-card)] p-6 md:p-8 rounded-2xl md:rounded-3xl border border-[color:var(--border-color)] shadow-xl shadow-black/5">
                            <div className="flex items-center justify-between mb-6 md:mb-8">
                                <h5 className="text-lg md:text-xl font-black text-[color:var(--text-primary)]">Jurusan Populer</h5>
                                <div className="p-1.5 md:p-2 bg-[color:var(--bg-tertiary)] rounded-full text-indigo-500">
                                    <FaGraduationCap className="w-4 h-4 md:w-5 md:h-5" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                {stats?.topMajors?.map((major: any, idx: number) => (
                                    <div key={idx} className="p-3 md:p-4 bg-[color:var(--bg-tertiary)] rounded-xl md:rounded-2xl border border-[color:var(--border-color)] flex items-center justify-between group hover:border-[var(--primary)] transition-all">
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[8px] md:text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Rank #{idx + 1}</span>
                                            <span className="text-xs md:text-sm font-bold text-[color:var(--text-primary)] truncate max-w-full">{major._id}</span>
                                        </div>
                                        <div className="ml-2">
                                            <span className="text-lg md:text-xl font-black text-[color:var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors">{major.count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Testimonials section */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="py-20 px-4 sm:px-6"
            >
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16 space-y-4"
                    >
                        <h3 className="text-2xl md:text-4xl font-black text-[color:var(--text-primary)]">Apa Kata Alumni & Siswa?</h3>
                        <div className="w-16 md:w-20 h-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto rounded-full"></div>
                        <p className="text-sm md:text-base text-[color:var(--text-secondary)]">Suara komunitas tentang peran Tracer Study bagi kemajuan SMANTA.</p>
                    </motion.div>

                    <div className="flex overflow-x-auto pb-12 gap-6 md:gap-8 snap-x no-scrollbar">
                        {testimonials.length > 0 ? testimonials.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="min-w-[280px] sm:min-w-[320px] md:min-w-[400px] snap-center bg-[color:var(--bg-card)] p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-[color:var(--border-color)] shadow-xl relative overflow-hidden flex flex-col"
                            >
                                <FaQuoteLeft className="text-3xl md:text-4xl text-blue-50/20 mb-4 md:mb-6" />
                                <p className="text-sm md:text-base text-[color:var(--text-primary)] italic leading-relaxed mb-6 md:mb-8 flex-grow">
                                    "{item.kritik || item.saran || 'Tracer Study ini sangat membantu kami untuk tetap terhubung dan berbagi informasi.'}"
                                </p>
                                <div className="flex items-center gap-3 md:gap-4 mt-auto">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
                                        {item.user?.profile?.fullName?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <h6 className="text-sm md:text-base font-bold text-[color:var(--text-primary)]">{item.user?.profile?.fullName || 'Hidden User'}</h6>
                                        <p className="text-[10px] md:text-xs font-bold text-indigo-500 uppercase tracking-widest">{item.user?.role || 'Alumni'}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="w-full text-center py-16 md:py-20 bg-[color:var(--bg-tertiary)] rounded-2xl border-2 border-dashed border-[color:var(--border-color)]">
                                <p className="text-xs md:text-sm text-[color:var(--text-tertiary)] italic">Belum ada testimoni terbaru.</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.section>

            {/* CTA Section */}
            <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="py-20 px-4 sm:px-6 bg-[var(--primary)] relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-[400px] md:w-[600px] h-full bg-blue-400 skew-x-[-20deg] translate-x-1/2 opacity-20 hidden md:block"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8 md:space-y-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-2xl md:text-4xl font-black text-white leading-tight"
                    >
                        Siap Menjadi Bagian Dari Perubahan Besar?
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-base md:text-xl text-blue-50/80 max-w-2xl mx-auto px-4 md:px-0"
                    >
                        Mari berkontribusi untuk SMANTA, almamater kita tercinta. Daftar dan berikan kontribusi Anda sekarang juga, hanya butuh waktu 2 menit!
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col-2 sm:flex-row gap-4 md:gap-6 justify-center px-6 md:px-0"
                    >
                        <Link to="/register" className="text-xs md:text-sm bg-white text-[var(--primary)] px-3 py-3 md:px-10 md:py-5 rounded-xl md:rounded-3xl font-black text-lg md:text-xl shadow-2xl hover:scale-105 transition-all">
                            Kontribusi Sekarang
                        </Link>
                        <Link to="/login" className="text-xs md:text-sm bg-blue-700/30 backdrop-blur-md text-white border-2 border-white/30 px-3 py-3 md:px-10 md:py-5 rounded-xl md:rounded-3xl font-black text-lg md:text-xl hover:bg-blue-700/50 transition-all">
                            Masuk Kembali
                        </Link>
                    </motion.div>
                </div>
            </motion.section>

            {/* Simple Footer */}
            <footer className="py-10 md:py-12 border-t border-[color:var(--border-color)] px-4 sm:px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="h-8 w-8" />
                        <span className="font-black text-sm md:text-base text-[color:var(--text-primary)]">TRACER STUDY SMANTA</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
