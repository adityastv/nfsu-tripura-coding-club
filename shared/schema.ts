import { z } from "zod";
import { pgTable, text, boolean, integer, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

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

// Test case schema for coding questions
export const testCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  isHidden: z.boolean().default(false), // Hidden test cases are not shown to users
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
  testCases: z.array(testCaseSchema).default([]), // Additional test cases
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
export type TestCase = z.infer<typeof testCaseSchema>;

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

export const insertSubmissionSchema = submissionSchema.omit({ 
  id: true, 
  isCorrect: true, 
  points: true, 
  submittedAt: true 
}).extend({
  isCorrect: z.boolean().optional(),
  points: z.number().optional(),
  submittedAt: z.coerce.date().optional()
});

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
  questionId: z.string().optional(), // Optional: if provided, will inject sample input
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

// Drizzle Table Schemas
export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "student"] }).notNull(),
  studentId: text("student_id"),
  lastLogin: timestamp("last_login"),
  isActive: boolean("is_active").notNull().default(true),
  points: integer("points").notNull().default(0),
  problemsSolved: integer("problems_solved").notNull().default(0),
});

export const questionsTable = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type", { enum: ["mcq", "coding", "ctf"] }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  // MCQ specific fields
  options: jsonb("options"), // For MCQ: {a: string, b: string, c: string, d: string}
  correctAnswer: text("correct_answer"), // For MCQ: "a"|"b"|"c"|"d"
  // Coding specific fields
  inputFormat: text("input_format"),
  outputFormat: text("output_format"),
  sampleInput: text("sample_input"),
  sampleOutput: text("sample_output"),
  testCases: jsonb("test_cases"), // Array of TestCase objects
  timeLimit: integer("time_limit"),
  memoryLimit: integer("memory_limit"),
  // CTF specific fields
  flag: text("flag"),
  hints: jsonb("hints"), // Array of strings
  // Common fields
  difficulty: text("difficulty", { enum: ["Easy", "Medium", "Hard"] }).notNull(),
  points: integer("points").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: text("created_by").notNull(),
});

export const submissionsTable = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id),
  questionId: uuid("question_id").notNull().references(() => questionsTable.id),
  questionType: text("question_type", { enum: ["mcq", "coding", "ctf"] }).notNull(),
  answer: text("answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  points: integer("points").notNull(),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  executionTime: integer("execution_time"), // in milliseconds
  memoryUsed: integer("memory_used"), // in MB
});

export const activitiesTable = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(), // Not foreign key to support system activities
  userName: text("user_name").notNull(),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Export types from Drizzle tables
export type DbUser = typeof usersTable.$inferSelect;
export type DbInsertUser = typeof usersTable.$inferInsert;
export type DbQuestion = typeof questionsTable.$inferSelect;
export type DbInsertQuestion = typeof questionsTable.$inferInsert;
export type DbSubmission = typeof submissionsTable.$inferSelect;
export type DbInsertSubmission = typeof submissionsTable.$inferInsert;
export type DbActivity = typeof activitiesTable.$inferSelect;
export type DbInsertActivity = typeof activitiesTable.$inferInsert;
