import User from '../models/User';
import CollegePlan from '../models/CollegePlan';
import Job from '../models/Job';

export interface MatchTargetInput {
  targetUniversity?: string;
  targetMajor?: string;
  rumpun?: string;
  entryPath?: string;
  readinessStatus?: string;
}

interface PositionCount {
  title: string;
  count: number;
  percentage: number;
}

export interface MatchStats {
  alumniTotal: number;
  exactAlumni: number;
  sameMajorAlumni: number;
  mentors: number;
  peminat: number;
  topInstitutions: string[];
  careerOutcomes: PositionCount[];
}

export interface MatchContextResult {
  context: string;
  stats: MatchStats;
  hasData: boolean;
}

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const clean = (value?: string | null): string =>
  typeof value === 'string' ? value.trim() : '';

const safeName = (value?: string | null): string => {
  const name = clean(value);
  return name && !['-', 'null', 'undefined'].includes(name.toLowerCase()) ? name : '';
};

const countTop = (
  values: string[],
  limit = 5,
): { value: string; count: number }[] => {
  const map = new Map<string, number>();
  values.forEach((raw) => {
    const key = safeName(raw);
    if (!key) return;
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

const unique = (values: string[], limit: number): string[] =>
  Array.from(new Set(values.filter(Boolean))).slice(0, limit);

/**
 * Builds a compact, privacy-safe context about SMANTA alumni for a given
 * target university/major. Only academic and career facts are included;
 * contact data (email, social media, usernames) never leaves the database.
 */
export const buildMatchContext = async (
  input: MatchTargetInput,
): Promise<MatchContextResult> => {
  const targetUniversity = clean(input.targetUniversity);
  const targetMajor = clean(input.targetMajor);

  const univRegex = targetUniversity
    ? new RegExp(escapeRegex(targetUniversity), 'i')
    : null;
  const majorRegex = targetMajor
    ? new RegExp(escapeRegex(targetMajor), 'i')
    : null;

  const baseAlumniFilter: Record<string, unknown> = {
    role: 'alumni',
    isHidden: { $ne: true },
  };

  const exactFilter: Record<string, unknown> = { ...baseAlumniFilter };
  if (univRegex) exactFilter['university.name'] = univRegex;
  if (majorRegex) exactFilter['university.major'] = majorRegex;

  const sameMajorFilter: Record<string, unknown> = { ...baseAlumniFilter };
  if (majorRegex) sameMajorFilter['university.major'] = majorRegex;

  const ALUMNI_FIELDS =
    'profile.fullName profile.graduationYear profile.isWorking profile.isStudying ' +
    'university.name university.type university.major university.entryPath university.graduationYear ' +
    'universityS2.name universityS2.major job.position job.jobTitle job.institution isMentor';

  const [exactAlumni, sameMajorAlumni, targetPlan, sameMajorPlans, jobCategories] =
    await Promise.all([
      univRegex || majorRegex
        ? User.find(exactFilter).select(ALUMNI_FIELDS).limit(80).lean()
        : Promise.resolve([]),
      majorRegex
        ? User.find(sameMajorFilter).select(ALUMNI_FIELDS).limit(150).lean()
        : Promise.resolve([]),
      univRegex || majorRegex
        ? CollegePlan.countDocuments({
            ...(univRegex ? { targetUniversity: univRegex } : {}),
            ...(majorRegex ? { targetMajor: majorRegex } : {}),
          })
        : Promise.resolve(0),
      majorRegex
        ? CollegePlan.aggregate([
            { $match: { targetMajor: majorRegex } },
            {
              $group: {
                _id: { university: '$targetUniversity', major: '$targetMajor' },
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: 6 },
          ])
        : Promise.resolve([]),
      Job.aggregate([
        { $match: { status: 'approved', expiryDate: { $gte: new Date() } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

  // Alumni from other universities that took the same major: the best source
  // for alternative-campus recommendations.
  const alternativeAgg = majorRegex
    ? await User.aggregate([
        {
          $match: {
            role: 'alumni',
            isHidden: { $ne: true },
            'university.name': { $exists: true, $ne: '' },
            'university.major': majorRegex,
          },
        },
        {
          $group: {
            _id: '$university.name',
            alumni: { $sum: 1 },
            mentors: { $sum: { $cond: ['$isMentor', 1, 0] } },
            positions: {
              $push: { $ifNull: ['$job.position', '$job.jobTitle'] },
            },
            majors: { $addToSet: '$university.major' },
          },
        },
        { $sort: { alumni: -1 } },
        { $limit: 10 },
      ])
    : [];

  const isSameUniversity = (name: string): boolean =>
    Boolean(targetUniversity) &&
    name.toLowerCase().trim() === targetUniversity.toLowerCase().trim();

  const alternatives = alternativeAgg
    .filter((item) => !isSameUniversity(String(item._id || '')))
    .slice(0, 5)
    .map((item) => ({
      university: item._id as string,
      alumniCount: item.alumni as number,
      mentorCount: item.mentors as number,
      majors: (item.majors || []).filter(Boolean).slice(0, 3),
      positions: unique(
        (item.positions || [])
          .map((p: string | null) => safeName(p))
          .filter(Boolean),
        3,
      ),
    }));

  const careerSource = exactAlumni.length > 0 ? exactAlumni : sameMajorAlumni;
  const positions = careerSource.map(
    (alumni: any) => alumni?.job?.position || alumni?.job?.jobTitle || '',
  );
  const institutions = careerSource.map(
    (alumni: any) => alumni?.job?.institution || '',
  );
  const totalPositions = positions.filter((p: string) => safeName(p)).length;
  const careerOutcomes: PositionCount[] = countTop(positions as string[], 5).map(
    (item) => ({
      title: item.value,
      count: item.count,
      percentage:
        totalPositions > 0 ? Math.round((item.count / totalPositions) * 100) : 0,
    }),
  );

  const mentors = (careerSource as any[])
    .filter((alumni) => alumni?.isMentor)
    .slice(0, 6)
    .map((alumni) => ({
      name: alumni?.profile?.fullName || 'Alumni SMANTA',
      graduationYear: alumni?.profile?.graduationYear || null,
      university: safeName(alumni?.university?.name),
      major: safeName(alumni?.university?.major),
      position: safeName(alumni?.job?.position || alumni?.job?.jobTitle),
      institution: safeName(alumni?.job?.institution),
    }));

  const alumniSamples = (careerSource as any[]).slice(0, 12).map((alumni) => ({
    graduationYear: alumni?.profile?.graduationYear || null,
    university: safeName(alumni?.university?.name),
    major: safeName(alumni?.university?.major),
    entryPath: safeName(alumni?.university?.entryPath),
    position: safeName(alumni?.job?.position || alumni?.job?.jobTitle),
    institution: safeName(alumni?.job?.institution),
    isMentor: Boolean(alumni?.isMentor),
  }));

  const majorsAtTargetUniversity = unique(
    (exactAlumni as any[])
      .map((alumni) => safeName(alumni?.university?.major))
      .filter(Boolean),
    6,
  );

  const alternativeMajors = unique(
    (sameMajorAlumni as any[]).map((alumni) => alumni?.universityS2?.major || ''),
    4,
  ).filter((major) => !majorRegex || !majorRegex.test(major));

  const stats: MatchStats = {
    alumniTotal: sameMajorAlumni.length || exactAlumni.length,
    exactAlumni: exactAlumni.length,
    sameMajorAlumni: sameMajorAlumni.length,
    mentors: mentors.length,
    peminat: targetPlan,
    topInstitutions: countTop(institutions as string[], 5).map((i) => i.value),
    careerOutcomes,
  };

  const contextPayload = {
    target: {
      university: targetUniversity || null,
      major: targetMajor || null,
      rumpun: input.rumpun || null,
      entryPath: input.entryPath || null,
      readiness: input.readinessStatus || null,
    },
    dataCounts: {
      alumniExactMatch: stats.exactAlumni,
      alumniSameMajorAllCampuses: stats.sameMajorAlumni,
      mentorsAvailable: stats.mentors,
      studentsWithSameTarget: stats.peminat,
    },
    careerOutcomes,
    topInstitutions: stats.topInstitutions,
    alumniSamples,
    mentors,
    majorsAtTargetUniversity,
    alternativeUniversities: alternatives,
    mostRequestedTargetsForThisMajor: (sameMajorPlans as any[]).map((plan) => ({
      university: plan?._id?.university || null,
      major: plan?._id?.major || null,
      students: plan?.count || 0,
    })),
    alternativeMajorsFromAlumniS2: alternativeMajors,
    jobMarketCategories: (jobCategories as any[]).map((category) => ({
      category: category?._id || null,
      openJobs: category?.count || 0,
    })),
    generatedAt: new Date().toISOString(),
  };

  return {
    context: JSON.stringify(contextPayload, null, 2),
    stats,
    hasData: stats.alumniTotal > 0,
  };
};
