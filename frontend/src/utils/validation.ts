export const isUniversityIncomplete = (profile: any) => {
  if (!profile) return true;

  const universityName = profile.university?.name || '';
  const major = profile.university?.major || '';
  
  const placeholders = ['-', '', 'null', 'undefined', 'belum ada', 'tidak ada', '.'];
  
  if (!universityName.trim() || placeholders.includes(universityName.trim().toLowerCase())) {
    return true;
  }
  
  if (!major.trim() || placeholders.includes(major.trim().toLowerCase())) {
    return true;
  }

  return false;
};
export const isJobIncomplete = (profile: any) => {
  if (!profile) return true;

  const jobPosition = profile.job?.position || '';
  const jobInstitution = profile.job?.institution || '';
  
  const placeholders = ['-', '', 'null', 'undefined', 'belum ada', 'tidak ada', '.'];
  
  if (!jobPosition.trim() || placeholders.includes(jobPosition.trim().toLowerCase())) {
    return true;
  }
  
  if (!jobInstitution.trim() || placeholders.includes(jobInstitution.trim().toLowerCase())) {
    return true;
  }

  return false;
};
