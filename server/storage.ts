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
      points: 5,
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
      points: 5,
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
      points: 5,
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
      points: 5,
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
      points: 5,
      createdBy: "aditya"
    });

    // Additional MCQ Questions for 2nd Year BTech Level (45 new questions)
    await this.createQuestion({
      type: "mcq",
      title: "Object-Oriented Programming",
      description: "Which of the following is NOT a principle of Object-Oriented Programming?",
      options: {
        a: "Encapsulation",
        b: "Inheritance",
        c: "Compilation",
        d: "Polymorphism"
      },
      correctAnswer: "c",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Data Structures - Stack",
      description: "Which of the following operations is NOT typically performed on a stack?",
      options: {
        a: "Push",
        b: "Pop",
        c: "Peek",
        d: "Insert at middle"
      },
      correctAnswer: "d",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "SQL Queries",
      description: "Which SQL command is used to retrieve data from a database?",
      options: {
        a: "INSERT",
        b: "UPDATE",
        c: "SELECT",
        d: "DELETE"
      },
      correctAnswer: "c",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Operating Systems",
      description: "What is the main purpose of an operating system?",
      options: {
        a: "To run applications",
        b: "To manage hardware resources",
        c: "To provide user interface",
        d: "All of the above"
      },
      correctAnswer: "d",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Computer Networks",
      description: "Which layer of the OSI model is responsible for routing?",
      options: {
        a: "Physical Layer",
        b: "Data Link Layer",
        c: "Network Layer",
        d: "Transport Layer"
      },
      correctAnswer: "c",
      difficulty: "Medium",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Programming Languages",
      description: "Which of the following is a compiled programming language?",
      options: {
        a: "Python",
        b: "JavaScript",
        c: "C++",
        d: "PHP"
      },
      correctAnswer: "c",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Data Structures - Queue",
      description: "What is the time complexity of enqueue operation in a queue?",
      options: {
        a: "O(1)",
        b: "O(n)",
        c: "O(log n)",
        d: "O(n²)"
      },
      correctAnswer: "a",
      difficulty: "Medium",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Software Engineering",
      description: "Which software development model follows a linear sequential approach?",
      options: {
        a: "Agile Model",
        b: "Waterfall Model",
        c: "Spiral Model",
        d: "Iterative Model"
      },
      correctAnswer: "b",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Database Management",
      description: "What does ACID stand for in database transactions?",
      options: {
        a: "Atomicity, Consistency, Isolation, Durability",
        b: "Accuracy, Consistency, Integration, Design",
        c: "Authentication, Consistency, Isolation, Deployment",
        d: "Atomicity, Concurrency, Integration, Durability"
      },
      correctAnswer: "a",
      difficulty: "Medium",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Computer Architecture",
      description: "What is the function of ALU in a processor?",
      options: {
        a: "Store data temporarily",
        b: "Control program execution",
        c: "Perform arithmetic and logical operations",
        d: "Manage memory allocation"
      },
      correctAnswer: "c",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Web Development",
      description: "Which of the following is NOT a web development framework?",
      options: {
        a: "React",
        b: "Angular",
        c: "Django",
        d: "Microsoft Word"
      },
      correctAnswer: "d",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Algorithms",
      description: "Which sorting algorithm has the best average-case time complexity?",
      options: {
        a: "Bubble Sort",
        b: "Selection Sort",
        c: "Quick Sort",
        d: "Insertion Sort"
      },
      correctAnswer: "c",
      difficulty: "Medium",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Data Types",
      description: "Which data type is used to store true/false values?",
      options: {
        a: "Integer",
        b: "Float",
        c: "Boolean",
        d: "String"
      },
      correctAnswer: "c",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Memory Management",
      description: "What is memory leak in programming?",
      options: {
        a: "Using too much RAM",
        b: "Forgetting to free allocated memory",
        c: "Corrupted memory",
        d: "Slow memory access"
      },
      correctAnswer: "b",
      difficulty: "Medium",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Binary Trees",
      description: "In a binary search tree, what is the maximum number of children a node can have?",
      options: {
        a: "1",
        b: "2",
        c: "3",
        d: "4"
      },
      correctAnswer: "b",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Network Protocols",
      description: "Which protocol is used for secure file transfer?",
      options: {
        a: "FTP",
        b: "HTTP",
        c: "SFTP",
        d: "SMTP"
      },
      correctAnswer: "c",
      difficulty: "Medium",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Programming Concepts",
      description: "What is recursion in programming?",
      options: {
        a: "A loop that never ends",
        b: "A function calling itself",
        c: "A variable declaration",
        d: "A type of array"
      },
      correctAnswer: "b",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Version Control",
      description: "Which command is used to create a new branch in Git?",
      options: {
        a: "git new",
        b: "git branch",
        c: "git create",
        d: "git checkout -b"
      },
      correctAnswer: "d",
      difficulty: "Medium",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Complexity Analysis",
      description: "What is the space complexity of merge sort?",
      options: {
        a: "O(1)",
        b: "O(log n)",
        c: "O(n)",
        d: "O(n²)"
      },
      correctAnswer: "c",
      difficulty: "Medium",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Java Programming",
      description: "Which keyword is used to inherit a class in Java?",
      options: {
        a: "inherits",
        b: "extends",
        c: "implements",
        d: "super"
      },
      correctAnswer: "b",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Database Normalization",
      description: "What is the purpose of normalization in databases?",
      options: {
        a: "To increase data redundancy",
        b: "To reduce data redundancy",
        c: "To slow down queries",
        d: "To increase storage space"
      },
      correctAnswer: "b",
      difficulty: "Medium",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Linked Lists",
      description: "What is the advantage of linked lists over arrays?",
      options: {
        a: "Faster access time",
        b: "Less memory usage",
        c: "Dynamic size",
        d: "Better cache performance"
      },
      correctAnswer: "c",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Software Testing",
      description: "Which type of testing is performed by end users?",
      options: {
        a: "Unit Testing",
        b: "Integration Testing",
        c: "System Testing",
        d: "Acceptance Testing"
      },
      correctAnswer: "d",
      difficulty: "Medium",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Computer Graphics",
      description: "What does RGB stand for in computer graphics?",
      options: {
        a: "Red, Green, Blue",
        b: "Red, Gray, Black",
        c: "Right, Green, Bottom",
        d: "Random, Generated, Bitmap"
      },
      correctAnswer: "a",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Machine Learning",
      description: "Which of the following is a supervised learning algorithm?",
      options: {
        a: "K-means clustering",
        b: "Linear regression",
        c: "DBSCAN",
        d: "Principal Component Analysis"
      },
      correctAnswer: "b",
      difficulty: "Medium",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Digital Logic",
      description: "How many input combinations are possible for a 3-input logic gate?",
      options: {
        a: "3",
        b: "6",
        c: "8",
        d: "9"
      },
      correctAnswer: "c",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "HTTP Methods",
      description: "Which HTTP method is used to update existing data?",
      options: {
        a: "GET",
        b: "POST",
        c: "PUT",
        d: "DELETE"
      },
      correctAnswer: "c",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Compiler Design",
      description: "Which phase of compilation converts source code into tokens?",
      options: {
        a: "Syntax Analysis",
        b: "Lexical Analysis",
        c: "Semantic Analysis",
        d: "Code Generation"
      },
      correctAnswer: "b",
      difficulty: "Medium",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Hashing",
      description: "What is the average time complexity of search operation in a hash table?",
      options: {
        a: "O(1)",
        b: "O(log n)",
        c: "O(n)",
        d: "O(n²)"
      },
      correctAnswer: "a",
      difficulty: "Medium",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "CSS Styling",
      description: "Which CSS property is used to change the text color?",
      options: {
        a: "text-color",
        b: "font-color",
        c: "color",
        d: "background-color"
      },
      correctAnswer: "c",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Process Scheduling",
      description: "Which scheduling algorithm gives the shortest average waiting time?",
      options: {
        a: "FCFS",
        b: "SJF",
        c: "Round Robin",
        d: "Priority Scheduling"
      },
      correctAnswer: "b",
      difficulty: "Medium",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Exception Handling",
      description: "Which block is used to handle exceptions in Java?",
      options: {
        a: "try-catch",
        b: "if-else",
        c: "switch-case",
        d: "for-loop"
      },
      correctAnswer: "a",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Graph Algorithms",
      description: "Which algorithm is used to find the shortest path in a weighted graph?",
      options: {
        a: "BFS",
        b: "DFS",
        c: "Dijkstra's Algorithm",
        d: "Kruskal's Algorithm"
      },
      correctAnswer: "c",
      difficulty: "Medium",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "File Systems",
      description: "What is the purpose of a file system?",
      options: {
        a: "To manage network connections",
        b: "To organize and store files",
        c: "To execute programs",
        d: "To manage user accounts"
      },
      correctAnswer: "b",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Encryption",
      description: "Which type of encryption uses the same key for both encryption and decryption?",
      options: {
        a: "Asymmetric encryption",
        b: "Public key encryption",
        c: "Symmetric encryption",
        d: "Hash encryption"
      },
      correctAnswer: "c",
      difficulty: "Medium",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Regular Expressions",
      description: "Which character is used to match any single character in regex?",
      options: {
        a: "*",
        b: "?",
        c: ".",
        d: "+"
      },
      correctAnswer: "c",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Cloud Computing",
      description: "Which of the following is a cloud service model?",
      options: {
        a: "SaaS",
        b: "PaaS",
        c: "IaaS",
        d: "All of the above"
      },
      correctAnswer: "d",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Multithreading",
      description: "What is a race condition in multithreading?",
      options: {
        a: "When threads run too fast",
        b: "When multiple threads access shared data simultaneously",
        c: "When a thread finishes execution",
        d: "When threads communicate with each other"
      },
      correctAnswer: "b",
      difficulty: "Medium",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Data Mining",
      description: "Which technique is used to find patterns in large datasets?",
      options: {
        a: "Data Mining",
        b: "Data Entry",
        c: "Data Deletion",
        d: "Data Backup"
      },
      correctAnswer: "a",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "API Development",
      description: "What does REST stand for in web services?",
      options: {
        a: "Representational State Transfer",
        b: "Remote State Transfer",
        c: "Relational State Transfer",
        d: "Rapid State Transfer"
      },
      correctAnswer: "a",
      difficulty: "Medium",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "NoSQL Databases",
      description: "Which of the following is a NoSQL database?",
      options: {
        a: "MySQL",
        b: "PostgreSQL",
        c: "MongoDB",
        d: "Oracle"
      },
      correctAnswer: "c",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Dynamic Programming",
      description: "Which principle is used in dynamic programming?",
      options: {
        a: "Divide and Conquer",
        b: "Greedy Approach",
        c: "Optimal Substructure",
        d: "Brute Force"
      },
      correctAnswer: "c",
      difficulty: "Medium",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Mobile Development",
      description: "Which programming language is primarily used for Android app development?",
      options: {
        a: "Swift",
        b: "Objective-C",
        c: "Java/Kotlin",
        d: "C#"
      },
      correctAnswer: "c",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Blockchain Technology",
      description: "What is a block in blockchain?",
      options: {
        a: "A programming construct",
        b: "A data structure containing transactions",
        c: "A type of cryptocurrency",
        d: "A network protocol"
      },
      correctAnswer: "b",
      difficulty: "Medium",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Agile Methodology",
      description: "What is the typical duration of a sprint in Scrum?",
      options: {
        a: "1 day",
        b: "1 week",
        c: "2-4 weeks",
        d: "6 months"
      },
      correctAnswer: "c",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Internet of Things",
      description: "What does IoT stand for?",
      options: {
        a: "Internet of Things",
        b: "International of Technology",
        c: "Integration of Tools",
        d: "Interface of Techniques"
      },
      correctAnswer: "a",
      difficulty: "Easy",
      points: 5,
      createdBy: "aditya"
    });

    await this.createQuestion({
      type: "mcq",
      title: "Computer Vision",
      description: "Which technique is commonly used for image recognition?",
      options: {
        a: "Linear Regression",
        b: "Convolutional Neural Networks",
        c: "Binary Search",
        d: "Bubble Sort"
      },
      correctAnswer: "b",
      difficulty: "Medium",
      points: 5,
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
      type: "coding",
      title: "Factorial",
      description: "Calculate the factorial of a given non-negative integer n. Factorial of n (n!) is the product of all positive integers less than or equal to n.",
      inputFormat: "A single non-negative integer n.",
      outputFormat: "Print the factorial of n.",
      sampleInput: "5",
      sampleOutput: "120",
      testCases: [
        { input: "0", expectedOutput: "1", isHidden: true },
        { input: "1", expectedOutput: "1", isHidden: true },
        { input: "3", expectedOutput: "6", isHidden: true },
        { input: "4", expectedOutput: "24", isHidden: true },
        { input: "6", expectedOutput: "720", isHidden: true }
      ],
      difficulty: "Easy",
      points: 30,
      timeLimit: 1000,
      memoryLimit: 256,
      createdBy: "aditya"
    } as Omit<CodingQuestion, 'id' | 'createdAt'>);

    await this.createQuestion({
      type: "coding",
      title: "Reverse String",
      description: "Read a string and print its reverse.",
      inputFormat: "A single line containing a string.",
      outputFormat: "Print the reversed string.",
      sampleInput: "hello",
      sampleOutput: "olleh",
      testCases: [
        { input: "world", expectedOutput: "dlrow", isHidden: true },
        { input: "a", expectedOutput: "a", isHidden: true },
        { input: "abc", expectedOutput: "cba", isHidden: true },
        { input: "12345", expectedOutput: "54321", isHidden: true }
      ],
      difficulty: "Easy",
      points: 25,
      timeLimit: 1000,
      memoryLimit: 256,
      createdBy: "aditya"
    } as Omit<CodingQuestion, 'id' | 'createdAt'>);

    await this.createQuestion({
      type: "coding",
      title: "Count Vowels",
      description: "Count the number of vowels (a, e, i, o, u) in a given string. Consider both uppercase and lowercase vowels.",
      inputFormat: "A single line containing a string.",
      outputFormat: "Print the count of vowels in the string.",
      sampleInput: "hello world",
      sampleOutput: "3",
      testCases: [
        { input: "programming", expectedOutput: "3", isHidden: true },
        { input: "aeiou", expectedOutput: "5", isHidden: true },
        { input: "xyz", expectedOutput: "0", isHidden: true },
        { input: "HELLO", expectedOutput: "2", isHidden: true }
      ],
      difficulty: "Easy",
      points: 30,
      timeLimit: 1000,
      memoryLimit: 256,
      createdBy: "aditya"
    } as Omit<CodingQuestion, 'id' | 'createdAt'>);

    await this.createQuestion({
      type: "coding",
      title: "Sum of Digits",
      description: "Calculate the sum of all digits in a given positive integer.",
      inputFormat: "A single positive integer.",
      outputFormat: "Print the sum of all digits.",
      sampleInput: "123",
      sampleOutput: "6",
      testCases: [
        { input: "9", expectedOutput: "9", isHidden: true },
        { input: "456", expectedOutput: "15", isHidden: true },
        { input: "1000", expectedOutput: "1", isHidden: true },
        { input: "9876", expectedOutput: "30", isHidden: true }
      ],
      difficulty: "Easy",
      points: 25,
      timeLimit: 1000,
      memoryLimit: 256,
      createdBy: "aditya"
    } as Omit<CodingQuestion, 'id' | 'createdAt'>);

    await this.createQuestion({
      type: "coding",
      title: "Prime Number Check",
      description: "Determine if a given positive integer is a prime number. A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself.",
      inputFormat: "A single positive integer n.",
      outputFormat: "Print 'Prime' if the number is prime, 'Not Prime' otherwise.",
      sampleInput: "7",
      sampleOutput: "Prime",
      testCases: [
        { input: "1", expectedOutput: "Not Prime", isHidden: true },
        { input: "2", expectedOutput: "Prime", isHidden: true },
        { input: "4", expectedOutput: "Not Prime", isHidden: true },
        { input: "17", expectedOutput: "Prime", isHidden: true },
        { input: "25", expectedOutput: "Not Prime", isHidden: true }
      ],
      difficulty: "Medium",
      points: 50,
      timeLimit: 2000,
      memoryLimit: 256,
      createdBy: "aditya"
    } as Omit<CodingQuestion, 'id' | 'createdAt'>);

    await this.createQuestion({
      type: "coding",
      title: "Fibonacci Sequence",
      description: "Generate the nth Fibonacci number. The Fibonacci sequence starts with 0, 1, and each subsequent number is the sum of the previous two.",
      inputFormat: "A single non-negative integer n.",
      outputFormat: "Print the nth Fibonacci number (0-indexed).",
      sampleInput: "6",
      sampleOutput: "8",
      testCases: [
        { input: "0", expectedOutput: "0", isHidden: true },
        { input: "1", expectedOutput: "1", isHidden: true },
        { input: "5", expectedOutput: "5", isHidden: true },
        { input: "10", expectedOutput: "55", isHidden: true },
        { input: "15", expectedOutput: "610", isHidden: true }
      ],
      difficulty: "Medium",
      points: 60,
      timeLimit: 2000,
      memoryLimit: 256,
      createdBy: "aditya"
    } as Omit<CodingQuestion, 'id' | 'createdAt'>);

    await this.createQuestion({
      type: "coding",
      title: "Array Sorting",
      description: "Sort an array of integers in ascending order and print the sorted array.",
      inputFormat: "First line contains n (number of elements). Second line contains n space-separated integers.",
      outputFormat: "Print the sorted array elements separated by spaces.",
      sampleInput: "5\n3 1 4 1 5",
      sampleOutput: "1 1 3 4 5",
      testCases: [
        { input: "3\n5 2 8", expectedOutput: "2 5 8", isHidden: true },
        { input: "4\n1 1 1 1", expectedOutput: "1 1 1 1", isHidden: true },
        { input: "6\n9 3 7 1 5 2", expectedOutput: "1 2 3 5 7 9", isHidden: true },
        { input: "1\n42", expectedOutput: "42", isHidden: true }
      ],
      difficulty: "Medium",
      points: 55,
      timeLimit: 2000,
      memoryLimit: 256,
      createdBy: "aditya"
    } as Omit<CodingQuestion, 'id' | 'createdAt'>);

    await this.createQuestion({
      type: "coding",
      title: "Palindrome String Check",
      description: "Check if a given string is a palindrome. A palindrome reads the same backward as forward. Ignore spaces, punctuation, and case.",
      inputFormat: "A single line containing a string.",
      outputFormat: "Print 'Palindrome' if the string is a palindrome, 'Not Palindrome' otherwise.",
      sampleInput: "A man a plan a canal Panama",
      sampleOutput: "Palindrome",
      testCases: [
        { input: "racecar", expectedOutput: "Palindrome", isHidden: true },
        { input: "hello", expectedOutput: "Not Palindrome", isHidden: true },
        { input: "Madam", expectedOutput: "Palindrome", isHidden: true },
        { input: "12321", expectedOutput: "Palindrome", isHidden: true },
        { input: "Was it a car or a cat I saw", expectedOutput: "Palindrome", isHidden: true }
      ],
      difficulty: "Hard",
      points: 80,
      timeLimit: 3000,
      memoryLimit: 512,
      createdBy: "aditya"
    } as Omit<CodingQuestion, 'id' | 'createdAt'>);

    await this.createQuestion({
      type: "coding",
      title: "Binary Search",
      description: "Implement binary search to find the position of a target element in a sorted array. Return the 0-based index if found, -1 otherwise.",
      inputFormat: "First line: n (array size) and target. Second line: n sorted integers.",
      outputFormat: "Print the index of target element or -1 if not found.",
      sampleInput: "5 7\n1 3 7 9 11",
      sampleOutput: "2",
      testCases: [
        { input: "4 5\n2 4 6 8", expectedOutput: "-1", isHidden: true },
        { input: "6 1\n1 2 3 4 5 6", expectedOutput: "0", isHidden: true },
        { input: "7 10\n1 3 5 7 9 11 13", expectedOutput: "-1", isHidden: true },
        { input: "3 15\n10 15 20", expectedOutput: "1", isHidden: true }
      ],
      difficulty: "Hard",
      points: 90,
      timeLimit: 3000,
      memoryLimit: 512,
      createdBy: "aditya"
    } as Omit<CodingQuestion, 'id' | 'createdAt'>);

    await this.createQuestion({
      type: "coding",
      title: "Longest Common Subsequence",
      description: "Find the length of the longest common subsequence between two strings. A subsequence is derived by deleting some or no elements without changing the order of remaining elements.",
      inputFormat: "Two lines, each containing a string.",
      outputFormat: "Print the length of the longest common subsequence.",
      sampleInput: "ABCDGH\nAEDFHR",
      sampleOutput: "3",
      testCases: [
        { input: "AGGTAB\nGXTXAYB", expectedOutput: "4", isHidden: true },
        { input: "ABC\nDEF", expectedOutput: "0", isHidden: true },
        { input: "HELLO\nHELLO", expectedOutput: "5", isHidden: true },
        { input: "PROGRAMMING\nCODING", expectedOutput: "4", isHidden: true }
      ],
      difficulty: "Hard",
      points: 100,
      timeLimit: 3000,
      memoryLimit: 512,
      createdBy: "aditya"
    } as Omit<CodingQuestion, 'id' | 'createdAt'>);

    await this.createQuestion({
      type: "ctf",
      title: "Simple Caesar Cipher",
      description: "Decode the following Caesar cipher: 'KDOOR_ZRUOG'",
      flag: "CTF{HELLO_WORLD}",
      hints: ["Flag format - CTF{*****_*****}"],
      difficulty: "Easy",
      points: 75,
      createdBy: "aditya"
    } as Omit<CTFQuestion, 'id' | 'createdAt'>);

    await this.createQuestion({
      type: "ctf",
      title: "QR Quest",
      description: "Can you find the right QR code and claim the treasure? - https://drive.google.com/drive/folders/1pNtW8mmlbgEz1iY_-9LcMI0r1xlsE6hS?usp=sharing",
      flag: "CTF{NFSU_QR_QUEST}",
      hints: ["Flag format - CTF{...}"],
      difficulty: "Easy",
      points: 80,
      createdBy: "aditya"
    } as Omit<CTFQuestion, 'id' | 'createdAt'>);

    await this.createQuestion({
      type: "ctf",
      title: "The Disguised Truth",
      description: " We received a suspicious image file — or is it? - https://drive.google.com/file/d/1fOJOUlopQVLVrBSlGEsq5XvW6wG7XJru/view?usp=sharing",
      flag: "CTF{CodeCrafters_reads_between_extensions",
      hints: ["Something doesn’t quite add up. Could it be a wolf in sheep’s clothing? Flag format - CTF{...}"],
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
