import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  FaBriefcase,
  FaArrowLeft,
  FaSave,
  FaBuilding,
  FaMapMarkerAlt,
  FaLink,
  FaCalendarAlt,
  FaPlus,
  FaTimes
} from 'react-icons/fa';
import Toast from '@/components/toast';
import SmartLoader from '@/components/SmartLoader';
import { useAuth } from '@/contexts/AuthContext';
import RestrictedAccess from '@/components/RestrictedAccess';
import { isUniversityIncomplete, isJobIncomplete } from '@/utils/validation';

const JOB_CATEGORIES = [
  'Teknologi & IT',
  'Ekonomi & Bisnis',
  'Pendidikan',
  'Kesehatan',
  'Industri & Teknik',
  'Kreatif & Media',
  'Sosial & Humaniora',
  'Lainnya'
];

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Freelance'];

const PostOpportunity = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);

  if (user?.role === 'alumni') {
    if (user.questionnaireCompleted === false) {
      return <RestrictedAccess type='questionnaire_incomplete' role='alumni' />;
    }
    if (isUniversityIncomplete(user)) {
      return <RestrictedAccess type='university_incomplete' role='alumni' />;
    }
    // Strict requirement: Only alumni who have filled job data can post
    if (isJobIncomplete(user)) {
      return <RestrictedAccess type='job_incomplete' role='alumni' />;
    }
  }
  const [submitLoading, setSubmitLoading] = useState(false);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    category: '',
    type: '',
    description: '',
    applicationLink: '',
    expiryDate: '',
  });

  useEffect(() => {
    if (isEdit) {
      const fetchJob = async () => {
        try {
          const res = await axios.get('/api/jobs/my');
          const job = res.data.find((j: any) => j._id === id);
          if (job) {
            setFormData({
              title: job.title,
              company: job.company,
              location: job.location,
              category: job.category,
              type: job.type,
              description: job.description,
              applicationLink: job.applicationLink,
              expiryDate: new Date(job.expiryDate).toISOString().split('T')[0],
            });
            setRequirements(job.requirements.length > 0 ? job.requirements : ['']);
          }
        } catch (error) {
          console.error(error);
          Toast('Gagal memuat data lowongan', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchJob();
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handeRequirementChange = (index: number, value: string) => {
    const newReqs = [...requirements];
    newReqs[index] = value;
    setRequirements(newReqs);
  };

  const addRequirement = () => setRequirements([...requirements, '']);
  const removeRequirement = (index: number) => {
    const newReqs = requirements.filter((_, i) => i !== index);
    setRequirements(newReqs.length ? newReqs : ['']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    const payload = {
      ...formData,
      requirements: requirements.filter(r => r.trim() !== ''),
    };

    try {
      if (isEdit) {
        await axios.put(`/api/jobs/${id}`, payload);
        Toast('Lowongan berhasil diperbarui dan dikirim untuk moderasi', 'success');
      } else {
        await axios.post('/api/jobs', payload);
        Toast('Lowongan berhasil diposting dan sedang menunggu moderasi', 'success');
      }
      navigate('/alumni/jobs');
    } catch (error: any) {
      Toast(error.response?.data?.message || 'Gagal menyimpan lowongan', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <SmartLoader />;

  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/alumni/jobs')}
          className="flex items-center gap-2 text-xs md:text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
        >
          <FaArrowLeft />
          Kembali
        </button>
      </div>

      <div className="text-center md:text-left mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-[color:var(--text-primary)] !mb-2">
          {isEdit ? 'Revisi Lowongan' : 'Posting Lowongan Baru'}
        </h1>
        <p className="text-[color:var(--text-secondary)] text-xs md:text-sm">
          Bantu rekan alumni dan siswa dengan memberikan peluang karir
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[color:var(--bg-card)] rounded-2xl border border-[color:var(--border-color)] p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[color:var(--text-secondary)]">Judul Lowongan *</label>
              <div className="relative">
                <FaBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)]" />
                <input
                  type="text" name="title" required
                  value={formData.title} onChange={handleChange}
                  placeholder="Ex: Senior Web Developer"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] focus:border-[var(--primary)] outline-none text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[color:var(--text-secondary)]">Perusahaan / Instansi *</label>
              <div className="relative">
                <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)]" />
                <input
                  type="text" name="company" required
                  value={formData.company} onChange={handleChange}
                  placeholder="Ex: PT. Teknologi Maju"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] focus:border-[var(--primary)] outline-none text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[color:var(--text-secondary)]">Kategori *</label>
              <select
                name="category" required
                value={formData.category} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] focus:border-[var(--primary)] outline-none text-sm"
              >
                <option value="">Pilih Kategori</option>
                {JOB_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[color:var(--text-secondary)]">Tipe Pekerjaan *</label>
              <select
                name="type" required
                value={formData.type} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] focus:border-[var(--primary)] outline-none text-sm"
              >
                <option value="">Pilih Tipe</option>
                {JOB_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[color:var(--text-secondary)]">Lokasi *</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)]" />
                <input
                  type="text" name="location" required
                  value={formData.location} onChange={handleChange}
                  placeholder="Ex: Jakarta / Remote"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] focus:border-[var(--primary)] outline-none text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[color:var(--text-secondary)]">Batas Akhir (Masa Aktif) *</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)]" />
                <input
                  type="date" name="expiryDate" required
                  value={formData.expiryDate} onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] focus:border-[var(--primary)] outline-none text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[color:var(--text-secondary)]">Link Pendaftaran / Info Detail (Opsional)</label>
            <div className="relative">
              <FaLink className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)]" />
              <input
                type="url" name="applicationLink"
                value={formData.applicationLink} onChange={handleChange}
                placeholder="Ex: https://perusahaan.com/career"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] focus:border-[var(--primary)] outline-none text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[color:var(--text-secondary)]">Deskripsi Pekerjaan *</label>
            <textarea
              name="description" required rows={4}
              value={formData.description} onChange={handleChange}
              placeholder="Jelaskan peran dan tanggung jawab secara singkat..."
              className="w-full px-4 py-3 rounded-xl bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] focus:border-[var(--primary)] outline-none text-sm resize-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-[color:var(--text-secondary)]">Persyaratan (Opsional)</label>
            {requirements.map((req, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text" value={req}
                  onChange={(e) => handeRequirementChange(index, e.target.value)}
                  placeholder={`Persyaratan ${index + 1}`}
                  className="w-full px-4 py-2 rounded-lg bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] focus:border-[var(--primary)] outline-none text-sm"
                />
                <button
                  type="button" onClick={() => removeRequirement(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
            <button
              type="button" onClick={addRequirement}
              className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] hover:underline"
            >
              <FaPlus />
              Tambah Persyaratan
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit" disabled={submitLoading}
            className="flex-1 py-3 bg-[var(--primary)] text-white font-bold rounded-xl shadow-lg shadow-[var(--primary)]/20 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitLoading ? 'Memproses...' : (
              <>
                <FaSave />
                {isEdit ? 'Update & Ajukan Ulang' : 'Posting Lowongan'}
              </>
            )}
          </button>
          <button
            type="button" onClick={() => navigate('/alumni/jobs')}
            className="px-8 py-3 bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] font-bold rounded-xl hover:bg-gray-200"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostOpportunity;
