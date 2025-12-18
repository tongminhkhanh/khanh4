export interface LessonInput {
  schoolName?: string;
  teacherName?: string;
  date?: string;
  subject: string;
  grade: string;
  week: string;
  lessonName: string;
  duration: string;
  topicContext?: string;
  lessonType: string;
  teachingMethod?: string; // Added field for methodology/style
  attachments?: {
    base64: string;
    mimeType: string;
    fileName: string;
  }[];
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

export interface GenerationState {
  isLoading: boolean;
  content: string | null;
  error: string | null;
}

export enum ViewState {
  INPUT = 'INPUT',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT',
}