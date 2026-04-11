export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'alumni' | 'student';
  profile?: {
    fullName?: string;
    graduationYear?: number;
    isWorking?: boolean;
    isStudying?: boolean;
  };
  questionnaireCompleted?: boolean;
  badges?: any[];
}

export interface UniversityStats {
  _id: string;
  count: number;
}

export interface MajorStats {
  _id: string;
  count: number;
  universities: string[];
}

export interface LandingPageStats {
  totalAlumni: number;
  workingAlumni: number;
  studyingAlumni: number;
  totalConnectedUniversities: number;
  ptnCount: number;
  ptsCount: number;
  kedinasanCount: number;
  topUniversities: UniversityStats[];
  topMajors: MajorStats[];
}

export interface Testimonial {
  _id: string;
  kritik?: string;
  saran?: string;
  user?: {
    role: string;
  };
}
