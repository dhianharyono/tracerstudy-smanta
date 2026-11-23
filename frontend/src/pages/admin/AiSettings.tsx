import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaRobot,
  FaKey,
  FaSlidersH,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaSave,
  FaSync,
  FaInfoCircle,
  FaCogs,
} from 'react-icons/fa';
import PageHeader from '@/components/common/PageHeader';
import SmartLoader from '@/components/SmartLoader';
import Toast from '@/components/toast';

interface IAiModelOption {
  id: string;
  name: string;
  tag: string;
  speed: string;
  description: string;
}

interface IAiConfigData {
  _id?: string;
  hasApiKey: boolean;
  maskedApiKey: string;
  keyCount?: number;
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  isActive: boolean;
  systemInstructionOverride?: string;
  lastTestedAt?: string;
  testStatus?: 'success' | 'failed';
  testMessage?: string;
}

const AiSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Form states
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-flash');
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelId, setCustomModelId] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [isActive, setIsActive] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Backend response metadata
  const [configMeta, setConfigMeta] = useState<IAiConfigData | null>(null);
  const [availableModels, setAvailableModels] = useState<IAiModelOption[]>([]);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'failed';
    message: string;
    latencyMs?: number;
  }>({ status: 'idle', message: '' });

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/ai-config');
      const data: IAiConfigData = res.data.config;
      setConfigMeta(data);

      const incomingModel = data.selectedModel || 'gemini-3.5-flash';
      const modelsList: IAiModelOption[] = res.data.availableModels || [];
      if (modelsList.length > 0) {
        setAvailableModels(modelsList);
      }

      // Check if the current model is one of the known predefined models
      const isKnown = modelsList.some((m) => m.id === incomingModel);
      if (!isKnown && incomingModel) {
        setIsCustomModel(true);
        setCustomModelId(incomingModel);
        setSelectedModel('custom');
      } else {
        setIsCustomModel(false);
        setSelectedModel(incomingModel);
      }

      setTemperature(data.temperature ?? 0.7);
      setMaxTokens(data.maxTokens ?? 2048);
      setIsActive(data.isActive !== false);

      if (data.testStatus) {
        setTestResult({
          status: data.testStatus,
          message: data.testMessage || '',
        });
      }
    } catch (err: any) {
      console.error('Error fetching AI config:', err);
      Toast('Gagal memuat konfigurasi AI dari server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const getEffectiveModel = (): string => {
    if (isCustomModel) {
      return customModelId.trim();
    }
    return selectedModel;
  };

  const handleSelectModel = (modelId: string) => {
    if (modelId === 'custom') {
      setIsCustomModel(true);
      setSelectedModel('custom');
    } else {
      setIsCustomModel(false);
      setSelectedModel(modelId);
    }
  };

  const handleTestConnection = async () => {
    const effectiveModel = getEffectiveModel();
    if (!effectiveModel) {
      Toast('Silakan pilih atau masukkan Model ID terlebih dahulu', 'warning');
      return;
    }

    try {
      setTesting(true);
      setTestResult({ status: 'idle', message: 'Menguji koneksi ke Google Gemini API...' });

      const res = await axios.post('/api/admin/ai-config/test', {
        apiKey: apiKeyInput.trim() || undefined,
        selectedModel: effectiveModel,
      });

      setTestResult({
        status: 'success',
        message: res.data.message || 'Koneksi ke Gemini API berhasil!',
        latencyMs: res.data.latencyMs,
      });
      Toast(res.data.message || 'Koneksi AI Berhasil!', 'success');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Gagal terhubung ke API';
      setTestResult({
        status: 'failed',
        message: errMsg,
      });
      Toast(errMsg, 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveModel = getEffectiveModel();

    if (!effectiveModel) {
      Toast('Model ID tidak boleh kosong. Masukkan nama model yang valid.', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload: any = {
        selectedModel: effectiveModel,
        temperature,
        maxTokens,
        isActive,
      };

      if (apiKeyInput.trim()) {
        payload.apiKey = apiKeyInput.trim();
      }

      const res = await axios.put('/api/admin/ai-config', payload);
      Toast(res.data.message || 'Pengaturan AI berhasil disimpan!', 'success');
      setConfigMeta(res.data.config);
      setApiKeyInput('');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Gagal menyimpan pengaturan AI';
      Toast(errMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='p-4 sm:p-6 lg:p-8'>
        <SmartLoader messages={['Memuat konfigurasi AI...', 'Menghubungkan ke sistem...']} />
      </div>
    );
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 space-y-6 page-fade-in w-full'>
      {/* Header */}
      <PageHeader
        title='Kelola Asisten AI'
        description='Konfigurasikan kunci API Google Gemini, pemilihan model kecerdasan buatan, serta parameter interaksi asisten SMANTA AI'
      >
        <button
          type='button'
          onClick={fetchConfig}
          className='inline-flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl shadow-xs text-xs sm:text-sm font-semibold transition-all cursor-pointer'
        >
          <FaSync className={`text-xs ${loading ? 'animate-spin' : ''}`} />
          <span>Muat Ulang</span>
        </button>
      </PageHeader>

      <form onSubmit={handleSave} className='space-y-6 w-full max-w-full'>
        {/* Card 1: Status Asisten AI */}
        <div className='p-6 bg-white border border-slate-200 rounded-2xl shadow-sm'>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <h3 className='text-base font-bold text-slate-800 flex items-center gap-2'>
                <FaRobot className='text-blue-600' />
                <span>Status Aktif SMANTA AI</span>
              </h3>
              <p className='text-xs text-slate-500 max-w-xl'>
                Ketika dinonaktifkan, siswa dan alumni tidak dapat mengirim kueri baru dan akan menerima pesan pemeliharaan sistem sementara.
              </p>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className='sr-only peer'
              />
              <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Card 2: Konfigurasi Kunci API */}
        <div className='p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4'>
          <div className='border-b border-slate-100 pb-3'>
            <h3 className='text-base font-bold text-slate-800 flex items-center gap-2'>
              <FaKey className='text-amber-500' />
              <span>Google Gemini API Key (Mendukung Multi-Key Rotation)</span>
            </h3>
            <p className='text-xs text-slate-500 mt-1'>
              Kunci API digunakan oleh server backend untuk memproses konsultasi RAG. Masukkan satu atau beberapa kunci API (pisahkan dengan koma atau baris baru) untuk rotasi otomatis saat salah satu kunci mencapai batas kuota (429).
            </p>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between text-xs'>
              <label className='font-semibold text-slate-700'>
                Kunci API (Google AI Studio)
              </label>
              {configMeta?.hasApiKey && (
                <span className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200'>
                  <FaCheckCircle className='text-[10px]' />
                  Tersimpan ({configMeta.maskedApiKey}) {configMeta.keyCount && configMeta.keyCount > 1 ? `• ${configMeta.keyCount} Kunci Aktif` : ''}
                </span>
              )}
            </div>

            <div className='relative'>
              <textarea
                rows={showApiKey ? 3 : 2}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={
                  configMeta?.hasApiKey
                    ? 'Kunci API sudah tersimpan. Masukkan kunci baru atau multi-key (pisahkan dengan koma/enter) jika ingin mengubah...'
                    : 'Tempel kunci API Google Gemini (AIzaSy...). Bisa beberapa key dipisahkan koma atau baris baru untuk rotasi otomatis kuota.'
                }
                className='w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3.5 pr-11 text-xs font-mono text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 shadow-xs'
              />
              <button
                type='button'
                onClick={() => setShowApiKey(!showApiKey)}
                className='absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer'
                title={showApiKey ? 'Sembunyikan Kunci' : 'Lihat Kunci'}
              >
                {showApiKey ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
              </button>
            </div>
            <p className='text-[11px] text-slate-400'>
              Anda dapat memperoleh kunci API gratis melalui{' '}
              <a
                href='https://aistudio.google.com/app/apikey'
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 hover:underline font-medium'
              >
                Google AI Studio
              </a>
              . Tip: Buat 2-3 project di Google AI Studio dan masukkan key di sini agar bebas hambatan limit kuota per menit.
            </p>
          </div>

          {/* Test Connection Button & Result */}
          <div className='pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100'>
            <div>
              <p className='text-xs font-semibold text-slate-700'>Uji Sambungan API</p>
              <p className='text-[11px] text-slate-500'>
                Kirim pesan ping ke Gemini API untuk memastikan kuota, model, dan kunci valid.
              </p>
            </div>
            <button
              type='button'
              onClick={handleTestConnection}
              disabled={testing || (!apiKeyInput.trim() && !configMeta?.hasApiKey)}
              className='inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl shadow-xs text-xs font-semibold disabled:opacity-50 transition-all cursor-pointer'
            >
              <FaSync className={`text-xs ${testing ? 'animate-spin text-blue-600' : ''}`} />
              <span>{testing ? 'Menguji...' : 'Uji Koneksi'}</span>
            </button>
          </div>

          {testResult.status !== 'idle' && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                testResult.status === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.status === 'success' ? (
                <FaCheckCircle className='text-emerald-600 mt-0.5 shrink-0' />
              ) : (
                <FaExclamationTriangle className='text-rose-600 mt-0.5 shrink-0' />
              )}
              <div className='space-y-0.5'>
                <p className='font-semibold'>
                  {testResult.status === 'success' ? 'Uji Koneksi Sukses' : 'Uji Koneksi Gagal'}
                </p>
                <p className='text-[11px] leading-relaxed'>{testResult.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Card 3: Pilihan Model AI */}
        <div className='p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4'>
          <div className='border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
            <div>
              <h3 className='text-base font-bold text-slate-800 flex items-center gap-2'>
                <FaRobot className='text-indigo-600' />
                <span>Model Kecerdasan Buatan (Google Gemini Family)</span>
              </h3>
              <p className='text-xs text-slate-500 mt-1'>
                Pilih model resmi Google Gemini yang terdaftar atau masukkan model ID kustom.
              </p>
            </div>
            <div className='text-xs font-mono px-3 py-1 bg-slate-100 text-slate-600 rounded-lg self-start sm:self-auto'>
              Aktif: <strong className='text-blue-600'>{getEffectiveModel() || '-'}</strong>
            </div>
          </div>

          {/* Model Selection Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5'>
            {availableModels.map((model) => {
              const isSelected = !isCustomModel && selectedModel === model.id;
              return (
                <div
                  key={model.id}
                  onClick={() => handleSelectModel(model.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div>
                    <div className='flex items-center justify-between gap-2 mb-1.5'>
                      <h4 className='font-bold text-sm text-slate-800 leading-tight'>
                        {model.name}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {model.tag}
                      </span>
                    </div>
                    <p className='text-xs text-slate-500 leading-relaxed line-clamp-3'>{model.description}</p>
                  </div>
                  <div className='mt-3 pt-2 border-t border-slate-100 text-[11px] flex items-center justify-between text-slate-400'>
                    <span>Kecepatan: <strong className='text-slate-600'>{model.speed}</strong></span>
                    <span className='font-mono text-[10px] truncate max-w-[120px]' title={model.id}>{model.id}</span>
                  </div>
                </div>
              );
            })}

            {/* Custom Model Card */}
            <div
              onClick={() => handleSelectModel('custom')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isCustomModel
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                  : 'border-dashed border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/60'
              }`}
            >
              <div>
                <div className='flex items-center justify-between gap-2 mb-1.5'>
                  <h4 className='font-bold text-sm text-slate-800 flex items-center gap-1.5'>
                    <FaCogs className='text-indigo-600 text-xs' />
                    <span>Model Kustom Lainnya</span>
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isCustomModel
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    Manual ID
                  </span>
                </div>
                <p className='text-xs text-slate-500 leading-relaxed'>
                  Gunakan model pratinjau eksperimental, tuned model khusus, atau model rilis mendatang langsung dari Google AI Studio.
                </p>
              </div>
              <div className='mt-3 pt-2 border-t border-slate-100 text-[11px] flex items-center justify-between text-slate-400'>
                <span>Tipe: <strong className='text-indigo-600'>Custom ID</strong></span>
                <span className='font-mono text-[10px]'>Tentukan Sendiri</span>
              </div>
            </div>
          </div>

          {/* Custom Model ID Input Field (Visible when Custom is chosen) */}
          {isCustomModel && (
            <div className='p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-2 animate-fade-in'>
              <label className='block text-xs font-bold text-indigo-900'>
                Nama / String Model ID Kustom:
              </label>
              <div className='flex flex-col sm:flex-row gap-2'>
                <input
                  type='text'
                  value={customModelId}
                  onChange={(e) => setCustomModelId(e.target.value)}
                  placeholder='contoh: gemini-3.5-flash-lite, gemini-3.6-flash-preview, gemini-2.5-pro, dll.'
                  className='flex-1 rounded-xl border border-indigo-300 bg-white py-2 px-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-600 shadow-xs'
                  required={isCustomModel}
                />
              </div>
              <p className='text-[11px] text-indigo-700'>
                Pastikan nama model ID sesuai dengan daftar model resmi yang didukung akun Google AI Studio Anda.
              </p>
            </div>
          )}
        </div>

        {/* Card 4: Parameter Tambahan (Collapsible) */}
        <div className='p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4'>
          <button
            type='button'
            onClick={() => setShowAdvanced(!showAdvanced)}
            className='w-full flex items-center justify-between text-left cursor-pointer'
          >
            <div className='space-y-0.5'>
              <h3 className='text-base font-bold text-slate-800 flex items-center gap-2'>
                <FaSlidersH className='text-slate-600' />
                <span>Pengaturan Lanjutan (Advanced Parameters)</span>
              </h3>
              <p className='text-xs text-slate-500'>
                Sesuaikan parameter kreativitas (temperature) dan batas panjang token respon.
              </p>
            </div>
            <span className='text-xs font-semibold text-blue-600 hover:underline'>
              {showAdvanced ? 'Tutup' : 'Buka Pengaturan'}
            </span>
          </button>

          {showAdvanced && (
            <div className='pt-4 border-t border-slate-100 space-y-5 animate-fade-in'>
              {/* Temperature */}
              <div className='space-y-2'>
                <div className='flex justify-between items-center text-xs'>
                  <label className='font-semibold text-slate-700 flex items-center gap-1.5'>
                    <span>Kreativitas Respon (Temperature)</span>
                    <span className='font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100'>
                      {temperature}
                    </span>
                  </label>
                  <span className='text-slate-400'>Default: 0.7 (Faktual & Ramah)</span>
                </div>
                <input
                  type='range'
                  min='0'
                  max='1.5'
                  step='0.1'
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className='w-full accent-blue-600 cursor-pointer'
                />
                <div className='flex justify-between text-[10px] text-slate-400'>
                  <span>0.0 (Sangat Kaku & Deterministik)</span>
                  <span>0.7 (Optimal Konseling)</span>
                  <span>1.5 (Sangat Kreatif)</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div className='space-y-2'>
                <div className='flex justify-between items-center text-xs'>
                  <label className='font-semibold text-slate-700'>
                    Maksimal Output Tokens
                  </label>
                  <span className='text-slate-400'>Default: 2048 token (~1500 kata)</span>
                </div>
                <select
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                  className='w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm text-slate-700 outline-none focus:border-blue-500 shadow-xs'
                >
                  <option value='1024'>1024 Token (Ringkas & Cepat)</option>
                  <option value='2048'>2048 Token (Standar Rekomendasi)</option>
                  <option value='4096'>4096 Token (Jawaban Panjang & Komprehensif)</option>
                  <option value='8192'>8192 Token (Maksimal)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className='flex items-center justify-between pt-2'>
          <div className='flex items-center gap-2 text-xs text-slate-500'>
            <FaInfoCircle className='text-slate-400' />
            <span>Perubahan pengaturan akan langsung diterapkan pada sesi konsultasi AI berikutnya.</span>
          </div>
          <button
            type='submit'
            disabled={saving}
            className='inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer'
          >
            <FaSave className={`text-xs ${saving ? 'animate-spin' : ''}`} />
            <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AiSettings;
