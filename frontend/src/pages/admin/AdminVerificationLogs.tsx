import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaHistory, 
  FaSearch, 
  FaFilter, 
  FaUserCog, 
  FaExclamationCircle,
  FaCheckCircle,
  FaTrashAlt,
  FaSync
} from 'react-icons/fa';
import Card from '@/components/common/Card';
import PageHeader from '@/components/common/PageHeader';
import SmartLoader from '@/components/SmartLoader';

const AdminVerificationLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchLogs();
  }, [pagination.page]);

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`/api/admin/audit-logs?page=${pagination.page}&limit=${pagination.limit}`);
      setLogs(response.data.logs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'VERIFY_BULK': return <FaSync className="text-blue-500" />;
      case 'UPDATE_ALUMNI': return <FaUserCog className="text-amber-500" />;
      case 'DELETE_ALUMNI': return <FaTrashAlt className="text-red-500" />;
      default: return <FaExclamationCircle className="text-gray-500" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'VERIFY_BULK': 
        return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Sinkronisasi</span>;
      case 'UPDATE_ALUMNI': 
        return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Update Data</span>;
      case 'DELETE_ALUMNI': 
        return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Hapus Data</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Aktivitas</span>;
    }
  };

  if (loading) return <SmartLoader />;

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <PageHeader
        title='Verifikasi Data Alumni'
        description='Monitoring log aktivitas dan sinkronisasi data yang dilakukan oleh Admin & Guru BK'
      />

      <div className="grid grid-cols-1 gap-6">
        <Card className="!p-0 overflow-hidden border border-[color:var(--border-color)]">
          <div className="bg-[color:var(--bg-tertiary)] p-4 border-b border-[color:var(--border-color)] flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="font-bold flex items-center gap-2">
              <FaHistory /> Riwayat Aktivitas
            </h3>
            <div className="flex gap-2">
               <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <FaSearch size={12} />
                  </span>
                  <input 
                    type="text" 
                    placeholder="Cari aktor..." 
                    className="pl-9 pr-4 py-1.5 text-xs rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-card)] focus:outline-none focus:border-[var(--primary)]"
                  />
               </div>
               <button className="p-2 bg-[color:var(--bg-card)] border border-[color:var(--border-color)] rounded-lg text-gray-500 hover:text-[var(--primary)] transition-colors">
                  <FaFilter size={12} />
               </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[color:var(--text-secondary)] uppercase bg-[color:var(--bg-tertiary)] bg-opacity-50">
                <tr>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Pelaku</th>
                  <th className="px-6 py-4">Aksi</th>
                  <th className="px-6 py-4">Target / Alumni</th>
                  <th className="px-6 py-4">Ringkasan Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border-color)]">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                      Belum ada log aktivitas tercatat.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-[color:var(--bg-tertiary)]/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[color:var(--text-primary)]">{log.actor.username}</span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-tighter">{log.actor.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          {getActionBadge(log.action)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-[color:var(--text-primary)]">
                          {log.target.name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-[color:var(--text-secondary)] max-w-md line-clamp-2">
                          {log.details}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Total {pagination.total} log aktivitas
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPagination({...pagination, page: pagination.page - 1})}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-xs border rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-800"
              >
                Prev
              </button>
              <button 
                onClick={() => setPagination({...pagination, page: pagination.page + 1})}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 text-xs border rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-800"
              >
                Next
              </button>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="!bg-[var(--primary)]/5 border-[var(--primary)]/10">
          <h4 className="font-bold flex items-center gap-2 mb-2 text-[var(--primary)]">
            <FaCheckCircle /> Mengapa Halaman Ini Penting?
          </h4>
          <p className="text-xs text-[color:var(--text-secondary)] leading-relaxed">
            Halaman ini mencatat setiap perubahan data yang dilakukan oleh otoritas sekolah atau admin. Ini membantu Anda memantau siapa yang bertanggung jawab atas data yang diverifikasi dan memastikan integritas data Tracer Study tetap terjaga.
          </p>
        </Card>
        <Card className="!bg-amber-500/5 border-amber-500/10">
          <h4 className="font-bold flex items-center gap-2 mb-2 text-amber-600">
            <FaExclamationCircle /> Kebijakan Keamanan
          </h4>
          <p className="text-xs text-[color:var(--text-secondary)] leading-relaxed">
            Sesuai permintaan Anda, sesi login kini dibatasi hanya 2 hari untuk meminimalkan risiko akses tidak sah. Log di atas hanya mencatat ringkasan aksi untuk efisiensi penyimpanan database.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AdminVerificationLogs;
