
export interface Assessment {
  id: string;
  year: string; // e.g., "2023-2024"
  grade: string;
  fall?: number;
  winter?: number;
  spring?: number;
  tcapEla?: number;
  tcapMath?: number;
  tcapScience?: number;
  tcapSocialStudies?: number;
  starReadingLevel?: string; // New field for STAR Reading
}

export interface Note {
  id: string;
  text: string;
  date: string;
}

export interface Student {
  id: string;
  name: string;
  grade: string; // Current Grade
  teacher: string;
  interests: string[];
  assessments: Assessment[];
  strategies: string[];
  notes: Note[];
  lastUpdated: string;
}

export type NewStudent = Omit<Student, 'id' | 'lastUpdated'>;
