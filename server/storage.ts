import { type User, type InsertUser, type Question, type Submission, type InsertSubmission, type Activity } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  
  // Question operations
  createQuestion(question: Omit<Question, 'id' | 'createdAt'>): Promise<Question>;
  getQuestion(id: string): Promise<Question | undefined>;
  getAllQuestions(): Promise<Question[]>;
  updateQuestion(id: string, updates: Partial<Question>): Promise<Question | undefined>;
  deleteQuestion(id: string): Promise<boolean>;
  
  // Submission operations
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmissionsByUser(userId: string): Promise<Submission[]>;
  getSubmissionsByQuestion(questionId: string): Promise<Submission[]>;
  getAllSubmissions(): Promise<Submission[]>;
  
  // Activity operations
  addActivity(activity: Omit<Activity, 'id'>): Promise<Activity>;
  getRecentActivities(limit?: number): Promise<Activity[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private questions: Map<string, Question> = new Map();
  private submissions: Map<string, Submission> = new Map();
  private activities: Map<string, Activity> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Create admin user
    await this.createUser({
      username: "aditya",
      password: "QAZwsx@12@",
      email: "aditya@nfsu.ac.in",
      name: "Aditya",
      role: "admin"
    });

    // Create 250 default student credentials
    for (let i = 1; i <= 250; i++) {
      const paddedNumber = i.toString().padStart(3, '0');
      await this.createUser({
        username: `STU${paddedNumber}`,
        password: `pass${paddedNumber}`,
        email: `student${paddedNumber}@student.nfsu.ac.in`,
        name: `Student ${paddedNumber}`,
        role: "student",
        studentId: `STU${paddedNumber}`
      });
    }

    // Add some sample questions
    await this.createQuestion({
      type: "mcq",
      title: "Data Structures Quiz",
      description: "Test your knowledge of basic data structures",
      options: {
        a: "Array",
        b: "Linked List", 
        c: "Stack",
        d: "All of the above"
      },
      correctAnswer: "d",
      difficulty: "Easy",
      points: 30,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "coding",
      title: "Two Sum Problem",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      inputFormat: "First line contains n (array size). Second line contains n integers. Third line contains target.",
      outputFormat: "Two space-separated integers representing the indices.",
      sampleInput: "4\n2 7 11 15\n9",
      sampleOutput: "0 1",
      difficulty: "Easy",
      points: 50,
      timeLimit: 1000,
      memoryLimit: 256,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "coding",
      title: "Binary Search Implementation",
      description: "Implement binary search algorithm to find target element in sorted array.",
      inputFormat: "First line contains n (array size). Second line contains n sorted integers. Third line contains target.",
      outputFormat: "Index of target element, or -1 if not found.",
      sampleInput: "5\n1 3 5 7 9\n5",
      sampleOutput: "2",
      difficulty: "Medium", 
      points: 100,
      timeLimit: 2000,
      memoryLimit: 256,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "ctf",
      title: "Simple Caesar Cipher",
      description: "Decode the following Caesar cipher with shift 3: 'KDOOR ZRUOG'",
      flag: "HELLO WORLD",
      hints: ["Try shifting each letter back by 3 positions"],
      difficulty: "Easy",
      points: 75,
      createdBy: "aditya"
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      isActive: true,
      points: 0,
      problemsSolved: 0
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Question operations
  async createQuestion(question: Omit<Question, 'id' | 'createdAt'>): Promise<Question> {
    const id = randomUUID();
    const newQuestion: Question = {
      ...question,
      id,
      createdAt: new Date()
    } as Question;
    this.questions.set(id, newQuestion);
    return newQuestion;
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async getAllQuestions(): Promise<Question[]> {
    return Array.from(this.questions.values());
  }

  async updateQuestion(id: string, updates: Partial<Question>): Promise<Question | undefined> {
    const question = this.questions.get(id);
    if (!question) return undefined;
    
    const updatedQuestion = { ...question, ...updates };
    this.questions.set(id, updatedQuestion);
    return updatedQuestion;
  }

  async deleteQuestion(id: string): Promise<boolean> {
    return this.questions.delete(id);
  }

  // Submission operations
  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const id = randomUUID();
    const submission: Submission = {
      ...insertSubmission,
      id
    };
    this.submissions.set(id, submission);
    
    // Update user points only if this is the first correct submission for that question
    if (submission.isCorrect) {
      const user = this.users.get(submission.userId);
      if (user) {
        const previousCorrectSubmission = Array.from(this.submissions.values()).find(
          sub => sub.userId === submission.userId &&
                 sub.questionId === submission.questionId &&
                 sub.isCorrect &&
                 sub.id !== submission.id
        );

        if (!previousCorrectSubmission) {
          const updatedUser = {
            ...user,
            points: user.points + submission.points,
            problemsSolved: user.problemsSolved + 1
          };
          this.users.set(submission.userId, updatedUser);
        }
      }
    }
    
    return submission;
  }

  async getSubmissionsByUser(userId: string): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(sub => sub.userId === userId);
  }

  async getSubmissionsByQuestion(questionId: string): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(sub => sub.questionId === questionId);
  }

  async getAllSubmissions(): Promise<Submission[]> {
    return Array.from(this.submissions.values());
  }

  // Activity operations
  async addActivity(activity: Omit<Activity, 'id'>): Promise<Activity> {
    const id = randomUUID();
    const newActivity: Activity = {
      ...activity,
      id
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    const activities = Array.from(this.activities.values());
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
