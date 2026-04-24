export const formatUniversityType = (type: string): string => {
  const typeMap: { [key: string]: string } = {
    negeri: 'Perguruan Tinggi Negeri (PTN)',
    swasta: 'Perguruan Tinggi Swasta (PTS)',
    kedinasan: 'Kedinasan',
  };
  return typeMap[type?.toLowerCase()] || type || '-';
};

export const formatEducation = (education: string): string => {
  if (!education) return '-';
  return education.charAt(0).toUpperCase() + education.slice(1).toLowerCase();
};

export const formatAlumniStatus = (
  isWorking: boolean,
  isStudying: boolean,
): string => {
  if (isWorking) {
    return '💼 Bekerja';
  }
  if (isStudying) {
    return '🎓 Kuliah';
  }
  return '⏸️ Tidak Aktif';
};

export const stripHtml = (html: string): string => {
  if (!html) return '';
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export const isStudentProfileComplete = (user: any): boolean => {
  if (!user) return false;
  return !!(
    user.profile?.fullName &&
    user.profile?.entryYear &&
    user.profile?.graduationYear
  );
};

export const getSocialUrl = (type: 'linkedin' | 'instagram', value: string) => {
  if (!value) return '#';
  const cleanValue = value.trim();
  if (cleanValue.startsWith('http://') || cleanValue.startsWith('https://')) {
    return cleanValue;
  }
  if (type === 'linkedin') {
    if (cleanValue.includes('linkedin.com')) return `https://${cleanValue}`;
    return `https://www.linkedin.com/in/${cleanValue}`;
  }
  if (type === 'instagram') {
    if (cleanValue.includes('instagram.com')) return `https://${cleanValue}`;
    return `https://instagram.com/${cleanValue.replace('@', '')}`;
  }
  return value;
};
