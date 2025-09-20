import { type User, type InsertUser, type Question, type CodingQuestion, type MCQQuestion, type CTFQuestion, type Submission, type InsertSubmission, type Activity } from "@shared/schema";
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
      type: "mcq",
      title: "Algorithm Complexity",
      description: "What is the time complexity of binary search in a sorted array?",
      options: {
        a: "O(n)",
        b: "O(log n)",
        c: "O(n²)",
        d: "O(1)"
      },
      correctAnswer: "b",
      difficulty: "Medium",
      points: 40,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Network Security",
      description: "Which protocol provides secure communication over the internet?",
      options: {
        a: "HTTP",
        b: "FTP",
        c: "HTTPS",
        d: "SMTP"
      },
      correctAnswer: "c",
      difficulty: "Easy",
      points: 35,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Database Concepts",
      description: "Which of the following ensures data integrity in a database?",
      options: {
        a: "Primary Key",
        b: "Foreign Key",
        c: "Check Constraints",
        d: "All of the above"
      },
      correctAnswer: "d",
      difficulty: "Medium",
      points: 45,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Cybersecurity Fundamentals",
      description: "What is the primary purpose of a firewall in network security?",
      options: {
        a: "To encrypt data",
        b: "To filter network traffic",
        c: "To compress files",
        d: "To backup data"
      },
      correctAnswer: "b",
      difficulty: "Easy",
      points: 30,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "coding",
      title: "Hello World",
      description: "Write a program that prints 'Hello World' to the console.",
      inputFormat: "No input required.",
      outputFormat: "Print exactly: Hello World",
      sampleInput: "",
      sampleOutput: "Hello World",
      testCases: [
        { input: "", expectedOutput: "Hello World", isHidden: true }
      ],
      difficulty: "Easy",
      points: 10,
      timeLimit: 1000,
      memoryLimit: 256,
      createdBy: "aditya"
    } as Omit<CodingQuestion, 'id' | 'createdAt'>);

    await this.createQuestion({
      type: "coding",
      title: "Add Two Numbers",
      description: "Read two integers and print their sum.",
      inputFormat: "Two integers a and b separated by a space.",
      outputFormat: "Print the sum of a and b.",
      sampleInput: "3 5",
      sampleOutput: "8",
      testCases: [
        { input: "10 20", expectedOutput: "30", isHidden: true },
        { input: "0 0", expectedOutput: "0", isHidden: true },
        { input: "1 2", expectedOutput: "3", isHidden: true },
        { input: "100 200", expectedOutput: "300", isHidden: true }
      ],
      difficulty: "Easy", 
      points: 15,
      timeLimit: 1000,
      memoryLimit: 256,
      createdBy: "aditya"
    } as Omit<CodingQuestion, 'id' | 'createdAt'>);

    await this.createQuestion({
      type: "coding",
      title: "Even or Odd",
      description: "Read an integer and determine if it is even or odd.",
      inputFormat: "A single integer n.",
      outputFormat: "Print 'Even' if the number is even, 'Odd' if it is odd.",
      sampleInput: "4",
      sampleOutput: "Even",
      testCases: [
        { input: "5", expectedOutput: "Odd", isHidden: true },
        { input: "0", expectedOutput: "Even", isHidden: true },
        { input: "1", expectedOutput: "Odd", isHidden: true },
        { input: "100", expectedOutput: "Even", isHidden: true }
      ],
      difficulty: "Easy",
      points: 20,
      timeLimit: 1000,
      memoryLimit: 256,
      createdBy: "aditya"
    } as Omit<CodingQuestion, 'id' | 'createdAt'>);

    await this.createQuestion({
      type: "coding",
      title: "Maximum of Two Numbers",
      description: "Read two integers and print the larger number.",
      inputFormat: "Two integers a and b separated by a space.",
      outputFormat: "Print the larger of the two numbers.",
      sampleInput: "7 3",
      sampleOutput: "7",
      testCases: [
        { input: "10 5", expectedOutput: "10", isHidden: true },
        { input: "3 8", expectedOutput: "8", isHidden: true },
        { input: "15 15", expectedOutput: "15", isHidden: true },
        { input: "0 1", expectedOutput: "1", isHidden: true }
      ],
      difficulty: "Easy",
      points: 25,
      timeLimit: 1000,
      memoryLimit: 256,
      createdBy: "aditya"
    } as Omit<CodingQuestion, 'id' | 'createdAt'>);

    await this.createQuestion({
      type: "ctf",
      title: "Simple Caesar Cipher",
      description: "Decode the following Caesar cipher with shift 3: 'KDOOR ZRUOG'",
      flag: "HELLO WORLD",
      hints: ["Try shifting each letter back by 3 positions"],
      difficulty: "Easy",
      points: 75,
      createdBy: "aditya"
    } as Omit<CTFQuestion, 'id' | 'createdAt'>);

    await this.createQuestion({
      type: "ctf",
      title: "Base64 Decoding Challenge",
      description: "Decode the following Base64 encoded message: 'Q3liZXJTZWN1cml0eQ=='",
      flag: "CyberSecurity",
      hints: ["This looks like Base64 encoding", "Use any online Base64 decoder or command line tools"],
      difficulty: "Easy",
      points: 80,
      createdBy: "aditya"
    } as Omit<CTFQuestion, 'id' | 'createdAt'>);

    await this.createQuestion({
      type: "ctf",
      title: "SQL Injection Discovery",
      description: "You found a login form that seems vulnerable. The query looks like: SELECT * FROM users WHERE username='$input' AND password='$pass'. What would you enter as username to bypass authentication?",
      flag: "admin'--",
      hints: ["Think about SQL comment syntax", "You want to make the password check irrelevant", "The double dash -- is used for comments in SQL"],
      difficulty: "Medium",
      points: 100,
      createdBy: "aditya"
    } as Omit<CTFQuestion, 'id' | 'createdAt'>);
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
    };
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
