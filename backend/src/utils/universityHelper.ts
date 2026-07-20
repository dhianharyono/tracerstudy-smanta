import University from '../models/University';
import User from '../models/User';
import CollegePlan from '../models/CollegePlan';

/**
 * Infers university category type based on keywords in name.
 */
export const inferUniversityType = (name: string): 'negeri' | 'swasta' | 'kedinasan' | 'luar negeri' | '' => {
  if (!name) return '';
  const n = name.toLowerCase().trim();

  // Kedinasan
  if (
    n.includes('kedinasan') ||
    n.includes('stan') ||
    n.includes('stis') ||
    n.includes('ipdn') ||
    n.includes('akpol') ||
    n.includes('akmil') ||
    n.includes('poltekip') ||
    n.includes('poltekim') ||
    n.includes('stin') ||
    n.includes('stsn') ||
    n.includes('stmkg')
  ) {
    return 'kedinasan';
  }

  // Luar Negeri
  if (
    n.includes('university of') ||
    n.includes('technology university') ||
    n.includes('college london') ||
    n.includes('harvard') ||
    n.includes('mit') ||
    n.includes('stanford') ||
    n.includes('oxford') ||
    n.includes('cambridge') ||
    n.includes('monash') ||
    n.includes('ntu') ||
    n.includes('nus') ||
    n.includes('luar negeri')
  ) {
    return 'luar negeri';
  }

  // PTN (Negeri)
  if (
    n.includes('negeri') ||
    n.includes('uin ') ||
    n.includes('iain ') ||
    n.includes('stain ') ||
    n.includes('universitas indonesia') ||
    n.includes('universitas gadjah mada') ||
    n.includes('ugm') ||
    n.includes('ui') ||
    n.includes('itb') ||
    n.includes('its') ||
    n.includes('unair') ||
    n.includes('ub') ||
    n.includes('undip') ||
    n.includes('unpad') ||
    n.includes('uns') ||
    n.includes('uny') ||
    n.includes('unimed') ||
    n.includes('unri') ||
    n.includes('unram') ||
    n.includes('unhas') ||
    n.includes('unm') ||
    n.includes('unand') ||
    n.includes('unila') ||
    n.includes('unp') ||
    n.includes('upn ') ||
    n.includes('institut teknologi bandung') ||
    n.includes('institut teknologi sepuluh')
  ) {
    return 'negeri';
  }

  // PTS (Swasta)
  if (
    n.includes('swasta') ||
    n.includes('muhammadiyah') ||
    n.includes('ahmad dahlan') ||
    n.includes('uad') ||
    n.includes('umy') ||
    n.includes('uii') ||
    n.includes('islam indonesia') ||
    n.includes('atma jaya') ||
    n.includes('telkom') ||
    n.includes('binus') ||
    n.includes('bina nusantara') ||
    n.includes('trisakti') ||
    n.includes('tarumanagara') ||
    n.includes('gunadarma') ||
    n.includes('mercu buana') ||
    n.includes('sanata dharma') ||
    n.includes('pelita harapan') ||
    n.includes('uph') ||
    n.includes('al azhar') ||
    n.includes('unika') ||
    n.includes('ukdw') ||
    n.includes('soegijapranata') ||
    n.includes('politeknik') ||
    n.includes('poltek') ||
    n.includes('stikes') ||
    n.includes('stie') ||
    n.includes('stmik') ||
    n.includes('akbid') ||
    n.includes('akper')
  ) {
    return 'swasta';
  }

  return '';
};

/**
 * Ensures a university exists in the database.
 * If it doesn't exist, it creates a new unverified entry with inferred type.
 */
export const ensureUniversityExists = async (name: string, userId?: string, type?: string) => {
  if (!name || ['-', 'null', 'undefined', 'belum ada', 'tidak ada', '.'].includes(name.toLowerCase().trim())) {
    return null;
  }
  
  const trimmedName = name.trim();
  const inferredType = type || inferUniversityType(trimmedName);

  // Case-insensitive search
  const existing = await University.findOne({ 
    name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } 
  });
  
  if (!existing) {
    try {
      return await University.create({
        name: trimmedName,
        type: inferredType || '',
        addedBy: userId,
        isVerified: false
      });
    } catch (error: any) {
      // Handle race condition if two users add the same university simultaneously
      if (error.code === 11000) {
        return await University.findOne({ name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
      }
      throw error;
    }
  }
  
  // If existing record has no type, but we now have type or inferredType, update it
  if (!existing.type && inferredType) {
    existing.type = inferredType as any;
    await existing.save();
  }

  return existing;
};

/**
 * Automatically syncs any university names referenced in User (alumni) or CollegePlan (students)
 * into the master University collection if missing.
 */
export const syncAllReferencedUniversities = async () => {
  try {
    const [u1Names, u2Names, u3Names, planNames] = await Promise.all([
      User.distinct('university.name', { role: 'alumni' }),
      User.distinct('universityS2.name', { role: 'alumni' }),
      User.distinct('universityS3.name', { role: 'alumni' }),
      CollegePlan.distinct('targetUniversity'),
    ]);

    const ignoreValues = ['-', 'null', 'undefined', 'belum ada', 'tidak ada', '.'];

    const allNames = Array.from(
      new Set(
        [...u1Names, ...u2Names, ...u3Names, ...planNames]
          .filter((n) => typeof n === 'string' && (n as string).trim() !== '' && !ignoreValues.includes((n as string).toLowerCase().trim()))
          .map((n) => (n as string).trim())
      )
    );

    for (const name of allNames) {
      await ensureUniversityExists(name);
    }
  } catch (error) {
    console.error('Error syncing referenced universities:', error);
  }
};
