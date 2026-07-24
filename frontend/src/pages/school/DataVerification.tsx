import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import Toast from '@/components/toast';
import {
  FaDownload,
  FaUpload,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserTimes,
  FaInfoCircle,
  FaWhatsapp,
  FaCopy,
  FaSync,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import Card from '@/components/common/Card';
import PageHeader from '@/components/common/PageHeader';

const SchoolDataVerification = () => {
  const { user } = useAuth();
  const [verifying, setVerifying] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/school/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await axios.get('/api/school/alumni/template', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'template_verifikasi_alumni.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      Toast('Gagal mengunduh template', 'error');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Toast('Pilih file terlebih dahulu', 'error');
      return;
    }

    setVerifying(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(
        '/api/school/alumni/verify-bulk',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      setResults(response.data);
      Toast('Sinkronisasi selesai!', 'success');
      fetchStats();
    } catch (error: any) {
      Toast(error.response?.data?.message || 'Gagal memproses file', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const copyInvitation = (name: string) => {
    const message = `Halo ${name}, kami dari SMA N 1 Tawangsari sedang melakukan pemutakhiran data Tracer Study. Silakan bergabung dan isi kuesioner di: ${window.location.origin}/register . Terima kasih!`;
    navigator.clipboard.writeText(message);
    Toast('Pesan undangan disalin!', 'success');
  };

  const isBK = user?.schoolRole === 'bk';

  const [alumni, setAlumni] = useState<any[]>([]);
  const [alumniLoading, setAlumniLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAlumniList = async () => {
    setAlumniLoading(true);
    try {
      const response = await axios.get('/api/school/alumni', {
        params: {
          search: searchQuery,
          page: page,
          limit: 10,
        },
      });
      setAlumni(response.data.alumni);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Error fetching alumni list:', error);
    } finally {
      setAlumniLoading(false);
    }
  };

  useEffect(() => {
    if (!isBK) {
      fetchAlumniList();
    }
  }, [page, searchQuery, isBK]);


  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <PageHeader
        title='Verifikasi Data Alumni'
        description='Sinkronisasi data sekolah dengan pengisian alumni'
      />

      {/* Stats Summary */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <Card className='border border-[color:var(--border-color)]'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl'>
              <FaCheckCircle className='text-2xl' />
            </div>
            <div>
              <p className='text-sm text-[color:var(--text-secondary)] font-medium'>
                Total Alumni Terdaftar
              </p>
              <h3 className='text-2xl font-bold text-[color:var(--text-primary)]'>
                {stats?.totalAlumni || 0}
              </h3>
            </div>
          </div>
        </Card>
        <Card className='border border-[color:var(--border-color)]'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-emerald-500/10 text-emerald-500 rounded-xl'>
              <FaCheckCircle className='text-2xl' />
            </div>
            <div>
              <p className='text-sm text-[color:var(--text-secondary)] font-medium'>
                Sudah Mengisi Kuesioner
              </p>
              <h3 className='text-2xl font-bold text-[color:var(--text-primary)]'>
                {stats?.completedAlumni || 0}
              </h3>
            </div>
          </div>
        </Card>
        <Card className='border border-[color:var(--border-color)]'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-violet-500/10 text-violet-500 rounded-xl'>
              <FaInfoCircle className='text-2xl' />
            </div>
            <div>
              <p className='text-sm text-[color:var(--text-secondary)] font-medium'>
                Progress Sinkronisasi
              </p>
              <h3 className='text-2xl font-bold text-[color:var(--text-primary)]'>
                {stats?.totalAlumni
                  ? Math.round(
                    ((stats?.verifiedAlumni || 0) / stats.totalAlumni) * 100,
                  )
                  : 0}
                %
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {isBK ? (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Upload Section */}
          <div className='lg:col-span-1 border-r border-[color:var(--border-color)] pr-0 lg:pr-8'>
            <Card className='h-full'>
              <h3 className='text-lg font-bold mb-4 flex items-center gap-2'>
                <FaUpload className='text-[var(--primary)]' />
                Panel Sinkronisasi
              </h3>

              <div className='space-y-6'>
                <div>
                  <p className='text-sm text-[color:var(--text-secondary)] mb-4'>
                    Gunakan template standar kami untuk memastikan data terbaca
                    dengan benar oleh sistem.
                  </p>
                  <button
                    onClick={downloadTemplate}
                    className='w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all font-medium'
                  >
                    <FaDownload /> Unduh Template Excel
                  </button>
                </div>

                <div className='my-6 border-t border-[color:var(--border-color)] pt-6'>
                  <label className='block text-sm font-semibold mb-2'>
                    Pilih File Data BK
                  </label>
                  <input
                    type='file'
                    accept='.xlsx, .xls'
                    onChange={handleFileChange}
                    className='w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary)]/10 file:text-[var(--primary)] hover:file:bg-[var(--primary)]/20'
                  />
                  <p className='text-[10px] text-gray-400 mt-2'>
                    Format: .xlsx atau .xls
                  </p>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={verifying || !selectedFile}
                  className='w-full bg-[var(--primary)] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-[var(--primary)]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none'
                >
                  {verifying ? (
                    <>
                      <div className='h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                      Memproses Data...
                    </>
                  ) : (
                    <>
                      <FaSync /> Mulai Sinkronisasi
                    </>
                  )}
                </button>
              </div>
            </Card>
          </div>

          {/* Results Section */}
          <div className='lg:col-span-2'>
            {!results ? (
              <div className='h-full flex flex-col items-center justify-center p-12 text-center opacity-60'>
                <div className='h-24 w-24 bg-[color:var(--bg-tertiary)] rounded-full flex items-center justify-center mb-4'>
                  <FaSync className='text-4xl text-gray-400' />
                </div>
                <h3 className='text-xl font-bold'>Belum Ada Hasil</h3>
                <p className='max-w-xs'>
                  Silakan unggah file data sekolah untuk melihat hasil
                  sinkronisasi dengan data kuesioner aplikasi.
                </p>
              </div>
            ) : (
              <div className='space-y-6'>
                {/* Summary Results */}
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                  <div className='bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-center'>
                    <p className='text-xs font-bold text-green-600 uppercase mb-1'>
                      Cocok & Terverifikasi
                    </p>
                    <p className='text-2xl font-bold text-green-700'>
                      {results.summary.verifiedCount}
                    </p>
                  </div>
                  <div className='bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-center'>
                    <p className='text-xs font-bold text-amber-600 uppercase mb-1'>
                      Data Berbeda (Mismatch)
                    </p>
                    <p className='text-2xl font-bold text-amber-700'>
                      {results.summary.mismatchCount}
                    </p>
                  </div>
                  <div className='bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center'>
                    <p className='text-xs font-bold text-red-600 uppercase mb-1'>
                      Belum Terdaftar (Missing)
                    </p>
                    <p className='text-2xl font-bold text-red-700'>
                      {results.summary.notFoundCount}
                    </p>
                  </div>
                </div>

                {/* Discrepancy Tabs */}
                <div className='space-y-4'>
                  {/* Mismatch List */}
                  {results.details.mismatch.length > 0 && (
                    <Card>
                      <h4 className='flex items-center gap-2 font-bold mb-4 text-amber-600'>
                        <FaExclamationTriangle /> Daftar Data Berbeda
                      </h4>
                      <div className='overflow-x-auto'>
                        <table className='w-full text-sm text-left'>
                          <thead className='text-xs bg-[color:var(--bg-tertiary)] uppercase text-[color:var(--text-secondary)]'>
                            <tr>
                              <th className='px-4 py-2 text-gray-500'>Nama</th>
                              <th className='px-4 py-2 text-gray-500'>Lulus</th>
                              <th className='px-4 py-2 text-gray-500'>
                                Data Apps (Tracer)
                              </th>
                              <th className='px-4 py-2 text-gray-500'>
                                Data Sekolah (BK)
                              </th>
                            </tr>
                          </thead>
                          <tbody className='divide-y divide-[color:var(--border-color)]'>
                            {results.details.mismatch.map((m: any, i: number) => (
                              <tr
                                key={i}
                                className='hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
                              >
                                <td className='px-4 py-3 font-semibold'>
                                  {m.name}
                                </td>
                                <td className='px-4 py-3 text-gray-400'>
                                  {m.gradYear}
                                </td>
                                <td className='px-4 py-3'>
                                  <span className='text-xs py-0.5 px-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full font-bold'>
                                    {m.dbData.status}
                                  </span>
                                  <p className='text-[10px] mt-1 truncate max-w-[150px]'>
                                    {m.dbData.university || m.dbData.institution}
                                  </p>
                                </td>
                                <td className='px-4 py-3'>
                                  <span className='text-xs py-0.5 px-2 bg-amber-500/10 text-amber-600 rounded-full font-bold'>
                                    {m.excelData.status}
                                  </span>
                                  <p className='text-[10px] mt-1 truncate max-w-[150px]'>
                                    {m.excelData.university ||
                                      m.excelData.institution}
                                  </p>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}

                  {/* Not Found List */}
                  {results.details.notFound.length > 0 && (
                    <Card>
                      <div className='flex items-center justify-between mb-4'>
                        <h4 className='flex items-center gap-2 font-bold text-red-500'>
                          <FaUserTimes /> Alumni Belum Join/Terdaftar
                        </h4>
                        <p className='text-[10px] text-gray-400 italic'>
                          Silakan undang mereka untuk bergabung
                        </p>
                      </div>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        {results.details.notFound.map((n: any, i: number) => (
                          <div
                            key={i}
                            className='flex items-center justify-between p-3 bg-[color:var(--bg-tertiary)] rounded-xl border border-[color:var(--border-color)]'
                          >
                            <div>
                              <p className='text-sm font-bold'>{n.name}</p>
                              <p className='text-xs text-gray-500'>
                                Angkatan {n.gradYear}
                              </p>
                            </div>
                            <div className='flex gap-2'>
                              <button
                                onClick={() => copyInvitation(n.name)}
                                className='p-2 text-gray-400 hover:text-[var(--primary)] transition-colors'
                                title='Salin Undangan'
                              >
                                <FaCopy size={14} />
                              </button>
                              <a
                                href={`https://wa.me/?text=${encodeURIComponent(`Halo ${n.name}, silakan gabung di Tracer Study SMAN 1 Tawangsari! Link: ${window.location.origin}/register`)}`}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors'
                                title='Undang via WA'
                              >
                                <FaWhatsapp size={14} />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Monitoring Info */}
          <div className='lg:col-span-1 border-r border-[color:var(--border-color)] pr-0 lg:pr-8'>
            <Card className='h-full flex flex-col gap-6'>
              <div>
                <h3 className='text-lg font-bold mb-3 flex items-center gap-2 text-[var(--primary)]'>
                  <FaInfoCircle />
                  Informasi Monitoring
                </h3>
                <p className='text-sm text-[color:var(--text-secondary)] leading-relaxed'>
                  Sebagai guru atau staff sekolah selain Guru BK, Anda dapat memantau status sinkronisasi data alumni.
                </p>
                <p className='text-sm text-[color:var(--text-secondary)] mt-3 leading-relaxed'>
                  Proses sinkronisasi data hanya bisa dilakukan oleh Guru BK.
                </p>
              </div>

              <div className='border-t border-[color:var(--border-color)] pt-6 space-y-4'>
                <h4 className='text-xs font-bold text-[color:var(--text-tertiary)] uppercase tracking-wider'>
                  Rangkuman Status Verifikasi
                </h4>

                <div className='bg-[color:var(--bg-tertiary)] p-4 rounded-xl border border-[color:var(--border-color)]'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-xs font-semibold text-[color:var(--text-secondary)]'>Terverifikasi Sekolah</span>
                    <span className='text-sm font-bold text-emerald-600 dark:text-emerald-400'>{stats?.verifiedAlumni || 0} Alumni</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-xs font-semibold text-[color:var(--text-secondary)]'>Belum Terverifikasi</span>
                    <span className='text-sm font-bold text-amber-500'>{(stats?.totalAlumni - stats?.verifiedAlumni) || 0} Alumni</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Monitoring Table */}
          <div className='lg:col-span-2 space-y-6'>
            <Card>
              <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
                <h3 className='text-lg font-bold flex items-center gap-2'>
                  <FaCheckCircle className='text-emerald-500' />
                  Daftar Status Verifikasi Alumni
                </h3>
                <div className='relative w-full sm:w-64'>
                  <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={12} />
                  <input
                    type='text'
                    placeholder='Cari nama alumni...'
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className='w-full rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-1.5 pl-8 pr-4 text-xs outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
                  />
                </div>
              </div>

              <div className='overflow-x-auto'>
                <table className='w-full text-sm text-left'>
                  <thead className='text-xs bg-[color:var(--bg-tertiary)] uppercase text-[color:var(--text-secondary)]'>
                    <tr>
                      <th className='px-4 py-3'>Nama Alumni</th>
                      <th className='px-4 py-3'>Angkatan</th>
                      <th className='px-4 py-3'>Kelengkapan</th>
                      <th className='px-4 py-3'>Status Verifikasi</th>
                      <th className='px-4 py-3'>Tanggal Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-[color:var(--border-color)]'>
                    {alumniLoading ? (
                      <tr>
                        <td colSpan={5} className='p-8 text-center text-xs text-[color:var(--text-secondary)]'>
                          Memuat data alumni...
                        </td>
                      </tr>
                    ) : alumni.length === 0 ? (
                      <tr>
                        <td colSpan={5} className='p-8 text-center text-xs text-[color:var(--text-tertiary)]'>
                          Tidak ada alumni ditemukan.
                        </td>
                      </tr>
                    ) : (
                      alumni.map((person: any) => (
                        <tr key={person._id} className='hover:bg-gray-50/10 dark:hover:bg-gray-800/10 transition-colors'>
                          <td className='px-4 py-3 font-semibold text-[color:var(--text-primary)]'>
                            {person.profile?.fullName || 'Anonim'}
                            <p className='text-[10px] text-[color:var(--text-tertiary)] font-normal mt-0.5'>{person.email}</p>
                          </td>
                          <td className='px-4 py-3 text-xs font-bold text-[color:var(--text-secondary)]'>
                            {person.profile?.graduationYear || '-'}
                          </td>
                          <td className='px-4 py-3'>
                            {person.questionnaireCompleted ? (
                              <span className='inline-flex items-center gap-1 text-[10px] py-0.5 px-2 bg-emerald-500/10 text-emerald-600 rounded-full font-bold'>
                                Lengkap
                              </span>
                            ) : (
                              <span className='inline-flex items-center gap-1 text-[10px] py-0.5 px-2 bg-amber-500/10 text-amber-600 rounded-full font-bold'>
                                Belum
                              </span>
                            )}
                          </td>
                          <td className='px-4 py-3'>
                            {person.isVerifiedBySchool ? (
                              <span className='inline-flex items-center gap-1 text-[10px] py-0.5 px-2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full font-bold border border-emerald-500/25'>
                                <FaCheckCircle className='text-[8px]' /> Terverifikasi
                              </span>
                            ) : (
                              <span className='inline-flex items-center gap-1 text-[10px] py-0.5 px-2 bg-gray-500/10 text-gray-500 dark:text-gray-400 rounded-full font-bold border border-gray-500/15'>
                                Belum Verifikasi
                              </span>
                            )}
                          </td>
                          <td className='px-4 py-3 text-xs text-[color:var(--text-tertiary)]'>
                            {person.verifiedAt ? new Date(person.verifiedAt).toLocaleDateString('id-ID') : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='mt-6 flex items-center justify-between border-t border-[color:var(--border-color)] pt-4'>
                  <p className='text-xs text-[color:var(--text-tertiary)]'>
                    Halaman {page} dari {totalPages}
                  </p>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className='p-1.5 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-card)] disabled:opacity-50 text-[color:var(--text-primary)] hover:bg-[color:var(--bg-tertiary)] transition-colors'
                    >
                      <FaChevronLeft size={10} />
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className='p-1.5 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-card)] disabled:opacity-50 text-[color:var(--text-primary)] hover:bg-[color:var(--bg-tertiary)] transition-colors'
                    >
                      <FaChevronRight size={10} />
                    </button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolDataVerification;
