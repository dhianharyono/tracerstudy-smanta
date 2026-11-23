import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import {
  FaRobot,
  FaSearch,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaUser,
  FaSync,
  FaTimes,
  FaUsers,
  FaPercentage,
  FaFileAlt,
} from 'react-icons/fa';
import Card from '@/components/common/Card';
import PageHeader from '@/components/common/PageHeader';
import SmartLoader from '@/components/SmartLoader';

interface IAiLogItem {
  _id: string;
  user: {
    userId?: string;
    fullName?: string;
    username?: string;
    email?: string;
    role: string;
  };
  query: string;
  responsePreview?: string;
  aiModel: string;
  status: 'success' | 'error';
  errorMessage?: string;
  latencyMs: number;
  tokensEstimated: {
    promptChars: number;
    responseChars: number;
    totalChars: number;
  };
  hasCitation: boolean;
  recommendationsCount: number;
  ipAddress?: string;
  timestamp: string;
}

interface IMetrics {
  totalInteractions: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  uniqueUsersCount: number;
  avgLatencyMs: number;
  totalCharsEstimated: number;
}

const AiLogs: React.FC = () => {
  const [logs, setLogs] = useState<IAiLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<IMetrics>({
    totalInteractions: 0,
    successCount: 0,
    errorCount: 0,
    successRate: 100,
    uniqueUsersCount: 0,
    avgLatencyMs: 0,
    totalCharsEstimated: 0,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    pages: 1,
  });

  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: '',
  });

  const [selectedLog, setSelectedLog] = useState<IAiLogItem | null>(null);

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
      });

      if (filters.role !== 'all') params.append('role', filters.role);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.search.trim()) params.append('search', filters.search.trim());

      const res = await axios.get(`/api/admin/ai-logs?${params.toString()}`);
      setLogs(res.data.logs || []);
      setPagination(res.data.pagination || { page: 1, limit: 15, total: 0, pages: 1 });
      if (res.data.metrics) {
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error('Error fetching AI logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(pagination.page);
  }, [pagination.page, filters.role, filters.status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pagination.page === 1) {
      fetchLogs(1);
    } else {
      setPagination((p) => ({ ...p, page: 1 }));
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'alumni':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'student':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'school':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className='p-4 sm:p-6 lg:p-8 space-y-6 page-fade-in'>
      {/* Header */}
      <PageHeader
        title='Log Interaksi AI'
        description='Pantau aktivitas, beban kueri, waktu respon, dan performa asisten cerdas SMANTA AI secara real-time'
      >
        <button
          type='button'
          onClick={() => fetchLogs(pagination.page)}
          className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm text-xs sm:text-sm font-semibold transition-all cursor-pointer'
        >
          <FaSync className={`text-xs ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </PageHeader>

      {/* Metrics Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Card 1: Total Interaksi */}
        <Card className='p-4 md:p-5 flex items-center justify-between border border-slate-200 bg-white shadow-xs rounded-2xl'>
          <div>
            <p className='text-xs font-semibold text-slate-500'>Total Percakapan AI</p>
            <h3 className='text-2xl font-bold text-slate-800 mt-1'>
              {metrics.totalInteractions.toLocaleString('id-ID')}
            </h3>
            <p className='text-[11px] text-slate-400 mt-0.5'>Kueri asisten yang diproses</p>
          </div>
          <div className='w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0'>
            <FaRobot />
          </div>
        </Card>

        {/* Card 2: Pengguna Aktif */}
        <Card className='p-4 md:p-5 flex items-center justify-between border border-slate-200 bg-white shadow-xs rounded-2xl'>
          <div>
            <p className='text-xs font-semibold text-slate-500'>Pengguna AI Aktif</p>
            <h3 className='text-2xl font-bold text-slate-800 mt-1'>
              {metrics.uniqueUsersCount.toLocaleString('id-ID')}
            </h3>
            <p className='text-[11px] text-slate-400 mt-0.5'>Akun unik yang berinteraksi</p>
          </div>
          <div className='w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shrink-0'>
            <FaUsers />
          </div>
        </Card>

        {/* Card 3: Tingkat Keberhasilan */}
        <Card className='p-4 md:p-5 flex items-center justify-between border border-slate-200 bg-white shadow-xs rounded-2xl'>
          <div>
            <p className='text-xs font-semibold text-slate-500'>Tingkat Keberhasilan</p>
            <div className='flex items-baseline gap-2 mt-1'>
              <h3 className='text-2xl font-bold text-slate-800'>
                {metrics.successRate}%
              </h3>
              <span className='text-[11px] text-emerald-600 font-medium'>
                {metrics.successCount} sukses
              </span>
            </div>
            <p className='text-[11px] text-slate-400 mt-0.5'>{metrics.errorCount} gagal diproses</p>
          </div>
          <div className='w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0'>
            <FaPercentage />
          </div>
        </Card>

        {/* Card 4: Rata-rata Latensi */}
        <Card className='p-4 md:p-5 flex items-center justify-between border border-slate-200 bg-white shadow-xs rounded-2xl'>
          <div>
            <p className='text-xs font-semibold text-slate-500'>Rata-rata Respon</p>
            <h3 className='text-2xl font-bold text-slate-800 mt-1'>
              {metrics.avgLatencyMs > 1000
                ? `${(metrics.avgLatencyMs / 1000).toFixed(2)} dtk`
                : `${metrics.avgLatencyMs} ms`}
            </h3>
            <p className='text-[11px] text-slate-400 mt-0.5'>Model latency Gemini RAG</p>
          </div>
          <div className='w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0'>
            <FaClock />
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar (Putih Bersih Konsisten Standar Admin) */}
      <div className='p-4 border border-slate-200 rounded-xl bg-white shadow-sm'>
        <div className='flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between'>
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className='flex-1 relative'>
            <span className='absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400'>
              <FaSearch size={14} />
            </span>
            <input
              type='text'
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              placeholder='Cari nama, email, username, atau isi pertanyaan pengguna...'
              className='w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 shadow-xs'
            />
          </form>

          {/* Filters */}
          <div className='flex items-center gap-2.5 overflow-x-auto pb-1 md:pb-0'>
            {/* Role Filter */}
            <select
              value={filters.role}
              onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}
              className='h-10 py-2 px-3 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 outline-none focus:border-blue-500 shadow-xs'
            >
              <option value='all'>Semua Role</option>
              <option value='student'>Siswa</option>
              <option value='alumni'>Alumni</option>
              <option value='admin'>Admin</option>
              <option value='school'>Sekolah</option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className='h-10 py-2 px-3 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 outline-none focus:border-blue-500 shadow-xs'
            >
              <option value='all'>Semua Status</option>
              <option value='success'>Sukses</option>
              <option value='error'>Error / Gagal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container (Putih Bersih) */}
      <div className='border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden'>
        {loading ? (
          <div className='py-16'>
            <SmartLoader messages={['Memuat log AI...', 'Mengompilasi metrik kueri...']} />
          </div>
        ) : logs.length === 0 ? (
          <div className='py-16 text-center text-slate-500'>
            <div className='w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl mx-auto mb-3'>
              <FaRobot />
            </div>
            <h4 className='text-base font-semibold text-slate-800'>Belum Ada Log Interaksi AI</h4>
            <p className='text-sm text-slate-500 mt-1 max-w-sm mx-auto'>
              Aktivitas tanya jawab pengguna dengan SMANTA AI akan otomatis tercatat dan dapat dipantau di sini.
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-xs'>
              <thead>
                <tr className='border-b border-slate-200 bg-slate-50 text-slate-600 font-medium uppercase tracking-wider text-[11px]'>
                  <th className='py-3.5 px-4'>Waktu</th>
                  <th className='py-3.5 px-4'>Pengguna</th>
                  <th className='py-3.5 px-4'>Role</th>
                  <th className='py-3.5 px-4 max-w-xs'>Pertanyaan / Prompt</th>
                  <th className='py-3.5 px-4'>Model AI</th>
                  <th className='py-3.5 px-4'>Status</th>
                  <th className='py-3.5 px-4 text-right'>Latensi</th>
                  <th className='py-3.5 px-4 text-center'>Aksi</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className='hover:bg-slate-50/80 text-slate-700 transition-colors'
                  >
                    {/* Waktu */}
                    <td className='py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]'>
                      {new Date(log.timestamp).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Pengguna */}
                    <td className='py-3.5 px-4 whitespace-nowrap'>
                      <div className='flex items-center gap-2'>
                        <div className='w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs shrink-0 font-bold'>
                          {log.user?.fullName?.charAt(0) || <FaUser className='text-[10px]' />}
                        </div>
                        <div>
                          <div className='font-semibold text-slate-800 leading-tight'>
                            {log.user?.fullName || log.user?.username || 'Pengguna'}
                          </div>
                          {log.user?.email && (
                            <div className='text-[10px] text-slate-400'>{log.user.email}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className='py-3.5 px-4 whitespace-nowrap'>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border capitalize ${getRoleBadge(
                          log.user?.role
                        )}`}
                      >
                        {log.user?.role}
                      </span>
                    </td>

                    {/* Pertanyaan */}
                    <td className='py-3.5 px-4 max-w-xs'>
                      <p className='truncate text-slate-700 font-medium' title={log.query}>
                        {log.query}
                      </p>
                    </td>

                    {/* Model */}
                    <td className='py-3.5 px-4 whitespace-nowrap text-slate-500'>
                      <span className='px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]'>
                        {log.aiModel}
                      </span>
                    </td>

                    {/* Status */}
                    <td className='py-3.5 px-4 whitespace-nowrap'>
                      {log.status === 'success' ? (
                        <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200'>
                          <FaCheckCircle className='text-[9px]' />
                          Sukses
                        </span>
                      ) : (
                        <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200'>
                          <FaExclamationTriangle className='text-[9px]' />
                          Error
                        </span>
                      )}
                    </td>

                    {/* Latensi */}
                    <td className='py-3.5 px-4 whitespace-nowrap text-right font-medium text-slate-600'>
                      {log.latencyMs ? `${(log.latencyMs / 1000).toFixed(2)}s` : '-'}
                    </td>

                    {/* Aksi */}
                    <td className='py-3.5 px-4 whitespace-nowrap text-center'>
                      <button
                        type='button'
                        onClick={() => setSelectedLog(log)}
                        className='px-2.5 py-1 rounded-lg text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-colors cursor-pointer'
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div className='p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500'>
            <span>
              Menampilkan {logs.length} dari {pagination.total} log interaksi
            </span>
            <div className='flex items-center gap-1'>
              <button
                type='button'
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                className='px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer'
              >
                Sebelumnya
              </button>
              <span className='px-2 font-medium'>
                {pagination.page} / {pagination.pages}
              </span>
              <button
                type='button'
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                className='px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer'
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal with React Portal to document.body */}
      {selectedLog &&
        createPortal(
          <div className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in'>
            <div className='bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto'>
              <div className='flex items-center justify-between border-b border-slate-100 pb-3'>
                <div className='flex items-center gap-2'>
                  <div className='w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm'>
                    <FaRobot />
                  </div>
                  <div>
                    <h4 className='font-bold text-sm text-slate-800'>Detail Interaksi AI</h4>
                    <p className='text-[10px] text-slate-400'>
                      {new Date(selectedLog.timestamp).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                <button
                  type='button'
                  onClick={() => setSelectedLog(null)}
                  className='p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer'
                >
                  <FaTimes />
                </button>
              </div>

              <div className='space-y-3 text-xs'>
                {/* User Info */}
                <div className='bg-slate-50 p-3 rounded-xl space-y-1.5'>
                  <div className='flex justify-between items-center'>
                    <span className='text-slate-500'>Nama Pengguna:</span>
                    <span className='font-semibold text-slate-800'>
                      {selectedLog.user?.fullName || selectedLog.user?.username || '-'}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-slate-500'>Email:</span>
                    <span className='text-slate-700'>{selectedLog.user?.email || '-'}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-slate-500'>Role Akun:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border capitalize ${getRoleBadge(
                        selectedLog.user?.role
                      )}`}
                    >
                      {selectedLog.user?.role}
                    </span>
                  </div>
                  {selectedLog.ipAddress && (
                    <div className='flex justify-between items-center'>
                      <span className='text-slate-500'>IP Address:</span>
                      <span className='font-mono text-[10px] text-slate-600'>
                        {selectedLog.ipAddress}
                      </span>
                    </div>
                  )}
                </div>

                {/* Prompt Query */}
                <div className='space-y-1'>
                  <label className='font-semibold text-slate-700 flex items-center gap-1.5'>
                    <FaFileAlt className='text-blue-500' /> Pertanyaan Lengkap:
                  </label>
                  <div className='p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-800 leading-relaxed font-medium whitespace-pre-wrap'>
                    {selectedLog.query}
                  </div>
                </div>

                {/* Response Preview or Error */}
                {selectedLog.status === 'success' ? (
                  <div className='space-y-1'>
                    <label className='font-semibold text-slate-700 flex items-center gap-1.5'>
                      <FaCheckCircle className='text-emerald-500' /> Cuplikan Respon AI:
                    </label>
                    <div className='p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-700 leading-relaxed text-[11px] whitespace-pre-wrap max-h-40 overflow-y-auto'>
                      {selectedLog.responsePreview || 'Respon berhasil dikirim.'}
                    </div>
                  </div>
                ) : (
                  <div className='space-y-1'>
                    <label className='font-semibold text-rose-600 flex items-center gap-1.5'>
                      <FaExclamationTriangle /> Pesan Galat / Error:
                    </label>
                    <div className='p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 leading-relaxed font-mono text-[11px]'>
                      {selectedLog.errorMessage || 'Terjadi kesalahan sistem internal.'}
                    </div>
                  </div>
                )}

                {/* Performance & Token Metrics */}
                <div className='grid grid-cols-2 gap-2 pt-1'>
                  <div className='p-2.5 rounded-xl border border-slate-100 bg-slate-50/50'>
                    <span className='text-[10px] text-slate-400'>Waktu Eksekusi</span>
                    <p className='font-bold text-slate-800 mt-0.5'>
                      {selectedLog.latencyMs} ms
                    </p>
                  </div>
                  <div className='p-2.5 rounded-xl border border-slate-100 bg-slate-50/50'>
                    <span className='text-[10px] text-slate-400'>Total Karakter</span>
                    <p className='font-bold text-slate-800 mt-0.5'>
                      {selectedLog.tokensEstimated?.totalChars || 0} char
                    </p>
                  </div>
                </div>
              </div>

              <div className='pt-2 flex justify-end'>
                <button
                  type='button'
                  onClick={() => setSelectedLog(null)}
                  className='px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer'
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default AiLogs;
