export type Role = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: Role;
  targetExam: string;
  avatar: string;
}

export type PriceType = 'free' | 'paid';
export type PublishStatus = 'published' | 'draft' | 'unpublished';
export type LessonKind = 'video' | 'pdf';

export interface Lesson {
  id: string;
  title: string;
  kind: LessonKind;
  duration?: string;
  completed?: boolean;
}

export interface CourseSection {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  exam: string;
  category: string;
  instructor: string;
  thumbnail: string;
  type: PriceType;
  price?: number;
  videos: number;
  notes: number;
  duration: string;
  lessons: number;
  status: PublishStatus;
  created: string;
  enrolled?: boolean;
  progress?: number;
  completedLessons?: number;
  sections: CourseSection[];
}

export type TestStatus = 'not-started' | 'in-progress' | 'completed';

export interface TestQuestion {
  id: string;
  section: string;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
  marks: number;
  negative: number;
}

export interface Test {
  id: string;
  title: string;
  questions: number;
  duration: number;
  marks: number;
  status: TestStatus;
  score?: number;
  kind: 'full' | 'sectional' | 'current-affairs' | 'previous-year';
}

export interface TestSeries {
  id: string;
  title: string;
  description: string;
  exam: string;
  type: PriceType;
  price?: number;
  tests: Test[];
  totalQuestions: number;
  languages: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  status: PublishStatus;
  created: string;
  kind: 'full' | 'sectional' | 'current-affairs' | 'previous-year';
}

export interface NoteDoc {
  id: string;
  title: string;
  exam: string;
  subject: string;
  topic: string;
  description: string;
  pages: number;
  status: PublishStatus;
  created: string;
}

export interface CurrentAffairsDay {
  id: string;
  date: string;
  isoDate: string;
  title: string;
  highlights: string[];
  questions: number;
  minutes: number;
  status: PublishStatus;
  attempted?: boolean;
  score?: number;
}

export interface Syllabus {
  id: string;
  exam: string;
  title: string;
  description: string;
  updated: string;
  status: PublishStatus;
}

export interface PreviousPaper {
  id: string;
  exam: string;
  year: number;
  stage: string;
  shift: string;
  subject: string;
  title: string;
  status: PublishStatus;
  onlineTest?: {id: string;questions: number;duration: number;};
}

export type NotificationType =
'course' |
'test-series' |
'test' |
'notes' |
'current-affairs' |
'announcement';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  time: string;
  read: boolean;
  href: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  targetExam: string;
  courses: number;
  attempts: number;
  registered: string;
  active: boolean;
}

export interface AttemptResult {
  testId: string;
  testTitle: string;
  total: number;
  score: number;
  attempted: number;
  unanswered: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  percent: number;
  sections: {name: string;percent: number;}[];
  answers: Record<string, number | null>;
  questions: TestQuestion[];
  date: string;
}