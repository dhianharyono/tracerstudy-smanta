import { useEffect, useState } from 'react';
import axios from 'axios';
import Toast from '@/components/toast';
import {
  FaChartBar,
  FaFileAlt,
  FaSpinner,
  FaUniversity,
  FaGraduationCap,
} from 'react-icons/fa';
import SmartLoader from '@/components/SmartLoader';

const AdminReports = () => {
  const [reportType, setReportType] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingGenerate, setLoadingGenerate] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const generateReport = async () => {
    if (!reportType) {
      Toast('Silakan pilih jenis laporan', 'error');
      return;
    }

    setLoadingGenerate(true);
    try {
      const response = await axios.get(`/api/admin/reports?type=${reportType}`);
      setReportData(response.data);
      Toast('Laporan berhasil digenerate!', 'success');
    } catch (error: any) {
      console.error('Error generating report:', error);
      Toast(error.response?.data?.message || 'Gagal generate laporan', 'error');
    } finally {
      setLoadingGenerate(false);
    }
  };

  const getReportTitle = (type: string) => {
    switch (type) {
      case 'working':
        return 'Laporan Alumni Bekerja';
      case 'studying':
        return 'Laporan Alumni Lanjut Studi';
      case 'university-type':
        return 'Statistik Jenis Perguruan Tinggi';
      case 'major':
        return 'Statistik Sebaran Jurusan';
      default:
        return 'Hasil Laporan';
    }
  };

  if (loading) {
    return <SmartLoader />;
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <div className='mb-6 text-center md:text-left'>
        <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
          Laporan & Statistik
        </h1>
        <p className='text-[color:var(--text-secondary)] text-sm md:text-base'>
          Generate dan analisis data tracer study
        </p>
      </div>

      <div className='card mb-8 max-w-sm md:max-w-md lg:max-w-full'>
        <div className='mb-6 flex items-center gap-3 border-b border-[color:var(--border-color)] pb-4'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-200/30 shrink-0'>
            <FaChartBar className='text-lg' />
          </div>
          <div>
            <h2 className='text-lg font-semibold text-[color:var(--text-primary)] !mb-0'>
              Generate Laporan Baru
            </h2>
            <p className='text-xs text-[color:var(--text-secondary)]'>
              Pilih jenis laporan yang ingin ditampilkan
            </p>
          </div>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <div className='form-group md:col-span-2 lg:col-span-2'>
            <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-1'>
              Jenis Laporan
            </label>
            <div className='relative'>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className='w-full appearance-none rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] p-3 pr-8 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
              >
                <option value=''>-- Pilih Kategori Laporan --</option>
                <option value='working'>Alumni yang Bekerja</option>
                <option value='studying'>Alumni yang Kuliah</option>
                <option value='university-type'>
                  Berdasarkan Jenis Perguruan Tinggi
                </option>
                <option value='major'>Berdasarkan Jurusan</option>
              </select>
              <div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'>
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

          <div className='flex pb-6 md:pb-0 items-center'>
            <button
              onClick={generateReport}
              disabled={loadingGenerate || !reportType}
              className='flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-3 text-white transition-colors hover:bg-[var(--primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loadingGenerate ? (
                <>
                  <FaSpinner className='animate-spin' />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <FaChartBar />
                  <span>Generate Laporan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {reportData && (
        <div className='card animate-fade-in max-w-sm md:max-w-md lg:max-w-full'>
          <div className='mb-6 flex items-center justify-between border-b border-[color:var(--border-color)] pb-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 border border-green-200/30 shrink-0'>
                <FaFileAlt className='text-lg' />
              </div>
              <div>
                <h2 className='text-lg font-semibold text-[color:var(--text-primary)]'>
                  {getReportTitle(reportData.type)}
                </h2>
                <p className='text-xs text-[color:var(--text-secondary)]'>
                  Data terkini dari database
                </p>
              </div>
            </div>
            {/* <button className='flex items-center gap-2 rounded-lg border border-[color:var(--border-color)] px-3 py-1.5 text-xs font-medium text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-tertiary)]'>
               <FaDownload /> Export PDF
             </button> */}
          </div>

          {reportData.type === 'university-type' ||
          reportData.type === 'major' ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
              {reportData.data.map((item: any, index: number) => (
                <div
                  key={index}
                  className='group relative overflow-hidden rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-5 transition-all hover:border-[var(--primary)] hover:shadow-md'
                >
                  <div className='flex items-start justify-between mb-4'>
                    <div className='rounded-lg bg-[var(--bg-tertiary)] p-2 text-[var(--primary)]'>
                      {reportData.type === 'university-type' ? (
                        <FaUniversity />
                      ) : (
                        <FaGraduationCap />
                      )}
                    </div>
                    <span className='text-3xl font-bold text-[color:var(--text-primary)]'>
                      {item.count}
                    </span>
                  </div>
                  <div>
                    <h3
                      className='font-medium text-[color:var(--text-secondary)] text-sm line-clamp-2'
                      title={item._id}
                    >
                      {item._id || 'Tidak Diketahui'}
                    </h3>
                    <p className='text-xs text-[color:var(--text-muted)] mt-1'>
                      Total Alumni
                    </p>
                  </div>
                  <div className='absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] opacity-0 transition-opacity group-hover:opacity-100'></div>
                </div>
              ))}
            </div>
          ) : (
            <div className='overflow-hidden rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] shadow-sm'>
              <div className='overflow-x-auto'>
                <table className='w-full text-left text-sm'>
                  <thead className='bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] uppercase tracking-wider font-medium border-b border-[color:var(--border-color)]'>
                    <tr>
                      <th className='px-6 py-4'>Nama</th>
                      <th className='px-6 py-4'>Email</th>
                      <th className='px-6 py-4'>Tahun</th>
                      <th className='px-6 py-4'>Universitas</th>
                      <th className='px-6 py-4'>Jurusan</th>
                      {reportData.type === 'working' && (
                        <>
                          <th className='px-6 py-4'>Posisi</th>
                          <th className='px-6 py-4'>Instansi</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-[color:var(--border-color)]'>
                    {reportData.data.length === 0 ? (
                      <tr>
                        <td
                          colSpan={reportData.type === 'working' ? 7 : 5}
                          className='p-8 text-center text-[color:var(--text-secondary)]'
                        >
                          Tidak ada data untuk laporan ini.
                        </td>
                      </tr>
                    ) : (
                      reportData.data.map((alum: any) => (
                        <tr
                          key={alum._id}
                          className='hover:bg-[color:var(--bg-tertiary)]/50 transition-colors'
                        >
                          <td className='px-6 py-4 font-medium text-[color:var(--text-primary)]'>
                            {alum.profile?.fullName || '-'}
                          </td>
                          <td className='px-6 py-4 text-[color:var(--text-secondary)]'>
                            {alum.email}
                          </td>
                          <td className='px-6 py-4 text-[color:var(--text-secondary)]'>
                            <span className='inline-flex items-center rounded bg-[var(--bg-tertiary)] px-2 py-1 text-xs font-medium text-[color:var(--text-primary)] border border-[color:var(--border-color)]'>
                              {alum.profile?.graduationYear || '-'}
                            </span>
                          </td>
                          <td className='px-6 py-4 text-[color:var(--text-secondary)]'>
                            {alum.university?.name || '-'}
                          </td>
                          <td className='px-6 py-4 text-[color:var(--text-secondary)]'>
                            {alum.university?.major || '-'}
                          </td>
                          {reportData.type === 'working' && (
                            <>
                              <td className='px-6 py-4 text-[color:var(--text-primary)]'>
                                {alum.job?.position || '-'}
                              </td>
                              <td className='px-6 py-4 text-[color:var(--text-secondary)]'>
                                {alum.job?.institution || '-'}
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReports;
