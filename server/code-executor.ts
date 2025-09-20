import { spawn, type ChildProcess } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";
import type { CodeExecutionRequest, CodeExecutionResult } from "@shared/schema";

// Create a temporary directory for code execution
const TEMP_DIR = path.join(os.tmpdir(), "coding-club-executor");

// Ensure temp directory exists
async function ensureTempDir() {
  try {
    await fs.access(TEMP_DIR);
  } catch {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  }
}

// Clean up old files (older than 1 hour)
async function cleanup() {
  try {
    const files = await fs.readdir(TEMP_DIR);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      const stats = await fs.stat(filePath);
      if (now - stats.mtime.getTime() > oneHour) {
        await fs.unlink(filePath);
      }
    }
  } catch (error) {
    console.error("Cleanup error:", error);
  }
}

// Run cleanup every 30 minutes
setInterval(cleanup, 30 * 60 * 1000);

interface ExecutionOptions {
  command: string;
  args: string[];
  input?: string;
  timeLimit: number;
  workingDir?: string;
}

async function executeCommand(options: ExecutionOptions): Promise<CodeExecutionResult> {
  const { command, args, input, timeLimit, workingDir } = options;
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let isTimeout = false;
    let isResolved = false;

    const childProcess: ChildProcess = spawn(command, args, {
      cwd: workingDir || process.cwd(),
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        // Limit environment for security
        PATH: process.env.PATH,
        HOME: os.tmpdir(),
      },
    });

    // Set timeout
    const timeout = setTimeout(() => {
      if (!isResolved) {
        isTimeout = true;
        childProcess.kill("SIGKILL");
        resolve({
          success: false,
          stdout,
          stderr: stderr + "\nExecution timed out",
          exitCode: -1,
          executionTime: Date.now() - startTime,
          error: "Execution timed out",
        });
        isResolved = true;
      }
    }, timeLimit);

    // Handle stdout
    if (childProcess.stdout) {
      childProcess.stdout.on("data", (data) => {
        stdout += data.toString();
        // Limit output size
        if (stdout.length > 10000) {
          stdout = stdout.substring(0, 10000) + "\n... (output truncated)";
          childProcess.kill("SIGKILL");
        }
      });
    }

    // Handle stderr
    if (childProcess.stderr) {
      childProcess.stderr.on("data", (data) => {
        stderr += data.toString();
        // Limit error output size
        if (stderr.length > 10000) {
          stderr = stderr.substring(0, 10000) + "\n... (error output truncated)";
          childProcess.kill("SIGKILL");
        }
      });
    }

    // Handle process exit
    childProcess.on("close", (code) => {
      if (!isResolved) {
        clearTimeout(timeout);
        const executionTime = Date.now() - startTime;
        
        resolve({
          success: !isTimeout && (code === 0 || code === null),
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code || 0,
          executionTime,
          error: isTimeout ? "Execution timed out" : undefined,
        });
        isResolved = true;
      }
    });

    // Handle process error
    childProcess.on("error", (error) => {
      if (!isResolved) {
        clearTimeout(timeout);
        resolve({
          success: false,
          stdout,
          stderr: stderr + "\n" + error.message,
          exitCode: -1,
          executionTime: Date.now() - startTime,
          error: error.message,
        });
        isResolved = true;
      }
    });

    // Send input if provided
    if (input && childProcess.stdin) {
      childProcess.stdin.write(input);
      childProcess.stdin.end();
    }
  });
}

async function executePython(code: string, timeLimit: number): Promise<CodeExecutionResult> {
  await ensureTempDir();
  
  const fileName = `python_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.py`;
  const filePath = path.join(TEMP_DIR, fileName);
  
  try {
    await fs.writeFile(filePath, code);
    
    const result = await executeCommand({
      command: "python3",
      args: [filePath],
      timeLimit,
    });
    
    // Clean up
    await fs.unlink(filePath).catch(() => {});
    
    return result;
  } catch (error: any) {
    return {
      success: false,
      stdout: "",
      stderr: error.message,
      exitCode: -1,
      executionTime: 0,
      error: error.message,
    };
  }
}

async function executeJavaScript(code: string, timeLimit: number): Promise<CodeExecutionResult> {
  await ensureTempDir();
  
  const fileName = `js_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.js`;
  const filePath = path.join(TEMP_DIR, fileName);
  
  try {
    await fs.writeFile(filePath, code);
    
    const result = await executeCommand({
      command: "node",
      args: [filePath],
      timeLimit,
    });
    
    // Clean up
    await fs.unlink(filePath).catch(() => {});
    
    return result;
  } catch (error: any) {
    return {
      success: false,
      stdout: "",
      stderr: error.message,
      exitCode: -1,
      executionTime: 0,
      error: error.message,
    };
  }
}

async function executeCpp(code: string, timeLimit: number): Promise<CodeExecutionResult> {
  await ensureTempDir();
  
  const baseName = `cpp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const sourceFile = path.join(TEMP_DIR, `${baseName}.cpp`);
  const execFile = path.join(TEMP_DIR, baseName);
  
  try {
    await fs.writeFile(sourceFile, code);
    
    // Compile
    const compileResult = await executeCommand({
      command: "g++",
      args: ["-o", execFile, sourceFile, "-std=c++17"],
      timeLimit: 10000, // 10 seconds for compilation
    });
    
    if (!compileResult.success) {
      // Clean up
      await fs.unlink(sourceFile).catch(() => {});
      return {
        success: false,
        stdout: "",
        stderr: "Compilation Error:\n" + compileResult.stderr,
        exitCode: compileResult.exitCode,
        executionTime: compileResult.executionTime,
        error: "Compilation failed",
      };
    }
    
    // Execute
    const execResult = await executeCommand({
      command: execFile,
      args: [],
      timeLimit,
    });
    
    // Clean up
    await fs.unlink(sourceFile).catch(() => {});
    await fs.unlink(execFile).catch(() => {});
    
    return execResult;
  } catch (error: any) {
    return {
      success: false,
      stdout: "",
      stderr: error.message,
      exitCode: -1,
      executionTime: 0,
      error: error.message,
    };
  }
}

async function executeJava(code: string, timeLimit: number): Promise<CodeExecutionResult> {
  await ensureTempDir();
  
  // Extract class name from code
  const classNameMatch = code.match(/public\s+class\s+(\w+)/);
  const className = classNameMatch ? classNameMatch[1] : "Main";
  
  const fileName = `${className}.java`;
  const filePath = path.join(TEMP_DIR, fileName);
  const workingDir = TEMP_DIR;
  
  try {
    await fs.writeFile(filePath, code);
    
    // Compile
    const compileResult = await executeCommand({
      command: "javac",
      args: [fileName],
      timeLimit: 15000, // 15 seconds for compilation
      workingDir,
    });
    
    if (!compileResult.success) {
      // Clean up
      await fs.unlink(filePath).catch(() => {});
      return {
        success: false,
        stdout: "",
        stderr: "Compilation Error:\n" + compileResult.stderr,
        exitCode: compileResult.exitCode,
        executionTime: compileResult.executionTime,
        error: "Compilation failed",
      };
    }
    
    // Execute
    const execResult = await executeCommand({
      command: "java",
      args: [className],
      timeLimit,
      workingDir,
    });
    
    // Clean up
    await fs.unlink(filePath).catch(() => {});
    await fs.unlink(path.join(workingDir, `${className}.class`)).catch(() => {});
    
    return execResult;
  } catch (error: any) {
    return {
      success: false,
      stdout: "",
      stderr: error.message,
      exitCode: -1,
      executionTime: 0,
      error: error.message,
    };
  }
}

export async function executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
  const { code, language, timeLimit } = request;
  
  try {
    switch (language) {
      case "python":
        return await executePython(code, timeLimit);
      case "javascript":
        return await executeJavaScript(code, timeLimit);
      case "cpp":
        return await executeCpp(code, timeLimit);
      case "java":
        return await executeJava(code, timeLimit);
      default:
        return {
          success: false,
          stdout: "",
          stderr: `Unsupported language: ${language}`,
          exitCode: -1,
          executionTime: 0,
          error: `Unsupported language: ${language}`,
        };
    }
  } catch (error: any) {
    return {
      success: false,
      stdout: "",
      stderr: error.message,
      exitCode: -1,
      executionTime: 0,
      error: error.message,
    };
  }
}

// Initialize temp directory on startup
ensureTempDir().catch(console.error);