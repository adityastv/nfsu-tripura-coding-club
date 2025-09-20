import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CodeOutput from "@/components/code-output";
import { auth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useCopyRestriction } from "@/hooks/use-copy-restriction";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getISTTime } from "@/lib/time";
import { Play, Check, Send } from "lucide-react";
import type { Question, MCQQuestion, CodingQuestion, CTFQuestion, InsertSubmission, CodeExecutionRequest, CodeExecutionResult } from "@shared/schema";

interface CodeEditorProps {
  question: Question;
}

const LANGUAGE_TEMPLATES = {
  python: `def solution():
    # Your code here
    pass

# Call your solution
solution()`,
  java: `public class Solution {
    public static void main(String[] args) {
        // Your code here
    }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Your code here
    return 0;
}`,
  javascript: `function solution() {
    // Your code here
}

// Call your solution
solution();`
};

export default function CodeEditor({ question }: CodeEditorProps) {
  const user = auth.getUser();
  const { toast } = useToast();
  const copyRestriction = useCopyRestriction();
  
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [code, setCode] = useState(LANGUAGE_TEMPLATES.python);
  const [mcqAnswer, setMcqAnswer] = useState("");
  const [ctfFlag, setCtfFlag] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<CodeExecutionResult | null>(null);

  const runCodeMutation = useMutation({
    mutationFn: async (executionRequest: CodeExecutionRequest) => {
      const response = await apiRequest("POST", "/api/code/run", executionRequest);
      return response.json() as Promise<CodeExecutionResult>;
    },
    onSuccess: (result) => {
      setExecutionResult(result);
      if (result.success) {
        toast({
          title: "Code Executed Successfully",
          description: `Execution completed in ${result.executionTime}ms`,
        });
      } else {
        toast({
          title: "Execution Failed",
          description: result.error || "Check the error output below",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Execution Error",
        description: "Failed to execute code. Please try again.",
        variant: "destructive",
      });
      console.error("Code execution error:", error);
    },
  });
  const submitMutation = useMutation({
    mutationFn: async (submissionData: InsertSubmission) => {
      console.log("Submitting data:", submissionData);
      const response = await apiRequest("POST", "/api/submissions", submissionData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/submissions/user", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      if (data.isCorrect) {
        toast({
          title: "Accepted!",
          description: `Congratulations! You earned ${data.points} points.`,
          className: "bg-success text-success-foreground",
        });
      } else {
        toast({
          title: "Wrong Answer",
          description: "Your solution is incorrect. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Submission Error",
        description: "Failed to submit your solution. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    setCode(LANGUAGE_TEMPLATES[language as keyof typeof LANGUAGE_TEMPLATES] || "");
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast({
        title: "No Code",
        description: "Please write some code before running.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setExecutionResult(null);

    const codingQ = question as CodingQuestion;
    const executionRequest: CodeExecutionRequest = {
      code,
      language: selectedLanguage as "python" | "java" | "cpp" | "javascript",
      timeLimit: codingQ.timeLimit || 5000,
      memoryLimit: codingQ.memoryLimit || 256,
    };

    runCodeMutation.mutate(executionRequest);
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    if (!user) return;

    let answer = "";
    let isCorrect = false;

    if (question.type === "mcq") {
      const mcqQ = question as MCQQuestion;
      answer = mcqAnswer;
      isCorrect = mcqAnswer === mcqQ.correctAnswer;
    } else if (question.type === "ctf") {
      const ctfQ = question as CTFQuestion;
      answer = ctfFlag;
      isCorrect = ctfFlag.trim().toLowerCase() === ctfQ.flag.trim().toLowerCase();
    } else if (question.type === "coding") {
      answer = code;
      // For demo purposes, we'll consider it correct if code contains certain keywords
      // In a real implementation, this would run the code against test cases
      isCorrect = code.includes("return") || code.includes("print") || code.includes("cout");
    }

    const submissionData = {
      userId: user.id,
      questionId: question.id,
      questionType: question.type,
      answer,
      isCorrect,
      points: isCorrect ? question.points : 0,
      submittedAt: getISTTime(),
    };

    submitMutation.mutate(submissionData);
  };

  const renderQuestionContent = () => {
    if (question.type === "coding") {
      const codingQ = question as CodingQuestion;
      return (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Problem Statement</h4>
            <p className="text-sm text-foreground whitespace-pre-wrap">{codingQ.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Input Format</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{codingQ.inputFormat}</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Output Format</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{codingQ.outputFormat}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-2">Sample Test Case</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Sample Input</Label>
                <div className="bg-muted p-3 rounded-md font-mono text-sm whitespace-pre-wrap">
                  {codingQ.sampleInput}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Expected Output</Label>
                <div className="bg-muted p-3 rounded-md font-mono text-sm whitespace-pre-wrap">
                  {codingQ.sampleOutput}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (question.type === "mcq") {
      const mcqQ = question as MCQQuestion;
      return (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Question</h4>
            <p className="text-sm text-foreground">{mcqQ.description}</p>
          </div>
          
          <div className="space-y-3">
            <Label className="font-semibold text-foreground">Choose your answer:</Label>
            {Object.entries(mcqQ.options).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`option-${key}`}
                  name="mcq-answer"
                  value={key}
                  checked={mcqAnswer === key}
                  onChange={(e) => setMcqAnswer(e.target.value)}
                  className="text-primary"
                  data-testid={`radio-option-${key}`}
                />
                <label htmlFor={`option-${key}`} className="text-sm text-foreground cursor-pointer">
                  <strong>{key.toUpperCase()}.</strong> {value}
                </label>
              </div>
            ))}
          </div>
        </div>
      );
    } else if (question.type === "ctf") {
      const ctfQ = question as CTFQuestion;
      return (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Challenge Description</h4>
            <p className="text-sm text-foreground whitespace-pre-wrap">{ctfQ.description}</p>
          </div>
          
          {ctfQ.hints && ctfQ.hints.length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground mb-2">Hints</h4>
              <ul className="list-disc list-inside space-y-1">
                {ctfQ.hints.map((hint, index) => (
                  <li key={index} className="text-sm text-muted-foreground">{hint}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div>
            <Label htmlFor="ctf-flag" className="font-semibold text-foreground">Enter the flag:</Label>
            <Input
              id="ctf-flag"
              data-testid="input-ctf-flag"
              type="text"
              value={ctfFlag}
              onChange={(e) => setCtfFlag(e.target.value)}
              placeholder="flag{...}"
              className="mt-2 font-mono"
              {...copyRestriction}
            />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex h-[calc(90vh-160px)]">
      {/* Problem Description */}
      <div className="w-1/2 p-6 border-r border-border overflow-y-auto">
        {renderQuestionContent()}
      </div>
      
      {/* Code Editor / Answer Section */}
      <div className="w-1/2 flex flex-col">
        {question.type === "coding" && (
          <>
            <div className="p-4 border-b border-border">
              <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger data-testid="select-language" className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="python">Python 3</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 p-4 bg-gray-900 dark:bg-gray-950">
              <Textarea
                data-testid="textarea-code-editor"
                className="w-full h-full bg-transparent text-gray-100 dark:text-gray-100 font-mono text-sm resize-none focus:outline-none border-none placeholder:text-gray-400"
                placeholder="Write your code here..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                {...copyRestriction}
              />
            </div>
            
            <div className="p-4 border-t border-border flex space-x-4">
              <Button
                variant="outline"
                data-testid="button-run-code"
                onClick={handleRunCode}
                disabled={runCodeMutation.isPending || !code.trim()}
              >
                <Play className="mr-2 h-4 w-4" />
                {runCodeMutation.isPending ? "Running..." : "Run Code"}
              </Button>
              <Button
                data-testid="button-submit-solution"
                className="bg-success text-success-foreground hover:bg-success/90"
                onClick={handleSubmit}
                disabled={submitMutation.isPending || !code.trim()}
              >
                <Check className="mr-2 h-4 w-4" />
                {submitMutation.isPending ? "Submitting..." : "Submit"}
              </Button>
            </div>

            {/* Code Output Section */}
            <div className="px-4 pb-4">
              <CodeOutput 
                result={executionResult} 
                isLoading={runCodeMutation.isPending} 
              />
            </div>
          </>
        )}
        
        {(question.type === "mcq" || question.type === "ctf") && (
          <div className="flex-1 flex flex-col justify-end p-6">
            <Button
              data-testid="button-submit-answer"
              className="w-full bg-success text-success-foreground hover:bg-success/90"
              onClick={handleSubmit}
              disabled={
                submitMutation.isPending || 
                (question.type === "mcq" && !mcqAnswer) ||
                (question.type === "ctf" && !ctfFlag.trim())
              }
            >
              <Send className="mr-2 h-4 w-4" />
              {submitMutation.isPending ? "Submitting..." : "Submit Answer"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
