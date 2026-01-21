
export enum ClassLevel {
  C5 = 'Class 5',
  C6 = 'Class 6',
  C7 = 'Class 7',
  C8 = 'Class 8',
  C9 = 'Class 9',
  C10 = 'Class 10',
  C11 = 'Class 11',
  C12 = 'Class 12',
  BBA = 'BBA (Honours)'
}

export enum Group {
  SCIENCE = 'বিজ্ঞান (Science)',
  COMMERCE = 'ব্যবসায় শিক্ষা (Commerce)',
  ARTS = 'মানবিক (Arts)',
  GENERAL = 'সাধারণ (General)',
  ACCOUNTING_DEPT = 'Accounting Dept.',
  MANAGEMENT_DEPT = 'Management Dept.'
}

export enum Subject {
  MATH = 'গণিত',
  ICT = 'আইসিটি',
  ACCOUNTING = 'হিসাববিজ্ঞান',
  FINANCE = 'ফিন্যান্স',
  ENGLISH = 'ইংরেজি',
  GK = 'সাধারণ জ্ঞান',
  PHYSICS = 'পদার্থবিজ্ঞান',
  CHEMISTRY = 'রসায়ন',
  BIOLOGY = 'জীববিজ্ঞান',
  BANGLA = 'বাংলা',
  WORD = 'MS Word',
  EXCEL = 'MS Excel',
  POWERPOINT = 'PowerPoint'
}

export enum View {
  DASHBOARD = 'dashboard',
  TUTOR = 'tutor',
  SETTINGS = 'settings',
  TRANSLATOR = 'translator',
  NEWS = 'news',
  HISTORY = 'history',
  MCQ = 'mcq',
  PLANNER = 'planner'
}

export interface AppUser {
  name: string;
  department: string;
  college: string;
  // Added fields to support authentication and cloud sync from Auth.tsx
  uid?: string;
  email?: string;
  isPremium?: boolean;
  interests?: string[];
  photoURL?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  suggestions?: string[];
}

export interface TutorContext {
  classLevel: ClassLevel;
  group: Group;
  subject: Subject;
  user: AppUser;
}

export interface MCQQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

export interface StudyPlan {
  dailyGoals: string[];
  weakTopics: string[];
  nextStudy: string;
}
