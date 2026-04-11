export type UserRole = 'admin' | 'alumni' | 'student' | 'school';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  profile?: {
    fullName?: string;
    graduationYear?: number;
    isWorking?: boolean;
    isStudying?: boolean;
    entryYear?: number;
  };
  questionnaireCompleted?: boolean;
  badges?: any[];
  isMentor?: boolean;
  university?: {
    name?: string;
    type?: string;
    major?: string;
  };
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
