import type { CodeExecutionRequest, CodeExecutionResult, CodingQuestion, TestCase } from "@shared/schema";
import { executeCode } from "./code-executor";

export interface TestResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  executionTime: number;
  error?: string;
}

export interface ValidationResult {
  allPassed: boolean;
  testResults: TestResult[];
  totalTests: number;
  passedTests: number;
}

/**
 * Validates a code submission against all test cases for a coding question
 */
export async function validateSubmission(
  code: string,
  language: "python" | "java" | "cpp" | "javascript",
  question: CodingQuestion
): Promise<ValidationResult> {
  const allTestCases: TestCase[] = [
    // Include the sample test case first
    { 
      input: question.sampleInput, 
      expectedOutput: question.sampleOutput, 
      isHidden: false 
    },
    // Then add all additional test cases
    ...(question.testCases || [])
  ];

  const testResults: TestResult[] = [];
  let passedTests = 0;

  for (const testCase of allTestCases) {
    try {
      const executionRequest: CodeExecutionRequest = {
        code: injectInputToCode(code, testCase.input, language),
        language,
        timeLimit: question.timeLimit || 5000,
        memoryLimit: question.memoryLimit || 256,
      };

      const result: CodeExecutionResult = await executeCode(executionRequest);
      
      const actualOutput = result.stdout.trim();
      const expectedOutput = testCase.expectedOutput.trim();
      const passed = result.success && actualOutput === expectedOutput;
      
      if (passed) {
        passedTests++;
      }

      testResults.push({
        passed,
        input: testCase.input,
        expectedOutput,
        actualOutput,
        executionTime: result.executionTime,
        error: result.success ? undefined : (result.error || result.stderr)
      });

      // If any test case fails, we can stop early for efficiency
      // (though we might want to run all for debugging purposes)
      
    } catch (error) {
      testResults.push({
        passed: false,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: "",
        executionTime: 0,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  return {
    allPassed: passedTests === allTestCases.length,
    testResults,
    totalTests: allTestCases.length,
    passedTests
  };
}

/**
 * Injects input data into the code based on the programming language
 * This modifies the user code to use the provided input instead of reading from stdin
 */
function injectInputToCode(code: string, input: string, language: string): string {
  const inputLines = input.split('\n');
  
  switch (language) {
    case "python":
      // Replace input() calls with predefined values
      let pythonCode = code;
      let lineIndex = 0;
      
      // Simple approach: replace input() with the next line from inputLines
      pythonCode = pythonCode.replace(/input\(\)/g, () => {
        if (lineIndex < inputLines.length) {
          return `"${inputLines[lineIndex++]}"`;
        }
        return 'input()'; // fallback if we run out of input lines
      });
      
      return pythonCode;
      
    case "javascript":
      // For Node.js, we'll use a similar approach
      let jsCode = `
const inputLines = ${JSON.stringify(inputLines)};
let inputIndex = 0;
function readline() {
  return inputLines[inputIndex++] || "";
}

${code}`;
      return jsCode;
      
    case "java":
      // For Java, we'll inject a Scanner with predefined input
      let javaCode = code;
      
      // Add import if not present
      if (!javaCode.includes('import java.util.Scanner')) {
        javaCode = 'import java.util.Scanner;\nimport java.io.StringReader;\n' + javaCode;
      }
      
      // Replace Scanner creation with predefined input
      const inputString = input.replace(/"/g, '\\"');
      javaCode = javaCode.replace(
        /new Scanner\(System\.in\)/g,
        `new Scanner(new StringReader("${inputString}"))`
      );
      
      return javaCode;
      
    case "cpp":
      // For C++, we'll redirect cin
      let cppCode = `
#include <iostream>
#include <sstream>
#include <string>
using namespace std;

int main() {
    string input = R"(${input})";
    istringstream cin_replacement(input);
    
    // Backup original cin and replace with our input
    streambuf* orig = cin.rdbuf();
    cin.rdbuf(cin_replacement.rdbuf());
    
    ${extractMainBody(code)}
    
    // Restore original cin
    cin.rdbuf(orig);
    return 0;
}`;
      return cppCode;
      
    default:
      return code;
  }
}

/**
 * Extracts the main function body from C++ code
 */
function extractMainBody(code: string): string {
  // Simple regex to extract content between main() { and the last }
  const mainMatch = code.match(/int\s+main\s*\([^)]*\)\s*\{([\s\S]*)\}/);
  if (mainMatch && mainMatch[1]) {
    let body = mainMatch[1].trim();
    // Remove the last return statement if it's just "return 0;"
    body = body.replace(/return\s+0\s*;\s*$/, '');
    return body;
  }
  return code; // fallback if we can't extract
}