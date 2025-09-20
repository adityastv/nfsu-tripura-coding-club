import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertSubmissionSchema, codeExecutionRequestSchema } from "@shared/schema";
import { executeCode } from "./code-executor";
import { validateSubmission } from "./test-runner";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });
      
      // Add login activity
      await storage.addActivity({
        userId: user.id,
        userName: user.name,
        action: `${user.role === 'admin' ? 'Admin' : 'Student'} logged in`,
        timestamp: new Date()
      });

      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // User management routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const sanitizedUsers = users.map(user => ({ ...user, password: undefined }));
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      await storage.addActivity({
        userId: req.body.createdBy || "system",
        userName: "Admin",
        action: `Created new user: ${user.name}`,
        timestamp: new Date()
      });
      
      res.json({ ...user, password: undefined });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create user" });
      }
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const deleted = await storage.deleteUser(id);
      if (deleted) {
        await storage.addActivity({
          userId: req.body.deletedBy || "system",
          userName: "Admin",
          action: `Deleted user: ${user.name}`,
          timestamp: new Date()
        });
        res.json({ message: "User deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete user" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Question management routes
  app.get("/api/questions", async (req, res) => {
    try {
      const questions = await storage.getAllQuestions();
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.post("/api/questions", async (req, res) => {
    try {
      const question = await storage.createQuestion(req.body);
      
      await storage.addActivity({
        userId: req.body.createdBy || "system",
        userName: "Admin",
        action: `Created new ${question.type} question: ${question.title}`,
        timestamp: new Date()
      });
      
      res.json(question);
    } catch (error) {
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  app.put("/api/questions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const existingQuestion = await storage.getQuestion(id);
      
      if (!existingQuestion) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      const updatedQuestion = await storage.updateQuestion(id, req.body);
      if (updatedQuestion) {
        await storage.addActivity({
          userId: req.body.updatedBy || "system",
          userName: "Admin",
          action: `Updated question: ${updatedQuestion.title}`,
          timestamp: new Date()
        });
        res.json(updatedQuestion);
      } else {
        res.status(500).json({ message: "Failed to update question" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update question" });
    }
  });

  app.delete("/api/questions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const question = await storage.getQuestion(id);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      const deleted = await storage.deleteQuestion(id);
      if (deleted) {
        await storage.addActivity({
          userId: req.body.deletedBy || "system",
          userName: "Admin",
          action: `Deleted question: ${question.title}`,
          timestamp: new Date()
        });
        res.json({ message: "Question deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete question" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete question" });
    }
  });

  // Submission routes
  app.post("/api/submissions", async (req, res) => {
    try {
      let submissionData = insertSubmissionSchema.parse(req.body);
      
      // Set default values for auto-populated fields
      submissionData.submittedAt = submissionData.submittedAt || new Date();
      submissionData.isCorrect = submissionData.isCorrect || false;
      submissionData.points = submissionData.points || 0;
      
      // For coding questions, validate against test cases
      if (submissionData.questionType === "coding") {
        const question = await storage.getQuestion(submissionData.questionId);
        if (!question || question.type !== "coding") {
          return res.status(404).json({ message: "Question not found" });
        }

        // Extract language from the submission (we need to add this to the request)
        // For now, let's assume Python as default, but this should be sent from client
        const language = req.body.language || "python";
        
        try {
          const validationResult = await validateSubmission(
            submissionData.answer, 
            language, 
            question
          );
          
          // Update submission data based on validation results
          submissionData.isCorrect = validationResult.allPassed;
          submissionData.points = validationResult.allPassed ? question.points : 0;
          
        } catch (validationError) {
          console.error("Validation error:", validationError);
          // If validation fails due to execution error, treat as incorrect
          submissionData.isCorrect = false;
          submissionData.points = 0;
        }
      }
      
      const submission = await storage.createSubmission(submissionData);
      
      const user = await storage.getUser(submission.userId);
      const question = await storage.getQuestion(submission.questionId);
      
      if (user && question) {
        await storage.addActivity({
          userId: user.id,
          userName: user.name,
          action: submission.isCorrect 
            ? `Solved "${question.title}"` 
            : `Submitted solution for "${question.title}"`,
          timestamp: new Date()
        });
      }
      
      res.json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid submission data", errors: error.errors });
      } else {
        console.error("Submission error:", error);
        res.status(500).json({ message: "Failed to create submission" });
      }
    }
  });

  app.get("/api/submissions/user/:userId", async (req, res) => {
    try {
      const submissions = await storage.getSubmissionsByUser(req.params.userId);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  // Leaderboard route
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const students = users
        .filter(user => user.role === "student")
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          return b.problemsSolved - a.problemsSolved;
        })
        .map((user, index) => ({
          ...user,
          password: undefined,
          rank: index + 1
        }));
      
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Activities route
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Stats route
  app.get("/api/stats", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const questions = await storage.getAllQuestions();
      const submissions = await storage.getAllSubmissions();
      
      const students = users.filter(u => u.role === "student");
      const activeStudents = students.filter(u => u.isActive);
      
      // Get submissions from today (IST)
      const today = new Date();
      const todayIST = new Date(today.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
      todayIST.setHours(0, 0, 0, 0);
      
      const todaySubmissions = submissions.filter(sub => {
        const subDate = new Date(sub.submittedAt);
        const subDateIST = new Date(subDate.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
        subDateIST.setHours(0, 0, 0, 0);
        return subDateIST.getTime() === todayIST.getTime();
      });

      res.json({
        totalStudents: students.length,
        activeQuestions: questions.length,
        submissionsToday: todaySubmissions.length,
        activeUsers: activeStudents.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Code execution route
  app.post("/api/code/run", async (req, res) => {
    try {
      const executionRequest = codeExecutionRequestSchema.parse(req.body);
      let codeToExecute = executionRequest.code;
      
      // If questionId is provided, inject sample input for testing
      if (executionRequest.questionId) {
        const question = await storage.getQuestion(executionRequest.questionId);
        if (question && question.type === "coding") {
          const { injectInputToCode } = await import("./test-runner");
          codeToExecute = injectInputToCode(
            executionRequest.code, 
            question.sampleInput, 
            executionRequest.language
          );
        }
      }
      
      const result = await executeCode({
        ...executionRequest,
        code: codeToExecute
      });
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid code execution request", 
          errors: error.errors 
        });
      } else {
        console.error("Code execution error:", error);
        res.status(500).json({ 
          message: "Failed to execute code",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
