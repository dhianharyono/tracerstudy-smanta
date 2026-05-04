import University from '../models/University';
import User from '../models/User';

let isSeeded = false;

/**
 * Maintenance function for universities collection.
 * 1. Syncs unique indexes.
 * 2. Cleans up any existing duplicates.
 * 3. Syncs university names from existing alumni profiles.
 */
export const seedUniversities = async () => {
  try {
    // 1. Ensure unique index is properly built
    await University.syncIndexes().catch(err => console.error('[University-Maintenance] Sync indexes error:', err));
    
    // 2. Aggressive Cleanup of ALL duplicates in the master list
    const allUniversities = await University.find().sort({ createdAt: 1 });
    const seenNamesInMaster = new Set();
    const toDelete = [];
    
    for (const u of allUniversities) {
      const normalizedName = u.name.trim().toLowerCase();
      if (seenNamesInMaster.has(normalizedName)) {
        toDelete.push(u._id);
      } else {
        seenNamesInMaster.add(normalizedName);
      }
    }
    
    if (toDelete.length > 0) {
      console.log(`[University-Maintenance] Removing ${toDelete.length} duplicate universities...`);
      await University.deleteMany({ _id: { $in: toDelete } });
    }

    // 3. Skip the heavy sync if already done in this process lifecycle
    if (isSeeded) return;

    // 4. Sync from existing alumni data (S1, S2, S3)
    await syncAlumniUniversities();
    
    isSeeded = true;
  } catch (error) {
    console.error('[University-Maintenance] Error during university maintenance:', error);
  }
};

/**
 * Collects all universities currently mentioned in alumni profiles
 * and ensures they exist in the master University collection.
 * This makes the system fully dynamic based on actual user data.
 */
export const syncAlumniUniversities = async () => {
  try {
    console.log('[Sync] Syncing master list from alumni data...');
    
    // Get unique university names from S1, S2, and S3 fields in User collection
    const [univS1, univS2, univS3] = await Promise.all([
      User.distinct('university.name', { role: 'alumni' }),
      User.distinct('universityS2.name', { role: 'alumni' }),
      User.distinct('universityS3.name', { role: 'alumni' }),
    ]);

    // Combine, normalize, and filter out placeholders
    const allNamesFromAlumni = [...new Set([...univS1, ...univS2, ...univS3])]
      .filter(name => {
        if (!name) return false;
        const n = name.toLowerCase().trim();
        return !['-', 'null', 'undefined', 'belum ada', 'tidak ada', '.', ''].includes(n);
      })
      .map(name => name.trim());

    // Fetch existing master names for comparison
    const existingMasterDocs = await University.find({}, 'name');
    const existingMasterNames = new Set(existingMasterDocs.map(u => u.name.trim().toLowerCase()));

    let syncCount = 0;
    for (const name of allNamesFromAlumni) {
      const normalizedName = name.toLowerCase();
      
      if (!existingMasterNames.has(normalizedName)) {
        await University.create({
          name,
          isVerified: false, // Synced from user data is marked unverified for admin review
        });
        existingMasterNames.add(normalizedName); // Avoid adding duplicates within the same loop
        syncCount++;
      }
    }

    if (syncCount > 0) {
      console.log(`[Sync] Successfully added ${syncCount} new universities from alumni profiles to the master list.`);
    } else {
      console.log('[Sync] Master list is already synchronized with alumni profiles.');
    }
  } catch (error) {
    console.error('[Sync] Error syncing universities from alumni:', error);
  }
};
