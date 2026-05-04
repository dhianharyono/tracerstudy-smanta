import University from '../models/University';
import Major from '../models/Major';
import User from '../models/User';

let isSeeded = false;

const COMMON_MAJORS = [
  'Teknik Informatika', 'Sistem Informasi', 'Teknik Komputer', 'Sains Data',
  'Manajemen', 'Akuntansi', 'Ilmu Ekonomi', 'Ekonomi Pembangunan',
  'Hukum', 'Kedokteran', 'Kedokteran Gigi', 'Farmasi',
  'Keperawatan', 'Kebidanan', 'Kesehatan Masyarakat', 'Gizi',
  'Psikologi', 'Ilmu Komunikasi', 'Hubungan Internasional', 'Sosiologi',
  'Ilmu Politik', 'Administrasi Bisnis/Negara', 'Teknik Sipil', 'Arsitektur',
  'Teknik Mesin', 'Teknik Elektro', 'Teknik Industri', 'Teknik Kimia',
  'Teknik Lingkungan', 'Teknik Perkapalan', 'Teknik Geologi', 'Teknik Geodesi',
  'Matematika', 'Fisika', 'Kimia', 'Biologi', 'Statistika', 'Aktuaria',
  'Sastra Inggris', 'Sastra Indonesia', 'Sastra Jepang', 'Sastra Arab', 'Sastra Perancis',
  'Pendidikan Guru SD (PGSD)', 'Pendidikan Bahasa Inggris', 'Pendidikan Matematika',
  'Pendidikan Jasmani', 'Seni Rupa', 'Desain Komunikasi Visual (DKV)', 'Desain Interior',
  'Musik', 'Film dan Televisi', 'Kehutanan', 'Pertanian', 'Agribisnis', 'Peternakan',
  'Perikanan', 'Teknologi Pangan', 'Manajemen Pendidikan Islam', 'Okupasi Terapi',
  'Pendidikan Biologi', 'Pendidikan Kimia', 'Pendidikan Akuntansi',
];

/**
 * Maintenance function for universities and majors.
 */
export const seedUniversities = async () => {
  try {
    // 1. Ensure unique indexes are properly built
    await Promise.all([
      University.syncIndexes(),
      Major.syncIndexes(),
    ]).catch(err => console.error('[Maintenance] Sync indexes error:', err));
    
    // 2. Cleanup Duplicates
    await cleanupDuplicates();

    // 3. Skip heavy sync if already done in this process lifecycle
    if (isSeeded) return;

    // 4. Sync from existing alumni data
    await Promise.all([
      syncAlumniUniversities(),
      syncAlumniMajors(),
    ]);
    
    isSeeded = true;
  } catch (error) {
    console.error('[Maintenance] Error:', error);
  }
};

const cleanupDuplicates = async () => {
  // Cleanup Universities
  const allUnivs = await University.find().sort({ createdAt: 1 });
  const seenUnivs = new Set();
  const univToDelete = [];
  for (const u of allUnivs) {
    const n = u.name.trim().toLowerCase();
    if (seenUnivs.has(n)) univToDelete.push(u._id);
    else seenUnivs.add(n);
  }
  if (univToDelete.length > 0) await University.deleteMany({ _id: { $in: univToDelete } });

  // Cleanup Majors
  const allMajors = await Major.find().sort({ createdAt: 1 });
  const seenMajors = new Set();
  const majorToDelete = [];
  for (const m of allMajors) {
    const n = m.name.trim().toLowerCase();
    if (seenMajors.has(n)) majorToDelete.push(m._id);
    else seenMajors.add(n);
  }
  if (majorToDelete.length > 0) await Major.deleteMany({ _id: { $in: majorToDelete } });
};

export const syncAlumniUniversities = async () => {
  try {
    console.log('[Sync] Syncing universities...');
    const [univS1, univS2, univS3] = await Promise.all([
      User.distinct('university.name', { role: 'alumni' }),
      User.distinct('universityS2.name', { role: 'alumni' }),
      User.distinct('universityS3.name', { role: 'alumni' }),
    ]);

    const allNames = [...new Set([...univS1, ...univS2, ...univS3])]
      .filter(name => name && !['-', 'null', 'undefined', '.', ''].includes(name.toLowerCase().trim()))
      .map(name => name.trim());

    const existingDocs = await University.find({}, 'name');
    const existingNames = new Set(existingDocs.map(u => u.name.trim().toLowerCase()));

    for (const name of allNames) {
      if (!existingNames.has(name.toLowerCase())) {
        await University.create({ name, isVerified: false });
        existingNames.add(name.toLowerCase());
      }
    }
  } catch (error) {
    console.error('[Sync] University error:', error);
  }
};

export const syncAlumniMajors = async () => {
  try {
    console.log('[Sync] Syncing majors...');
    
    // Get from User collection
    const [majorS1, majorS2, majorS3] = await Promise.all([
      User.distinct('university.major', { role: 'alumni' }),
      User.distinct('universityS2.major', { role: 'alumni' }),
      User.distinct('universityS3.major', { role: 'alumni' }),
    ]);

    // Combine with COMMON_MAJORS and clean up
    const allNames = [...new Set([...majorS1, ...majorS2, ...majorS3, ...COMMON_MAJORS])]
      .filter(name => name && !['-', 'null', 'undefined', '.', ''].includes(name.toLowerCase().trim()))
      .map(name => name.trim());

    const existingDocs = await Major.find({}, 'name');
    const existingNames = new Set(existingDocs.map(m => m.name.trim().toLowerCase()));

    let count = 0;
    for (const name of allNames) {
      if (!existingNames.has(name.toLowerCase())) {
        await Major.create({ 
          name, 
          isVerified: COMMON_MAJORS.includes(name) 
        });
        existingNames.add(name.toLowerCase());
        count++;
      }
    }
    if (count > 0) console.log(`[Sync] Added ${count} new majors.`);
  } catch (error) {
    console.error('[Sync] Major error:', error);
  }
};
