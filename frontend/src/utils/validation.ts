export const isUniversityIncomplete = (profile: any) => {
  if (!profile) return true;
  
  // If the user hasn't filled the questionnaire flag, it's definitely incomplete
  if (!profile.questionnaireCompleted) return true;

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
