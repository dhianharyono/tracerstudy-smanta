import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  formatUniversityType,
  formatEducation,
  formatAlumniStatus,
} from '../../utils/helpers';
import { FaUser } from 'react-icons/fa';
import { GiGraduateCap } from 'react-icons/gi';
import { PiBagSimpleFill } from 'react-icons/pi';
import { IoPhonePortrait } from 'react-icons/io5';

const AlumniProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchProfile();
  }, []);

  if (loading) {
    return <div className='loading'>⏳ Loading...</div>;
  }

  return (
    <div>
      <div className='page-header'>
        <h1 className='page-title'>Profil Saya</h1>
      </div>

      <div className='card'>
        <h2
          style={{
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <FaUser
            style={{ fontSize: '25px', color: 'rgba(102, 126, 234, 0.2)' }}
          />
          <span>Informasi Personal</span>
        </h2>
        <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-tertiary)',
              borderRadius: '12px',
              border: '2px solid rgba(102, 126, 234, 0.2)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Nama Lengkap
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text-primary)',
              }}
            >
              {profile?.profile?.fullName || '-'}
            </div>
          </div>
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-tertiary)',
              borderRadius: '12px',
              border: '2px solid rgba(102, 126, 234, 0.2)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Jenis Kelamin
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text-primary)',
              }}
            >
              {profile?.profile?.gender === 'male'
                ? 'Laki-laki'
                : profile?.profile?.gender === 'female'
                ? 'Perempuan'
                : '-'}
            </div>
          </div>
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-tertiary)',
              borderRadius: '12px',
              border: '2px solid rgba(102, 126, 234, 0.2)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Tahun Masuk SMA
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text-primary)',
              }}
            >
              {profile?.profile?.entryYear || '-'}
            </div>
          </div>
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-tertiary)',
              borderRadius: '12px',
              border: '2px solid rgba(102, 126, 234, 0.2)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Tahun Lulus SMA
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text-primary)',
              }}
            >
              {profile?.profile?.graduationYear || '-'}
            </div>
          </div>
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-tertiary)',
              borderRadius: '12px',
              border: '2px solid rgba(102, 126, 234, 0.2)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Pendidikan Terakhir
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text-primary)',
              }}
            >
              {formatEducation(profile?.profile?.lastEducation || '')}
            </div>
          </div>
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-tertiary)',
              borderRadius: '12px',
              border: '2px solid rgba(102, 126, 234, 0.2)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Status
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text-primary)',
              }}
            >
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
          <h2
            style={{
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <GiGraduateCap
              style={{ fontSize: '30px', color: 'rgba(102, 126, 234, 0.2)' }}
            />
            <span>Perguruan Tinggi</span>
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
            }}
          >
            <div
              style={{
                padding: '16px',
                background:
                  'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                borderRadius: '12px',
                border: '2px solid rgba(102, 126, 234, 0.2)',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-tertiary)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Nama Kampus
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                }}
              >
                {profile.university.name || '-'}
              </div>
            </div>
            <div
              style={{
                padding: '16px',
                background:
                  'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                borderRadius: '12px',
                border: '2px solid rgba(102, 126, 234, 0.2)',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-tertiary)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Jenis
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                }}
              >
                {formatUniversityType(profile.university.type || '')}
              </div>
            </div>
            <div
              style={{
                padding: '16px',
                background:
                  'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                borderRadius: '12px',
                border: '2px solid rgba(102, 126, 234, 0.2)',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-tertiary)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Tahun Masuk
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                }}
              >
                {profile.university.entryYear || '-'}
              </div>
            </div>
            <div
              style={{
                padding: '16px',
                background:
                  'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                borderRadius: '12px',
                border: '2px solid rgba(102, 126, 234, 0.2)',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-tertiary)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Jurusan
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                }}
              >
                {profile.university.major || '-'}
              </div>
            </div>
          </div>
        </div>
      )}

      {profile?.job && (
        <div className='card'>
          <h2
            style={{
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <PiBagSimpleFill
              style={{ fontSize: '25px', color: 'rgba(102, 126, 234, 0.2)' }}
            />
            <span>Pekerjaan</span>
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
            }}
          >
            <div
              style={{
                padding: '16px',
                background:
                  'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
                borderRadius: '12px',
                border: '2px solid rgba(245, 158, 11, 0.2)',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-tertiary)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Posisi
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                }}
              >
                {profile.job.position || '-'}
              </div>
            </div>
            <div
              style={{
                padding: '16px',
                background:
                  'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
                borderRadius: '12px',
                border: '2px solid rgba(245, 158, 11, 0.2)',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-tertiary)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Instansi
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                }}
              >
                {profile.job.institution || '-'}
              </div>
            </div>
            <div
              style={{
                padding: '16px',
                background:
                  'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
                borderRadius: '12px',
                border: '2px solid rgba(245, 158, 11, 0.2)',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-tertiary)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Nama Pekerjaan
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                }}
              >
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
            <h2
              style={{
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <IoPhonePortrait
                style={{ fontSize: '30px', color: 'rgba(102, 126, 234, 0.2)' }}
              />
              <span>Media Sosial</span>
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5'>
              {profile.socialMedia.email && (
                <div
                  style={{
                    padding: '16px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '12px',
                    border: '2px solid rgba(102, 126, 234, 0.2)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-tertiary)',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Email
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      wordBreak: 'break-all',
                      overflowWrap: 'break-word',
                    }}
                  >
                    {profile.socialMedia.email}
                  </div>
                </div>
              )}
              {profile.socialMedia.linkedin && (
                <div
                  style={{
                    padding: '16px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '12px',
                    border: '2px solid rgba(102, 126, 234, 0.2)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-tertiary)',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
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
                    style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: 'var(--primary)',
                      textDecoration: 'none',
                      wordBreak: 'break-all',
                      overflowWrap: 'break-word',
                    }}
                  >
                    {profile.socialMedia.linkedin}
                  </a>
                </div>
              )}
              {profile.socialMedia.instagram && (
                <div
                  style={{
                    padding: '16px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '12px',
                    border: '2px solid rgba(102, 126, 234, 0.2)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-tertiary)',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
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
                    style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: 'var(--primary)',
                      textDecoration: 'none',
                      wordBreak: 'break-all',
                      overflowWrap: 'break-word',
                    }}
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
