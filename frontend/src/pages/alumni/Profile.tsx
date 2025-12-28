import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  formatUniversityType,
  formatEducation,
  formatAlumniStatus,
} from '../../utils/helpers';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaUser, FaPhone, FaCrown } from 'react-icons/fa';
import { GiGraduateCap } from 'react-icons/gi';
import { PiBagSimpleFill } from 'react-icons/pi';

const AlumniProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/alumni/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const InfoCard = ({ title, icon: Icon, children, colorClass }: any) => (
    <div className='rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-6 shadow-sm transition-all hover:shadow-md animate-fade-in'>
      <div className='mb-6 flex items-center gap-3 border-b border-[color:var(--border-color)] pb-4'>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}>
          <Icon className="text-xl" />
        </div>
        <h2 className='text-lg font-bold text-[color:var(--text-primary)] !mb-0'>{title}</h2>
      </div>
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {children}
      </div>
    </div>
  );

  const InfoItem = ({ label, value, isLink = false, href = '' }: any) => (
    <div className='group rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] p-4 transition-colors hover:border-[var(--primary)]/30'>
      <div className='mb-1 text-xs font-medium uppercase tracking-wider text-[color:var(--text-tertiary)]'>
        {label}
      </div>
      {isLink ? (
        <a
          href={href}
          target='_blank'
          rel='noopener noreferrer'
          className='font-semibold text-blue-600 hover:underline dark:text-blue-400 break-all'
        >
          {value}
        </a>
      ) : (
        <div className='font-semibold text-[color:var(--text-primary)] break-words'>
          {value}
        </div>
      )}
    </div>
  );

  return (
    <div className='p-4 md:p-8 space-y-8 animate-fade-in'>
      <div className='text-center md:text-left'>
        <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>Profil Saya</h1>
        <p className='text-[color:var(--text-secondary)]'>
          Informasi lengkap data diri Anda
        </p>
      </div>

      <InfoCard
        title="Informasi Personal"
        icon={FaUser}
        colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
      >
        <InfoItem label="Nama Lengkap" value={profile?.profile?.fullName || '-'} />
        <InfoItem
          label="Jenis Kelamin"
          value={profile?.profile?.gender === 'male' ? 'Laki-laki' : profile?.profile?.gender === 'female' ? 'Perempuan' : '-'}
        />
        <InfoItem label="Tahun Masuk" value={profile?.profile?.entryYear || '-'} />
        <InfoItem label="Tahun Lulus" value={profile?.profile?.graduationYear || '-'} />
        <InfoItem label="Pendidikan Terakhir" value={formatEducation(profile?.profile?.lastEducation || '')} />
        <InfoItem
          label="Status Saat Ini"
          value={formatAlumniStatus(profile?.profile?.isWorking || false, profile?.profile?.isStudying || false)}
        />
      </InfoCard>

      {profile?.university && (
        <InfoCard
          title="Perguruan Tinggi"
          icon={GiGraduateCap}
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        >
          <InfoItem label="Nama Kampus" value={profile.university.name || '-'} />
          <InfoItem label="Jenis PT" value={formatUniversityType(profile.university.type || '')} />
          <InfoItem label="Tahun Masuk" value={profile.university.entryYear || '-'} />
          <InfoItem label="Jurusan" value={profile.university.major || '-'} />
        </InfoCard>
      )}

      {profile?.job && (
        <InfoCard
          title="Pekerjaan"
          icon={PiBagSimpleFill}
          colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        >
          <InfoItem label="Posisi/Jabatan" value={profile.job.position || '-'} />
          <InfoItem label="Instansi/Perusahaan" value={profile.job.institution || '-'} />
          <InfoItem label="Nama Pekerjaan" value={profile.job.jobTitle || '-'} />
        </InfoCard>
      )}

      {profile?.socialMedia && (
        <InfoCard
          title="Media Sosial"
          icon={FaPhone}
          colorClass="bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
        >
          <div className='col-span-full mb-2'>
            <div className='flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-xl text-[10px] md:text-xs text-blue-700 dark:text-blue-300'>
              <FaCrown className='text-amber-500 shrink-0' />
              <span>Informasi sosial media di bawah ini hanya akan ditampilkan kepada siswa jika Anda mengaktifkan status <strong>Mentor</strong>.</span>
            </div>
          </div>
          {profile.socialMedia.email && (
            <InfoItem label="Email" value={profile.socialMedia.email} />
          )}
          {profile.socialMedia.linkedin && (
            <InfoItem
              label="LinkedIn"
              value={profile.socialMedia.linkedin}
              isLink
              href={profile.socialMedia.linkedin.startsWith('http') ? profile.socialMedia.linkedin : `https://${profile.socialMedia.linkedin}`}
            />
          )}
          {profile.socialMedia.instagram && (
            <InfoItem
              label="Instagram"
              value={profile.socialMedia.instagram}
              isLink
              href={profile.socialMedia.instagram.startsWith('http') ? profile.socialMedia.instagram : `https://instagram.com/${profile.socialMedia.instagram.replace('@', '')}`}
            />
          )}
        </InfoCard>
      )}
    </div>
  );
};

export default AlumniProfile;
