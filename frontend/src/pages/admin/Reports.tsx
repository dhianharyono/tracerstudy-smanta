import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaChartBar, FaFileAlt, FaSpinner } from 'react-icons/fa';

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
  }, [location.pathname]);

  const generateReport = async () => {
    if (!reportType) {
      toast.error('Silakan pilih jenis laporan');
      return;
    }

    setLoadingGenerate(true);
    try {
      const response = await axios.get(`/api/admin/reports?type=${reportType}`);
      setReportData(response.data);
      toast.success('Laporan berhasil digenerate!');
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error(error.response?.data?.message || 'Gagal generate laporan');
    } finally {
      setLoadingGenerate(false);
    }
  };

  if (loading || loadingGenerate) {
    return (
      <div className='flex items-center justify-center h-[calc(100vh-64px)]'>
        <div className='flex items-center gap-3 text-lg font-medium text-gray-400'>
          <FaSpinner className='animate-spin text-xl' />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <div className='page-header'>
        <h1 className='text-xl md:text-2xl'>Laporan</h1>
      </div>
      <div className='card'>
        <h2
          className='text-lg md:text-xl'
          style={{
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <FaChartBar />
          <span>Generate Laporan</span>
        </h2>
        <div className='form-group'>
          <label>Jenis Laporan</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value=''>Pilih Jenis Laporan</option>
            <option value='working'>Alumni yang Bekerja</option>
            <option value='studying'>Alumni yang Kuliah</option>
            <option value='university-type'>
              Berdasarkan Jenis Perguruan Tinggi
            </option>
            <option value='major'>Berdasarkan Jurusan</option>
          </select>
        </div>
        <button
          onClick={generateReport}
          className='btn btn-primary'
          disabled={loadingGenerate}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {loadingGenerate ? (
            <>
              <FaSpinner className='spinner' />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <FaChartBar />
              <span>Generate Laporan</span>
            </>
          )}
        </button>
      </div>

      {reportData && (
        <div className='card'>
          <h2
            style={{
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <FaFileAlt />
            <span>Hasil Laporan: {reportData.type}</span>
          </h2>
          {reportData.type === 'university-type' ||
          reportData.type === 'major' ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {reportData.data.map((item: any, index: number) => (
                <div
                  key={index}
                  className='p-4 border border-gray-300 rounded-lg'
                >
                  <h3 className='font-semibold'>{item._id}</h3>
                  <p className='text-primary font-bold text-lg mt-2'>
                    {item.count} alumni
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className='table-container'>
              <table>
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Tahun Lulus</th>
                    <th>Universitas</th>
                    <th>Jurusan</th>
                    {reportData.type === 'working' && (
                      <>
                        <th>Posisi</th>
                        <th>Instansi</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.map((alum: any) => (
                    <tr key={alum._id}>
                      <td>{alum.profile?.fullName || '-'}</td>
                      <td>{alum.email}</td>
                      <td>{alum.profile?.graduationYear || '-'}</td>
                      <td>{alum.university?.name || '-'}</td>
                      <td>{alum.university?.major || '-'}</td>
                      {reportData.type === 'working' && (
                        <>
                          <td>{alum.job?.position || '-'}</td>
                          <td>{alum.job?.institution || '-'}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReports;
