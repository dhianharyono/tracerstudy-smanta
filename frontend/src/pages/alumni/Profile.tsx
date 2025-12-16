import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  formatUniversityType,
  formatEducation,
  formatAlumniStatus,
} from '../../utils/helpers';
import { FaSpinner, FaUser } from 'react-icons/fa';
import { GiGraduateCap } from 'react-icons/gi';
import { PiBagSimpleFill } from 'react-icons/pi';
import { IoPhonePortrait } from 'react-icons/io5';

const AlumniProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  console.log(loading);

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
    <div className='p-4 sm:p-6 lg:p-8 animate-fadeIn'>
      <div className='page-header'>
        <h1 className='text-xl md:text-2xl'>Profil Saya</h1>
      </div>

      <div className='card'>
        <h2 className='mb-6 flex items-center gap-3 text-lg md:text-xl'>
          <FaUser className='text-[25px] text-purple-300/20' />
          <span>Informasi Personal</span>
        </h2>
        <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
          <div className='p-4 bg-tertiary rounded-xl border-2 border-solid border-purple-300/20'>
            <div className='text-[10px] md:text-xs text-tertiary mb-2 uppercase tracking-wider'>
              Nama Lengkap
            </div>
            <div className='text-sm md:text-lg font-semibold text-primary'>
              {profile?.profile?.fullName || '-'}
            </div>
          </div>

          <div className='p-4 bg-tertiary rounded-xl border-2 border-solid border-purple-300/20'>
            <div className='text-[10px] md:text-xs text-tertiary mb-2 uppercase tracking-wider'>
              Jenis Kelamin
            </div>
            <div className='text-sm md:text-lg font-semibold text-primary'>
              {profile?.profile?.gender === 'male'
                ? 'Laki-laki'
                : profile?.profile?.gender === 'female'
                ? 'Perempuan'
                : '-'}
            </div>
          </div>

          <div className='p-4 bg-tertiary rounded-xl border-2 border-solid border-purple-300/20'>
            <div className='text-[10px] md:text-xs text-tertiary mb-2 uppercase tracking-wider'>
              Tahun Masuk SMA
            </div>
            <div className='text-sm md:text-lg font-semibold text-primary'>
              {profile?.profile?.entryYear || '-'}
            </div>
          </div>

          <div className='p-4 bg-tertiary rounded-xl border-2 border-solid border-purple-300/20'>
            <div className='text-[10px] md:text-xs text-tertiary mb-2 uppercase tracking-wider'>
              Tahun Lulus SMA
            </div>
            <div className='text-sm md:text-lg font-semibold text-primary'>
              {profile?.profile?.graduationYear || '-'}
            </div>
          </div>

          <div className='p-4 bg-tertiary rounded-xl border-2 border-solid border-purple-300/20'>
            <div className='text-[10px] md:text-xs text-tertiary mb-2 uppercase tracking-wider'>
              Pendidikan Terakhir
            </div>
            <div className='text-sm md:text-lg font-semibold text-primary'>
              {formatEducation(profile?.profile?.lastEducation || '')}
            </div>
          </div>

          <div className='p-4 bg-tertiary rounded-xl border-2 border-solid border-purple-300/20'>
            <div className='text-[10px] md:text-xs text-tertiary mb-2 uppercase tracking-wider'>
              Status
            </div>
            <div className='text-sm md:text-lg font-semibold text-primary'>
              {formatAlumniStatus(
                profile?.profile?.isWorking || false,
                profile?.profile?.isStudying || false
              )}
            </div>
          </div>
        </div>
      </div>

      {profile?.university && (
        <div className='card'>
          <h2 className='mb-6 flex items-center gap-3 text-lg md:text-xl'>
            <GiGraduateCap className='text-[25px] text-purple-300/20' />
            <span>Perguruan Tinggi</span>
          </h2>
          <div className='grid grid-cols-profile-auto gap-5'>
            <div
              className='p-4 rounded-xl border-2 border-solid border-purple-300/20'
              style={{
                background:
                  'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              }}
            >
              <div className='text-[10px] md:text-xs text-tertiary mb-2 uppercase tracking-wider'>
                Nama Kampus
              </div>
              <div className='text-sm md:text-lg font-semibold text-primary'>
                {profile.university.name || '-'}
              </div>
            </div>

            <div
              className='p-4 rounded-xl border-2 border-solid border-purple-300/20'
              style={{
                background:
                  'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              }}
            >
              <div className='text-[10px] md:text-xs text-tertiary mb-2 uppercase tracking-wider'>
                Jenis
              </div>
              <div className='text-sm md:text-lg font-semibold text-primary'>
                {formatUniversityType(profile.university.type || '')}
              </div>
            </div>

            <div
              className='p-4 rounded-xl border-2 border-solid border-purple-300/20'
              style={{
                background:
                  'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              }}
            >
              <div className='text-[10px] md:text-xs text-tertiary mb-2 uppercase tracking-wider'>
                Tahun Masuk
              </div>
              <div className='text-sm md:text-lg font-semibold text-primary'>
                {profile.university.entryYear || '-'}
              </div>
            </div>

            <div
              className='p-4 rounded-xl border-2 border-solid border-purple-300/20'
              style={{
                background:
                  'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              }}
            >
              <div className='text-[10px] md:text-xs text-tertiary mb-2 uppercase tracking-wider'>
                Jurusan
              </div>
              <div className='text-sm md:text-lg font-semibold text-primary'>
                {profile.university.major || '-'}
              </div>
            </div>
          </div>
        </div>
      )}

      {profile?.job && (
        <div className='card'>
          <h2 className='mb-6 flex items-center gap-3 text-lg md:text-xl'>
            <PiBagSimpleFill className='text-[25px] text-purple-300/20' />
            <span>Pekerjaan</span>
          </h2>
          <div className='grid grid-cols-profile-auto gap-5'>
            <div
              className='p-4 rounded-xl border-2 border-solid border-amber-500/20'
              style={{
                background:
                  'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
              }}
            >
              <div className='text-[10px] md:text-xs text-tertiary mb-2 uppercase tracking-wider'>
                Posisi
              </div>
              <div className='text-sm md:text-lg font-semibold text-primary'>
                {profile.job.position || '-'}
              </div>
            </div>

            <div
              className='p-4 rounded-xl border-2 border-solid border-amber-500/20'
              style={{
                background:
                  'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
              }}
            >
              <div className='text-[10px] md:text-xs text-tertiary mb-2 uppercase tracking-wider'>
                Instansi
              </div>
              <div className='text-sm md:text-lg font-semibold text-primary'>
                {profile.job.institution || '-'}
              </div>
            </div>

            <div
              className='p-4 rounded-xl border-2 border-solid border-amber-500/20'
              style={{
                background:
                  'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
              }}
            >
              <div className='text-[10px] md:text-xs text-tertiary mb-2 uppercase tracking-wider'>
                Nama Pekerjaan
              </div>
              <div className='text-sm md:text-lg font-semibold text-primary'>
                {profile.job.jobTitle || '-'}
              </div>
            </div>
          </div>
        </div>
      )}

      {profile?.socialMedia &&
        (profile.socialMedia.email ||
          profile.socialMedia.linkedin ||
          profile.socialMedia.instagram) && (
          <div className='card'>
            <h2 className='mb-6 flex items-center gap-3 text-lg md:text-xl'>
              <IoPhonePortrait className='text-[25px] text-purple-300/20' />
              <span>Media Sosial</span>
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5'>
              {profile.socialMedia.email && (
                <div className='p-4 bg-tertiary rounded-xl border-2 border-solid border-purple-300/20'>
                  <div className='text-[10px] md:text-xs text-tertiary mb-2 uppercase tracking-wider'>
                    Email
                  </div>
                  <div className='text-sm md:text-lg font-semibold text-primary break-all'>
                    {profile.socialMedia.email}
                  </div>
                </div>
              )}
              {profile.socialMedia.linkedin && (
                <div className='p-4 bg-tertiary rounded-xl border-2 border-solid border-purple-300/20'>
                  <div className='text-[10px] md:text-xs text-tertiary mb-2 uppercase tracking-wider'>
                    LinkedIn
                  </div>
                  <a
                    href={
                      profile.socialMedia.linkedin.startsWith('http')
                        ? profile.socialMedia.linkedin
                        : `https://${profile.socialMedia.linkedin}`
                    }
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sm md:text-lg font-semibold text-primary no-underline break-all'
                  >
                    {profile.socialMedia.linkedin}
                  </a>
                </div>
              )}
              {profile.socialMedia.instagram && (
                <div className='p-4 bg-tertiary rounded-xl border-2 border-solid border-purple-300/20'>
                  <div className='text-[10px] md:text-xs text-tertiary mb-2 uppercase tracking-wider'>
                    Instagram
                  </div>
                  <a
                    href={
                      profile.socialMedia.instagram.startsWith('http')
                        ? profile.socialMedia.instagram
                        : `https://instagram.com/${profile.socialMedia.instagram.replace(
                            '@',
                            ''
                          )}`
                    }
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sm md:text-lg font-semibold text-primary no-underline break-all'
                  >
                    {profile.socialMedia.instagram}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default AlumniProfile;
