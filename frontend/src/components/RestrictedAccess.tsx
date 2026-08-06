import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserEdit, FaClipboardList, FaLock, FaBriefcase } from 'react-icons/fa';

interface RestrictedAccessProps {
  type: 'profile_incomplete' | 'questionnaire_incomplete' | 'university_incomplete' | 'job_incomplete' | 'name_incomplete' | 'hidden_user';
  role: 'student' | 'alumni';
}

const RestrictedAccess: React.FC<RestrictedAccessProps> = ({ type, role }) => {
  const isProfile = type === 'profile_incomplete';
  const isUniversity = type === 'university_incomplete';
  const isJob = type === 'job_incomplete';
  const isName = type === 'name_incomplete';
  const isHidden = type === 'hidden_user';

  const profileLink = role === 'student' ? '/student/profile' : '/alumni/profile';

  return (
    <div className='min-h-[60vh] flex items-center justify-center p-5 animate-fade-in'>
      <div className='max-w-lg w-full bg-[color:var(--bg-card)] rounded-3xl p-8 border border-[color:var(--border-color)] shadow-xl text-center relative overflow-hidden'>
        {/* Decorative Background Element */}
        <div className='absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--primary)] to-blue-400' />
        <div className='absolute -top-24 -right-24 w-48 h-48 bg-[var(--primary)]/5 rounded-full blur-3xl' />
        <div className='absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl' />

        {/* Icon */}
        <div className='relative mx-auto w-24 h-fit mb-2'>
          <div className='w-full h-full flex items-center justify-center rounded-3xl bg-gradient-to-tr from-[var(--primary)]/10 to-blue-500/10 text-[var(--primary)]'>
            <FaLock className='text-4xl translate-y-[-2px]' />
          </div>
        </div>

        {/* Content */}
        <h2 className='text-lg md:text-xl font-bold text-[color:var(--text-primary)] mb-3'>
          Akses Terbatas
        </h2>

        <p className='text-[color:var(--text-secondary)] mb-8 leading-relaxed text-xs md:text-sm'>
          {isHidden
            ? 'Akun Anda dibatasi oleh Administrator karena Anda belum melengkapi data diri dengan benar. Anda dapat memperbarui data diri Anda di profil, dan akses menu akan dibuka kembali oleh Administrator setelah disetujui.'
            : isName
              ? 'Maaf, nama lengkap Anda saat ini tidak sesuai dengan format yang ditentukan. Anda diwajibkan untuk memperbaiki nama lengkap Anda di profil untuk membuka akses.'
              : isProfile
                ? 'Maaf, Anda belum dapat mengakses menu ini. Anda diwajibkan untuk melengkapi data profil (Nama Lengkap, Tahun Masuk, dan Tahun Lulus) terlebih dahulu.'
                : isUniversity
                  ? 'Maaf, dashboard dan data alumni terkunci. Anda diwajibkan untuk melengkapi data Perguruan Tinggi di menu kuesioner terlebih dahulu untuk membuka akses.'
                  : isJob
                    ? 'Maaf, Anda belum dapat memposting lowongan. Anda diwajibkan telah melengkapi data Pekerjaan saat ini di kuesioner tracer study terlebih dahulu.'
                    : 'Maaf, dashboard dan data alumni terkunci. Anda diwajibkan untuk melengkapi kuesioner tracer study terlebih dahulu untuk membuka akses.'}
        </p>

        {/* Action Button */}
        <Link
          to={isHidden || isName || isProfile ? profileLink : '/alumni/questionnaire'}
          className='text-xs md:text-sm inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[var(--primary)] to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200'
        >
          {isHidden ? (
            <>
              <FaUserEdit /> Perbaiki Data Profil
            </>
          ) : isName ? (
            <>
              <FaUserEdit /> Perbaiki Nama Sekarang
            </>
          ) : isProfile ? (
            <>
              <FaUserEdit /> Lengkapi Profil Sekarang
            </>
          ) : isUniversity ? (
            <>
              <FaUserEdit /> Lengkapi Data Universitas
            </>
          ) : isJob ? (
            <>
              <FaBriefcase /> Lengkapi Data Pekerjaan
            </>
          ) : (
            <>
              <FaClipboardList /> Lengkapi Kuesioner Sekarang
            </>
          )}
        </Link>

        {/* Footer Note */}
        <p className='mt-6 text-[10px] md:text-xs text-[color:var(--text-tertiary)]'>
          <span className='inline-block w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse' />
          {isHidden ? 'Akses akan dipulihkan secara penuh setelah disetujui kembali oleh Administrator' : 'Tindakan ini diperlukan untuk melanjutkan'}
        </p>
      </div>
    </div>
  );
};

export default RestrictedAccess;
