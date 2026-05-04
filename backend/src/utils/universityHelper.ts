import University from '../models/University';

/**
 * Ensures a university exists in the database.
 * If it doesn't exist, it creates a new unverified entry.
 */
export const ensureUniversityExists = async (name: string, userId?: string, type?: string) => {
  if (!name || ['-', 'null', 'undefined', 'belum ada', 'tidak ada', '.'].includes(name.toLowerCase().trim())) {
    return null;
  }
  
  const trimmedName = name.trim();
  // Case-insensitive search
  const existing = await University.findOne({ 
    name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } 
  });
  
  if (!existing) {
    try {
      return await University.create({
        name: trimmedName,
        type: type || '',
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
  
  return existing;
};
