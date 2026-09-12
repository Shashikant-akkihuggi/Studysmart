export type User = {
  id: string;
  uid: string;
  name: string;
  displayName?: string;
  email: string;
  course?: string;
  semester?: string;
  subjects: string[];
  examDate?: Date;
  dailyStudyTime?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type MaterialCategory =
  | "notes"
  | "question_paper"
  | "syllabus"
  | "textbook"
  | "assignment"
  | "other";

export type MaterialStatus = "uploading" | "analyzing" | "completed" | "failed";

export type Material = {
  id: string;
  name: string;
  category: MaterialCategory;
  type: string;
  size: number;
  uploadDate: Date;
  status: MaterialStatus;
  subject?: string;
  uid: string;
  b2FileId?: string;
  b2Bucket?: string;
};

export type TopicPriority = "high" | "medium" | "low";

export type Topic = {
  id: string;
  name: string;
  unit?: string;
  subject: string;
  priority: TopicPriority;
  importance: number;
  progress: number;
  reason: string;
  frequency?: number;
  weak?: boolean;
  uid?: string;
};

export type ExtractedQuestion = {
  id: string;
  text: string;
  subject: string;
  unit?: string;
  topic?: string;
  frequency: number;
  marks?: number;
  difficulty: "easy" | "medium" | "hard";
  year?: string;
  priority: TopicPriority;
  uid?: string;
};

export type StudyTask = {
  id: string;
  title: string;
  topic?: string;
  subject: string;
  estimatedMinutes: number;
  difficulty: "easy" | "medium" | "hard";
  priority: TopicPriority;
  completed: boolean;
  type: "study" | "revise" | "practice" | "test";
  uid?: string;
};

export type StudyPlanDay = {
  day: number;
  date: string;
  subject: string;
  tasks: StudyTask[];
};

export type StudyPlan = {
  id: string;
  subject: string;
  examDate: Date;
  days: StudyPlanDay[];
  createdAt: Date;
  uid?: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{
    material: string;
    page?: number;
    snippet?: string;
  }>;
  timestamp: Date;
  uid?: string;
};

export type TestType = "mcq" | "short_answer" | "previous_paper" | "topic" | "mock";

export type TestQuestion = {
  id: string;
  text: string;
  options?: string[];
  correctAnswer?: number | string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
};

export type Test = {
  id: string;
  title: string;
  type: TestType;
  subject: string;
  questions: TestQuestion[];
  totalMarks: number;
  durationMinutes: number;
  uid?: string;
};

export type TestResult = {
  id: string;
  testId: string;
  score: number;
  totalMarks: number;
  correctCount: number;
  totalQuestions: number;
  weakTopics: string[];
  completedAt: Date;
  uid?: string;
};

export type Activity = {
  id: string;
  type: "question" | "test" | "topic" | "roadmap";
  title: string;
  description: string;
  timestamp: Date;
  uid?: string;
};

export type Progress = {
  overall: number;
  topicsCompleted: number;
  topicsTotal: number;
  questionsSolved: number;
  testsCompleted: number;
  averageScore: number;
  streak: number;
  roadmapCompletion: number;
  strongTopics: Topic[];
  weakTopics: Topic[];
  uid?: string;
};

export type AnalysisStep = {
  label: string;
  completed: boolean;
};

export type Unit = {
  id: string;
  name: string;
  topics: Topic[];
};

export type SubjectNotes = {
  subject: string;
  units: Unit[];
};

export type AuthError = {
  code: string;
  message: string;
};
