import type {
  User,
  Material,
  Topic,
  ExtractedQuestion,
  StudyPlan,
  StudyTask,
  StudyPlanDay,
  ChatMessage,
  Test,
  TestQuestion,
  TestResult,
  Activity,
  Progress,
  AnalysisStep,
  SubjectNotes,
  Unit,
} from "@/types";
import { uid } from "@/lib/utils";

const EXAM_DATE = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

export const DEMO_LABEL = "DEMO DATA";

export const demoUser: User = {
  id: "u1",
  uid: "u1",
  name: "Alex Johnson",
  email: "alex@university.edu",
  course: "B.Tech Computer Science",
  semester: "Semester 5",
  subjects: ["Theory of Computation", "Computer Networks", "Database Systems"],
  examDate: EXAM_DATE,
  dailyStudyTime: 180,
};

export const demoMaterials: Material[] = [
  {
    id: "m1",
    uid: "u1",
    name: "TOC_Unit1_Notes.pdf",
    category: "notes",
    type: "PDF",
    size: 2_450_000,
    uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: "completed",
    subject: "Theory of Computation",
  },
  {
    id: "m2",
    uid: "u1",
    name: "TOC_Previous_2023.pdf",
    category: "question_paper",
    type: "PDF",
    size: 1_200_000,
    uploadDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    status: "completed",
    subject: "Theory of Computation",
  },
  {
    id: "m3",
    uid: "u1",
    name: "TOC_Previous_2022.pdf",
    category: "question_paper",
    type: "PDF",
    size: 1_100_000,
    uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: "completed",
    subject: "Theory of Computation",
  },
  {
    id: "m4",
    uid: "u1",
    name: "TOC_Syllabus.pdf",
    category: "syllabus",
    type: "PDF",
    size: 450_000,
    uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: "completed",
    subject: "Theory of Computation",
  },
  {
    id: "m5",
    uid: "u1",
    name: "TOC_Unit2_Handwritten.jpg",
    category: "notes",
    type: "Image",
    size: 3_800_000,
    uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: "analyzing",
    subject: "Theory of Computation",
  },
];

export const demoTopics: Topic[] = [
  {
    id: "t1",
    name: "Finite Automata (DFA & NFA)",
    unit: "Unit 1",
    subject: "Theory of Computation",
    priority: "high",
    importance: 92,
    progress: 65,
    reason:
      "Appeared frequently in previous question papers and is strongly represented in your notes.",
    frequency: 8,
  },
  {
    id: "t2",
    name: "Regular Expressions",
    unit: "Unit 1",
    subject: "Theory of Computation",
    priority: "high",
    importance: 88,
    progress: 40,
    reason:
      "High weightage in question papers and essential for understanding language theory.",
    frequency: 6,
  },
  {
    id: "t3",
    name: "Context Free Grammar (CFG)",
    unit: "Unit 2",
    subject: "Theory of Computation",
    priority: "high",
    importance: 85,
    progress: 25,
    reason: "Frequently asked long-answer question; appears in both 2022 & 2023 papers.",
    frequency: 7,
    weak: true,
  },
  {
    id: "t4",
    name: "Pushdown Automata (PDA)",
    unit: "Unit 2",
    subject: "Theory of Computation",
    priority: "medium",
    importance: 72,
    progress: 30,
    reason: "Moderate frequency, builds on CFG concepts.",
    frequency: 4,
    weak: true,
  },
  {
    id: "t5",
    name: "Alphabet & Strings",
    unit: "Unit 1",
    subject: "Theory of Computation",
    priority: "low",
    importance: 45,
    progress: 90,
    reason: "Foundational concepts; low marks weightage in exams.",
    frequency: 2,
  },
  {
    id: "t6",
    name: "Regular Languages",
    unit: "Unit 1",
    subject: "Theory of Computation",
    priority: "medium",
    importance: 75,
    progress: 55,
    reason: "Frequently combined with FA questions.",
    frequency: 5,
  },
  {
    id: "t7",
    name: "Turing Machines",
    unit: "Unit 4",
    subject: "Theory of Computation",
    priority: "medium",
    importance: 70,
    progress: 10,
    reason: "Important for long-answer questions; usually 1 question per paper.",
    frequency: 3,
    weak: true,
  },
];

export const demoExtractedQuestions: ExtractedQuestion[] = [
  {
    id: "q1",
    text: "Explain Deterministic Finite Automata (DFA) with a suitable example.",
    subject: "Theory of Computation",
    unit: "Unit 1",
    topic: "Finite Automata (DFA & NFA)",
    frequency: 4,
    marks: 8,
    difficulty: "medium",
    year: "2023, 2022, 2021, 2020",
    priority: "high",
  },
  {
    id: "q2",
    text: "Differentiate between NFA and DFA. Convert an NFA to DFA.",
    subject: "Theory of Computation",
    unit: "Unit 1",
    topic: "Finite Automata (DFA & NFA)",
    frequency: 4,
    marks: 10,
    difficulty: "hard",
    year: "2023, 2022, 2021, 2019",
    priority: "high",
  },
  {
    id: "q3",
    text: "What are Regular Expressions? Explain with examples.",
    subject: "Theory of Computation",
    unit: "Unit 1",
    topic: "Regular Expressions",
    frequency: 3,
    marks: 6,
    difficulty: "medium",
    year: "2023, 2022, 2021",
    priority: "high",
  },
  {
    id: "q4",
    text: "Explain Context Free Grammar and its types with examples.",
    subject: "Theory of Computation",
    unit: "Unit 2",
    topic: "Context Free Grammar (CFG)",
    frequency: 3,
    marks: 8,
    difficulty: "medium",
    year: "2023, 2022, 2020",
    priority: "high",
  },
  {
    id: "q5",
    text: "Design a Turing Machine for addition of two binary numbers.",
    subject: "Theory of Computation",
    unit: "Unit 4",
    topic: "Turing Machines",
    frequency: 2,
    marks: 10,
    difficulty: "hard",
    year: "2023, 2021",
    priority: "medium",
  },
  {
    id: "q6",
    text: "What is a Pushdown Automaton? Explain with a diagram.",
    subject: "Theory of Computation",
    unit: "Unit 2",
    topic: "Pushdown Automata (PDA)",
    frequency: 2,
    marks: 8,
    difficulty: "medium",
    year: "2022, 2021",
    priority: "medium",
  },
  {
    id: "q7",
    text: "State and prove Pumping Lemma for Regular Languages.",
    subject: "Theory of Computation",
    unit: "Unit 1",
    topic: "Regular Languages",
    frequency: 2,
    marks: 10,
    difficulty: "hard",
    year: "2023, 2020",
    priority: "medium",
  },
  {
    id: "q8",
    text: "Define Alphabet, String, Language, and their basic operations.",
    subject: "Theory of Computation",
    unit: "Unit 1",
    topic: "Alphabet & Strings",
    frequency: 1,
    marks: 4,
    difficulty: "easy",
    year: "2022",
    priority: "low",
  },
];

const mkTask = (
  title: string,
  subject: string,
  minutes: number,
  difficulty: StudyTask["difficulty"],
  priority: StudyTask["priority"],
  type: StudyTask["type"],
  topic?: string,
  completed = false
): StudyTask => ({
  id: uid(),
  title,
  subject,
  topic,
  estimatedMinutes: minutes,
  difficulty,
  priority,
  type,
  completed,
});

export const demoStudyPlanDays: StudyPlanDay[] = [
  {
    day: 1,
    date: "Today",
    subject: "Theory of Computation",
    tasks: [
      mkTask(
        "Study DFA and NFA — definitions, examples, diagrams",
        "Theory of Computation",
        60,
        "medium",
        "high",
        "study",
        "Finite Automata (DFA & NFA)",
        false
      ),
      mkTask(
        "Revise Regular Expressions identities",
        "Theory of Computation",
        30,
        "easy",
        "medium",
        "revise",
        "Regular Expressions",
        false
      ),
      mkTask(
        "Solve 15 previous questions on Unit 1",
        "Theory of Computation",
        50,
        "medium",
        "high",
        "practice",
        "Finite Automata (DFA & NFA)",
        false
      ),
      mkTask(
        "Take 10-question practice test on Unit 1",
        "Theory of Computation",
        25,
        "medium",
        "high",
        "test",
        "Unit 1",
        false
      ),
    ],
  },
  {
    day: 2,
    date: "Tomorrow",
    subject: "Theory of Computation",
    tasks: [
      mkTask(
        "Study CFG — Chomsky Hierarchy, derivations, parse trees",
        "Theory of Computation",
        70,
        "hard",
        "high",
        "study",
        "Context Free Grammar (CFG)",
        false
      ),
      mkTask(
        "Introduction to Pushdown Automata (PDA)",
        "Theory of Computation",
        45,
        "medium",
        "medium",
        "study",
        "Pushdown Automata (PDA)",
        false
      ),
      mkTask(
        "Solve previous-year CFG questions (2022, 2023)",
        "Theory of Computation",
        45,
        "hard",
        "high",
        "practice",
        "Context Free Grammar (CFG)",
        false
      ),
    ],
  },
  {
    day: 3,
    date: "Day 3",
    subject: "Theory of Computation",
    tasks: [
      mkTask(
        "Revision of Unit 1 — key concepts and formulas",
        "Theory of Computation",
        40,
        "medium",
        "medium",
        "revise",
        "Unit 1",
        false
      ),
      mkTask(
        "20-question mixed test on Unit 1 & 2",
        "Theory of Computation",
        50,
        "medium",
        "high",
        "test",
        "Unit 1 + 2",
        false
      ),
      mkTask(
        "Weak-area review: CFG problems from today's test",
        "Theory of Computation",
        30,
        "medium",
        "high",
        "revise",
        "Context Free Grammar (CFG)",
        false
      ),
    ],
  },
  {
    day: 4,
    date: "Day 4",
    subject: "Theory of Computation",
    tasks: [
      mkTask(
        "Turing Machines — formal definition, notation, examples",
        "Theory of Computation",
        80,
        "hard",
        "medium",
        "study",
        "Turing Machines",
        false
      ),
      mkTask(
        "Design 3 simple Turing Machines (copy, add, recognize)",
        "Theory of Computation",
        60,
        "hard",
        "medium",
        "practice",
        "Turing Machines",
        false
      ),
    ],
  },
  {
    day: 5,
    date: "Day 5",
    subject: "Theory of Computation",
    tasks: [
      mkTask(
        "Full Unit 2 revision",
        "Theory of Computation",
        45,
        "medium",
        "medium",
        "revise",
        "Unit 2",
        false
      ),
      mkTask(
        "Previous-year Unit 3 & 4 practice",
        "Theory of Computation",
        60,
        "hard",
        "medium",
        "practice",
        undefined,
        false
      ),
    ],
  },
  {
    day: 6,
    date: "Day 6",
    subject: "Theory of Computation",
    tasks: [
      mkTask(
        "Full syllabus rapid revision — short notes",
        "Theory of Computation",
        90,
        "medium",
        "high",
        "revise",
        undefined,
        false
      ),
      mkTask(
        "Solve full 2023 previous question paper (timed)",
        "Theory of Computation",
        120,
        "hard",
        "high",
        "test",
        undefined,
        false
      ),
    ],
  },
  {
    day: 7,
    date: "Day 7 — Exam Eve",
    subject: "Theory of Computation",
    tasks: [
      mkTask(
        "Quick review of all high-priority topics",
        "Theory of Computation",
        45,
        "easy",
        "high",
        "revise",
        undefined,
        false
      ),
      mkTask(
        "Formulae and definitions flashcard pass",
        "Theory of Computation",
        30,
        "easy",
        "medium",
        "revise",
        undefined,
        false
      ),
    ],
  },
];

export const demoStudyPlan: StudyPlan = {
  id: "sp1",
  subject: "Theory of Computation",
  examDate: EXAM_DATE,
  days: demoStudyPlanDays,
  createdAt: new Date(),
};

export const demoChatHistory: ChatMessage[] = [
  {
    id: "c1",
    role: "user",
    content: "Explain DFA and NFA in simple words.",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "c2",
    role: "assistant",
    content:
      "**DFA (Deterministic Finite Automaton)**\nThink of it as a state machine where, at any state, for every input symbol, you always know **exactly one** next state to go to. No guessing. No choices.\n\nExample: A vending machine — it knows exactly which button leads to which state.\n\n**NFA (Non-deterministic Finite Automaton)**\nIn an NFA, from a single state and input, you might have **multiple choices** of next state, or even *no* state for some inputs. It can also spontaneously change state without reading input (ε-transitions).\n\nExample: Imagine choosing between multiple possible roads — all are valid, and the NFA just 'guesses' the right path.\n\nKey insight: **DFA and NFA are equivalent in power.** Every NFA can be converted to a DFA (subset construction), though the DFA might have many more states.",
    sources: [
      { material: "TOC_Unit1_Notes.pdf", page: 24, snippet: "A DFA is a 5-tuple..." },
      { material: "TOC_Unit1_Notes.pdf", page: 31, snippet: "NFA vs DFA comparison table..." },
    ],
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10_000),
  },
  {
    id: "c3",
    role: "user",
    content: "Why is CFG considered high priority for my exam?",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "c4",
    role: "assistant",
    content:
      "Based on the **question papers you uploaded**, Context Free Grammar (CFG) has **high priority** because:\n\n1. **Frequency**: CFG questions appeared in **2023, 2022, and 2020** papers — 3 out of the last 4 years.\n2. **Marks weightage**: CFG questions typically carry **8–10 marks** each, making them high-value targets.\n3. **Syllabus coverage**: The syllabus document lists CFG as a core Unit-2 topic.\n4. **Your weak area**: Your last test showed only 42% on CFG-related problems, so practice here will yield the biggest score improvement.\n\n> Disclaimer: Priority is based on historical frequency from uploaded question papers, not a prediction of what will definitely appear.",
    sources: [
      { material: "TOC_Previous_2023.pdf", page: 3, snippet: "Q3. Explain CFG (8 marks)" },
      { material: "TOC_Previous_2022.pdf", page: 2, snippet: "Q4. Define CFG with examples (8 marks)" },
    ],
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 8_000),
  },
];

const mkTestQ = (
  text: string,
  options: string[],
  correct: number,
  topic: string,
  diff: "easy" | "medium" | "hard",
  marks = 1
): TestQuestion => ({
  id: uid(),
  text,
  options,
  correctAnswer: correct,
  topic,
  difficulty: diff,
  marks,
});

export const demoTest: Test = {
  id: "tt1",
  title: "Unit 1 Practice Test — Theory of Computation",
  type: "mcq",
  subject: "Theory of Computation",
  durationMinutes: 20,
  totalMarks: 10,
  questions: [
    mkTestQ(
      "A DFA has how many possible next states for a given input symbol?",
      ["Zero", "Exactly one", "One or more", "Depends on the alphabet"],
      1,
      "Finite Automata (DFA & NFA)",
      "easy"
    ),
    mkTestQ(
      "Which of the following is true about NFA?",
      [
        "Every NFA is also a DFA",
        "NFA can have multiple next states for one input",
        "NFA requires more memory than DFA",
        "NFA cannot recognize regular languages",
      ],
      1,
      "Finite Automata (DFA & NFA)",
      "easy"
    ),
    mkTestQ(
      "The regular expression for 'strings over {0,1} ending with 01' is:",
      ["(0|1)*01", "01(0|1)*", "(01)*", "(0|1)+01"],
      0,
      "Regular Expressions",
      "medium"
    ),
    mkTestQ(
      "Pumping Lemma is used to prove that a language is:",
      [
        "Regular",
        "Not regular",
        "Context-free",
        "Finite",
      ],
      1,
      "Regular Languages",
      "medium"
    ),
    mkTestQ(
      "If L is a regular language, which of the following is NOT necessarily regular?",
      [
        "Complement of L",
        "L* (Kleene star)",
        "Prefixes of L",
        "All strings in L multiplied by 2",
      ],
      3,
      "Regular Languages",
      "hard"
    ),
    mkTestQ(
      "Which automaton accepts exactly the regular languages?",
      ["PDA", "Turing Machine", "DFA / NFA", "Two-stack PDA"],
      2,
      "Regular Languages",
      "easy"
    ),
    mkTestQ(
      "The number of states in a minimal DFA accepting {w | w starts with 'a'} over {a,b} is:",
      ["1", "2", "3", "4"],
      1,
      "Finite Automata (DFA & NFA)",
      "medium"
    ),
    mkTestQ(
      "ε in NFA means:",
      [
        "Empty set",
        "Move without reading input",
        "Error state",
        "End of string",
      ],
      1,
      "Finite Automata (DFA & NFA)",
      "easy"
    ),
    mkTestQ(
      "Regular expression (a|b)* represents:",
      [
        "All strings with exactly one 'a' and one 'b'",
        "All strings over {a,b}",
        "All non-empty strings over {a,b}",
        "Alternating a and b",
      ],
      1,
      "Regular Expressions",
      "easy"
    ),
    mkTestQ(
      "Which of the following is FALSE?",
      [
        "Every DFA is an NFA",
        "Every NFA can be converted to an equivalent DFA",
        "NFA with ε-moves is more powerful than NFA without ε-moves",
        "DFA and NFA have same expressive power",
      ],
      2,
      "Finite Automata (DFA & NFA)",
      "hard"
    ),
  ],
};

export const demoTestResult: TestResult = {
  id: "tr1",
  testId: "tt1",
  score: 7,
  totalMarks: 10,
  correctCount: 7,
  totalQuestions: 10,
  weakTopics: ["Regular Languages", "Finite Automata (DFA & NFA)"],
  completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
};

export const demoActivities: Activity[] = [
  {
    id: "a1",
    type: "test",
    title: "Completed Unit 1 Practice Test",
    description: "Scored 7/10 — Weak areas: CFG conversions, Pumping Lemma",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "a2",
    type: "question",
    title: "Asked AI about CFG priority",
    description: 'Question: "Why is CFG considered high priority?"',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "a3",
    type: "topic",
    title: "Completed topic: Alphabet & Strings",
    description: "Marked 90% progress on foundational concepts",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 3600_000 * 3),
  },
  {
    id: "a4",
    type: "roadmap",
    title: "Roadmap task completed: DFA to NFA conversion",
    description: "45 min study session on finite automata",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    id: "a5",
    type: "question",
    title: "Asked AI about DFA vs NFA",
    description: "3 sources cited from notes",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
];

export const demoProgress: Progress = {
  overall: 38,
  topicsCompleted: 2,
  topicsTotal: 7,
  questionsSolved: 47,
  testsCompleted: 3,
  averageScore: 68,
  streak: 5,
  roadmapCompletion: 22,
  strongTopics: demoTopics.filter((t) => t.progress >= 70),
  weakTopics: demoTopics.filter((t) => t.weak || t.progress <= 30),
};

export const demoAnalysisSteps: AnalysisStep[] = [
  { label: "Reading documents", completed: true },
  { label: "Extracting topics", completed: true },
  { label: "Analyzing syllabus", completed: true },
  { label: "Identifying questions", completed: true },
  { label: "Finding repeated questions", completed: true },
  { label: "Detecting important topics", completed: false },
  { label: "Creating study roadmap", completed: false },
];

const u1Topics: Topic[] = [
  demoTopics.find((t) => t.id === "t5")!,
  demoTopics.find((t) => t.id === "t6")!,
  demoTopics.find((t) => t.id === "t1")!,
  demoTopics.find((t) => t.id === "t2")!,
];
const u2Topics: Topic[] = [
  demoTopics.find((t) => t.id === "t3")!,
  demoTopics.find((t) => t.id === "t4")!,
];
const u4Topics: Topic[] = [demoTopics.find((t) => t.id === "t7")!];

export const demoNotesUnits: Unit[] = [
  {
    id: "u1",
    name: "Unit 1 — Regular Languages & Automata",
    topics: u1Topics,
  },
  {
    id: "u2",
    name: "Unit 2 — Context-Free Languages & PDA",
    topics: u2Topics,
  },
  {
    id: "u3",
    name: "Unit 3 — Properties of Languages",
    topics: [
      {
        id: "t3a",
        name: "Pumping Lemma — CFL",
        unit: "Unit 3",
        subject: "Theory of Computation",
        priority: "medium",
        importance: 65,
        progress: 0,
        reason: "Moderate frequency, mostly 6-markers.",
      },
      {
        id: "t3b",
        name: "Closure Properties",
        unit: "Unit 3",
        subject: "Theory of Computation",
        priority: "medium",
        importance: 60,
        progress: 0,
        reason: "Usually short-answer questions.",
      },
    ],
  },
  {
    id: "u4",
    name: "Unit 4 — Turing Machines & Undecidability",
    topics: u4Topics,
  },
];

export const demoNotesAnalysis: SubjectNotes = {
  subject: "Theory of Computation",
  units: demoNotesUnits,
};

export const demoTopicFrequency = [
  { topic: "DFA & NFA", count: 8 },
  { topic: "CFG", count: 7 },
  { topic: "Regular Expressions", count: 6 },
  { topic: "Regular Languages", count: 5 },
  { topic: "PDA", count: 4 },
  { topic: "Turing Machines", count: 3 },
  { topic: "Alphabet & Strings", count: 2 },
];
