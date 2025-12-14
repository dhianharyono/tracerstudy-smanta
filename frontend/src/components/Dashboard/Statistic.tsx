import {
  FaUsers,
  FaBriefcase,
  FaGraduationCap,
  FaUniversity,
} from 'react-icons/fa';

interface statsObject {
  totalAlumni: '';
  workingAlumni: '';
  studyingAlumni: '';
  universityTypes: {
    negeri: '';
    swasta: '';
    kedinasan: '';
  };
}

const Statistic = ({ stats }: { stats: statsObject }) => {
  return (
    <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mb-6 md:mb-8'>
      <div className='stat-card primary'>
        <div className='icon'>
          <FaUsers />
        </div>
        <h3>Total Alumni</h3>
        <div className='value'>{stats?.totalAlumni || 0}</div>
      </div>
      <div className='stat-card warning'>
        <div className='icon'>
          <FaBriefcase />
        </div>
        <h3>Alumni Bekerja</h3>
        <div className='value'>{stats?.workingAlumni || 0}</div>
      </div>
      <div className='stat-card info'>
        <div className='icon'>
          <FaGraduationCap />
        </div>
        <h3>Alumni Kuliah</h3>
        <div className='value'>{stats?.studyingAlumni || 0}</div>
      </div>
      <div
        className='stat-card'
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        }}
      >
        <div className='icon'>
          <FaUniversity />
        </div>
        <h3>PTN</h3>
        <div className='value'>{stats?.universityTypes?.negeri || 0}</div>
      </div>
      <div
        className='stat-card'
        style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        }}
      >
        <div className='icon'>
          <FaUniversity />
        </div>
        <h3>PTS</h3>
        <div className='value'>{stats?.universityTypes?.swasta || 0}</div>
      </div>
      <div
        className='stat-card'
        style={{
          background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        }}
      >
        <div className='icon'>
          <FaUniversity />
        </div>
        <h3>Kedinasan</h3>
        <div className='value'>{stats?.universityTypes?.kedinasan || 0}</div>
      </div>
    </div>
  );
};

export default Statistic;
