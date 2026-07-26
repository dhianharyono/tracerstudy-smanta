import User from '../models/User';

/**
 * Normalizes a full name for comparison:
 * - Lowercase
 * - Removes non-alphanumeric characters (except spaces)
 * - Trims and replaces multiple spaces with a single space
 */
export function normalizeName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits normalized name into token words (length >= 2)
 */
export function getNameTokens(normName: string): string[] {
  if (!normName) return [];
  return normName.split(' ').filter(t => t.length >= 2);
}

/**
 * Calculates Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Returns string similarity ratio between 0 and 1
 */
function nameSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(a, b);
  return 1 - dist / maxLen;
}

/**
 * Determines if two names are duplicates / near-duplicates:
 * 1. Exact normalized match ("tiara aning" === "tiara aning")
 * 2. Multi-word subset match ("tiara aning" [2 words] contained in "tiara aning nugraheni")
 * 3. High fuzzy string similarity (Levenshtein ratio >= 0.85)
 */
export function areNamesDuplicate(nameA: string, nameB: string): boolean {
  const normA = normalizeName(nameA);
  const normB = normalizeName(nameB);

  if (!normA || !normB) return false;

  // 1. Exact match
  if (normA === normB) return true;

  const tokensA = getNameTokens(normA);
  const tokensB = getNameTokens(normB);

  // 2. Multi-word subset match
  // e.g. "Tiara Aning" (2 tokens) vs "Tiara Aning Nugraheni" (3 tokens)
  if (tokensA.length >= 2 && tokensA.every(t => tokensB.includes(t))) {
    return true;
  }
  if (tokensB.length >= 2 && tokensB.every(t => tokensA.includes(t))) {
    return true;
  }

  // 3. High fuzzy similarity (for minor typos, e.g. "Nugraheni" vs "Nugraheny")
  if (Math.min(normA.length, normB.length) >= 5) {
    if (nameSimilarity(normA, normB) >= 0.85) {
      return true;
    }
  }

  return false;
}

/**
 * Retrieves User IDs and duplicate normalized names for duplicate names (fuzzy/partial match)
 */
export async function getDuplicateNameUserIds(role: 'alumni' | 'student'): Promise<{
  duplicateUserIds: Set<string>;
  dupNameSet: Set<string>;
}> {
  const users = await User.find(
    { role, 'profile.fullName': { $exists: true, $ne: '' } },
    '_id profile.fullName'
  ).lean();

  const duplicateUserIds = new Set<string>();
  const dupNameSet = new Set<string>();

  // In-memory token index to optimize candidate pairing
  const tokenMap = new Map<string, typeof users>();

  for (const u of users) {
    const fn = (u as any).profile?.fullName || '';
    const norm = normalizeName(fn);
    if (!norm) continue;
    const tokens = getNameTokens(norm);

    for (const t of tokens) {
      let list = tokenMap.get(t);
      if (!list) {
        list = [];
        tokenMap.set(t, list);
      }
      list.push(u);
    }
  }

  for (let i = 0; i < users.length; i++) {
    const u1 = users[i];
    const id1 = u1._id.toString();
    const fn1 = (u1 as any).profile?.fullName || '';
    const norm1 = normalizeName(fn1);
    if (!norm1) continue;

    const tokens1 = getNameTokens(norm1);
    const candidateMap = new Map<string, typeof users[0]>();

    for (const t of tokens1) {
      const candidates = tokenMap.get(t);
      if (candidates) {
        for (const c of candidates) {
          if (c._id.toString() !== id1) {
            candidateMap.set(c._id.toString(), c);
          }
        }
      }
    }

    for (const u2 of candidateMap.values()) {
      const id2 = u2._id.toString();
      const fn2 = (u2 as any).profile?.fullName || '';
      if (areNamesDuplicate(fn1, fn2)) {
        duplicateUserIds.add(id1);
        duplicateUserIds.add(id2);
        dupNameSet.add(norm1);
        dupNameSet.add(normalizeName(fn2));
      }
    }
  }

  return { duplicateUserIds, dupNameSet };
}

/**
 * Retrieves User IDs and duplicate email strings for duplicate emails
 */
export async function getDuplicateEmailUserIds(role: 'alumni' | 'student'): Promise<{
  duplicateUserIds: Set<string>;
  dupEmailSet: Set<string>;
}> {
  const duplicateEmails = await User.aggregate([
    { $match: { role, email: { $exists: true, $ne: '' } } },
    { $group: { _id: { $toLower: '$email' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);
  const emailList = duplicateEmails.map(d => d._id);

  const usersWithDupEmail = await User.find(
    { role, $expr: { $in: [{ $toLower: '$email' }, emailList] } },
    '_id email'
  ).lean();

  const duplicateUserIds = new Set(usersWithDupEmail.map(u => u._id.toString()));
  const dupEmailSet = new Set(emailList);
  return { duplicateUserIds, dupEmailSet };
}
