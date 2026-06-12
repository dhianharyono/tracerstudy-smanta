import { Link } from 'react-router-dom';
import { FaUserCircle, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const MutualSection = ({ mutualAlumni }: { mutualAlumni: string[] }) => {
  const navigate = useNavigate();
  return (
    <div className='card flex flex-col h-full'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100'>
            <FaUsers className='text-lg' />
          </div>
          <div>
            <h2 className='text-sm md:text-base font-bold text-[color:var(--text-primary)] !mb-0'>
              Rekan Seangkatan
            </h2>
            <p className='text-[10px] md:text-xs text-[color:var(--text-secondary)]'>
              Lulus di tahun yang sama
            </p>
          </div>
        </div>
      </div>

      <div className='flex-1 space-y-4'>
        {mutualAlumni.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full py-8 text-center'>
            <FaUserCircle className='text-4xl text-gray-200 dark:text-gray-700 mb-2' />
            <p className='text-sm text-[color:var(--text-secondary)]'>
              Tidak ada data alumni yang ditemukan
            </p>
          </div>
        ) : (
          mutualAlumni.slice(0, 5).map((person: any) => (
            <div key={person._id} className='flex items-center gap-3 group'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-[var(--primary-light)]/20 group-hover:text-[var(--primary)] transition-colors'>
                <FaUserCircle className='text-2xl' />
              </div>
              <div className='flex-1 min-w-0'>
                <h4 className='text-sm font-semibold text-[color:var(--text-primary)] truncate'>
                  {person.profile?.fullName || 'Anonymous'}
                </h4>
                <p className='text-[10px] text-[color:var(--text-tertiary)] truncate uppercase tracking-wider'>
                  {person.university?.name ||
                    person.job?.institution ||
                    'Belum ada info'}
                </p>
              </div>
            </div>
          ))
        )}
        {mutualAlumni.length > 5 && (
          <Link
            to='/alumni/mutual-alumni'
            className='block mt-2 text-center text-xs font-medium text-[color:var(--text-secondary)] hover:text-[var(--primary)] transition-colors'
          >
            +{mutualAlumni.length - 5} alumni lainnya
          </Link>
        )}
      </div>
      {mutualAlumni.length > 0 && (
        <div className='mt-auto pt-4'>
          <button
            onClick={() => navigate('/alumni/mutual-alumni')}
            className='text-xs font-semibold text-[color:var(--text-tertiary)] hover:text-[color:var(--primary)] flex items-center gap-1'
          >
            Lihat Semua Rekan →
          </button>
        </div>
      )}
    </div>
  );
};

export default MutualSection;
