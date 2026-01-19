
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
  MANAGEMENT_DEPT = 'Management Dept.',
  FINANCE_DEPT = 'Finance Dept.',
  MARKETING_DEPT = 'Marketing Dept.'
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
  BGS = 'বাংলাদেশ ও বিশ্বপরিচয়',
  SCIENCE_GEN = 'বিজ্ঞান',
  BANGLA = 'বাংলা',
  ECONOMICS = 'অর্থনীতি',
  MANAGEMENT = 'ব্যবস্থাপনা',
  MARKETING = 'মার্কেটিং',
  BUSINESS_ENT = 'ব্যবসায় উদ্যোগ',
  WORD = 'MS Word',
  EXCEL = 'MS Excel',
  POWERPOINT = 'PowerPoint'
}

export enum View {
  AUTH = 'auth',
  DASHBOARD = 'dashboard',
  CLASS_SELECT = 'class_select',
  SUBJECT_SELECT = 'subject_select',
  TUTOR = 'tutor',
  MCQ = 'mcq',
  PLANNER = 'planner',
  SETTINGS = 'settings',
  TRANSLATOR = 'translator',
  NEWS = 'news',
  HISTORY = 'history'
}

export type AIProvider = 'gemini';
export type ChatTheme = 'blue' | 'emerald' | 'purple' | 'orange' | 'pink' | 'white' | 'black';
export type ChatBackground = 'plain' | 'dots' | 'grid' | 'mesh' | 'paper' | 'waves';

export interface AppUser {
  uid: string;
  email: string;
  name: string;
  isPremium: boolean;
  interests: string[];
  photoURL?: string;
}

export interface TutorContext {
  classLevel?: ClassLevel;
  group?: Group;
  subject?: Subject;
  user?: AppUser | null;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
  timestamp: number;
  suggestions?: string[];
}

export interface MCQQuestion {
  id: string;
  topic: string; 
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface StudyPlan {
  dailyGoals: string[];
  weakTopics: string[];
  nextStudy: string;
  }
  
