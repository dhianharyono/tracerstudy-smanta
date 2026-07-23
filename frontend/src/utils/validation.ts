export const isUniversityIncomplete = (obj: any) => {
  if (!obj) return true;

  const univ = obj.university || (obj.name !== undefined ? obj : null);
  const universityName = (univ?.name || obj.universityName || '').trim();
  const major = (univ?.major || obj.major || '').trim();
  
  const placeholders = ['-', '', 'null', 'undefined', 'belum ada', 'tidak ada', '.'];
  
  if (!universityName || placeholders.includes(universityName.toLowerCase())) {
    return true;
  }
  
  if (!major || placeholders.includes(major.toLowerCase())) {
    return true;
  }

  return false;
};

export const isJobIncomplete = (obj: any) => {
  if (!obj) return true;

  const job = obj.job || (obj.position !== undefined ? obj : null);
  const jobPosition = (job?.position || obj.jobPosition || '').trim();
  const jobInstitution = (job?.institution || obj.jobInstitution || '').trim();
  
  const placeholders = ['-', '', 'null', 'undefined', 'belum ada', 'tidak ada', '.'];
  
  if (!jobPosition || placeholders.includes(jobPosition.toLowerCase())) {
    return true;
  }
  
  if (!jobInstitution || placeholders.includes(jobInstitution.toLowerCase())) {
    return true;
  }

  return false;
};

export const isNameIncomplete = (obj: any) => {
  if (!obj) return true;

  const fullName = (obj.profile?.fullName || obj.fullName || '').trim();
  const placeholders = ['-', '', 'null', 'undefined', 'belum ada', 'tidak ada', '.'];

  if (!fullName || fullName.length < 3) return true;
  
  // Single word name check (full name should be at least 2 words)
  if (!fullName.includes(' ')) return true;

  if (placeholders.includes(fullName.toLowerCase())) {
    return true;
  }

  // Check if it's only symbols or numbers
  if (!/^[a-zA-Z\s.']+$/.test(fullName)) {
    return true;
  }

  // Check if it's just repeating symbols like "..." or "---"
  if (/^[.\-_ \s]+$/.test(fullName)) {
    return true;
  }

  return false;
};
