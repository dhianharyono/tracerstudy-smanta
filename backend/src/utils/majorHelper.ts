import Major from '../models/Major';

/**
 * Ensures a major exists in the database.
 * If it doesn't exist, it creates a new unverified entry.
 */
export const ensureMajorExists = async (name: string, userId?: string) => {
  if (!name || ['-', 'null', 'undefined', 'belum ada', 'tidak ada', '.'].includes(name.toLowerCase().trim())) {
    return null;
  }
  
  const trimmedName = name.trim();
  // Case-insensitive search
  const existing = await Major.findOne({ 
    name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } 
  });
  
  if (!existing) {
    try {
      return await Major.create({
        name: trimmedName,
        addedBy: userId,
        isVerified: false
      });
    } catch (error: any) {
      // Handle race condition
      if (error.code === 11000) {
        return await Major.findOne({ name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
      }
      throw error;
    }
  }
  
  return existing;
};
