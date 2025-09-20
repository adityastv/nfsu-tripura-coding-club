import { z } from "zod";

// User types
export const insertUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(["admin", "student"]),
  studentId: z.string().optional(),
});

export const userSchema = insertUserSchema.extend({
  id: z.string(),
  lastLogin: z.date().optional(),
  isActive: z.boolean().default(true),
  points: z.number().default(0),
  problemsSolved: z.number().default(0),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof userSchema>;

// Question types
export const mcqQuestionSchema = z.object({
  id: z.string(),
  type: z.literal("mcq"),
  title: z.string(),
  description: z.string(),
  options: z.object({
    a: z.string(),
    b: z.string(),
    c: z.string(),
    d: z.string(),
  }),
  correctAnswer: z.enum(["a", "b", "c", "d"]),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  points: z.number(),
  createdAt: z.date(),
  createdBy: z.string(),
});

export const codingQuestionSchema = z.object({
  id: z.string(),
  type: z.literal("coding"),
  title: z.string(),
  description: z.string(),
  inputFormat: z.string(),
  outputFormat: z.string(),
  sampleInput: z.string(),
  sampleOutput: z.string(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  points: z.number(),
  timeLimit: z.number(),
  memoryLimit: z.number(),
  createdAt: z.date(),
  createdBy: z.string(),
});

export const ctfQuestionSchema = z.object({
  id: z.string(),
  type: z.literal("ctf"),
  title: z.string(),
  description: z.string(),
  flag: z.string(),
  hints: z.array(z.string()).optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  points: z.number(),
  createdAt: z.date(),
  createdBy: z.string(),
});

export const questionSchema = z.union([mcqQuestionSchema, codingQuestionSchema, ctfQuestionSchema]);

export type MCQQuestion = z.infer<typeof mcqQuestionSchema>;
export type CodingQuestion = z.infer<typeof codingQuestionSchema>;
export type CTFQuestion = z.infer<typeof ctfQuestionSchema>;
export type Question = z.infer<typeof questionSchema>;

// Submission types
export const submissionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  questionId: z.string(),
  questionType: z.enum(["mcq", "coding", "ctf"]),
  answer: z.string(),
  isCorrect: z.boolean(),
  points: z.number(),
  submittedAt: z.coerce.date(),
  executionTime: z.number().optional(),
  memoryUsed: z.number().optional(),
});

export const insertSubmissionSchema = submissionSchema.omit({ id: true });

export type Submission = z.infer<typeof submissionSchema>;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

// Activity types
export const activitySchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  action: z.string(),
  timestamp: z.date(),
});

export type Activity = z.infer<typeof activitySchema>;

// Code execution types
export const codeExecutionRequestSchema = z.object({
  code: z.string().min(1, "Code cannot be empty"),
  language: z.enum(["python", "java", "cpp", "javascript"]),
  timeLimit: z.number().min(100).max(10000).default(5000), // milliseconds
  memoryLimit: z.number().min(1).max(512).default(256), // MB
});

export const codeExecutionResultSchema = z.object({
  success: z.boolean(),
  stdout: z.string(),
  stderr: z.string(),
  exitCode: z.number(),
  executionTime: z.number(), // milliseconds
  memoryUsed: z.number().optional(), // MB
  error: z.string().optional(),
});

export type CodeExecutionRequest = z.infer<typeof codeExecutionRequestSchema>;
export type CodeExecutionResult = z.infer<typeof codeExecutionResultSchema>;
