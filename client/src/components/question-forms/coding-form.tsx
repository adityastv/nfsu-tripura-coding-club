import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { auth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Question, CodingQuestion } from "@shared/schema";

const codingFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  inputFormat: z.string().min(1, "Input format is required"),
  outputFormat: z.string().min(1, "Output format is required"),
  sampleInput: z.string().min(1, "Sample input is required"),
  sampleOutput: z.string().min(1, "Sample output is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  points: z.number().min(1, "Points must be at least 1"),
  timeLimit: z.number().min(100, "Time limit must be at least 100ms"),
  memoryLimit: z.number().min(1, "Memory limit must be at least 1MB"),
});

type CodingFormData = z.infer<typeof codingFormSchema>;

interface CodingFormProps {
  editingQuestion?: CodingQuestion | null;
  onCancel?: () => void;
}

export default function CodingForm({ editingQuestion, onCancel }: CodingFormProps) {
  const user = auth.getUser();
  const { toast } = useToast();

  const form = useForm<CodingFormData>({
    resolver: zodResolver(codingFormSchema),
    defaultValues: {
      title: editingQuestion?.title || "",
      description: editingQuestion?.description || "",
      inputFormat: editingQuestion?.inputFormat || "",
      outputFormat: editingQuestion?.outputFormat || "",
      sampleInput: editingQuestion?.sampleInput || "",
      sampleOutput: editingQuestion?.sampleOutput || "",
      difficulty: editingQuestion?.difficulty || "Easy",
      points: editingQuestion?.points || 100,
      timeLimit: editingQuestion?.timeLimit || 1000,
      memoryLimit: editingQuestion?.memoryLimit || 256,
    },
  });

  // Update form when editing question changes
  useEffect(() => {
    if (editingQuestion) {
      form.reset({
        title: editingQuestion.title,
        description: editingQuestion.description,
        inputFormat: editingQuestion.inputFormat,
        outputFormat: editingQuestion.outputFormat,
        sampleInput: editingQuestion.sampleInput,
        sampleOutput: editingQuestion.sampleOutput,
        difficulty: editingQuestion.difficulty,
        points: editingQuestion.points,
        timeLimit: editingQuestion.timeLimit,
        memoryLimit: editingQuestion.memoryLimit,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        inputFormat: "",
        outputFormat: "",
        sampleInput: "",
        sampleOutput: "",
        difficulty: "Easy",
        points: 100,
        timeLimit: 1000,
        memoryLimit: 256,
      });
    }
  }, [editingQuestion, form]);

  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: any) => {
      const method = editingQuestion ? "PUT" : "POST";
      const url = editingQuestion ? `/api/questions/${editingQuestion.id}` : "/api/questions";
      const response = await apiRequest(method, url, questionData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      form.reset();
      if (onCancel) onCancel();
      toast({
        title: "Success",
        description: editingQuestion 
          ? "Coding question updated successfully" 
          : "Coding question created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: editingQuestion 
          ? "Failed to update question" 
          : "Failed to create question",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CodingFormData) => {
    if (!user) return;

    const questionData = {
      type: "coding",
      title: data.title,
      description: data.description,
      inputFormat: data.inputFormat,
      outputFormat: data.outputFormat,
      sampleInput: data.sampleInput,
      sampleOutput: data.sampleOutput,
      difficulty: data.difficulty,
      points: data.points,
      timeLimit: data.timeLimit,
      memoryLimit: data.memoryLimit,
      createdBy: user.id,
      updatedBy: user.id,
    };

    createQuestionMutation.mutate(questionData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-create-coding">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Problem Title</FormLabel>
              <FormControl>
                <Input
                  data-testid="input-coding-title"
                  placeholder="e.g., Two Sum Problem"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Problem Statement</FormLabel>
              <FormControl>
                <Textarea
                  data-testid="textarea-coding-description"
                  rows={6}
                  placeholder="Describe the problem in detail..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="inputFormat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Input Format</FormLabel>
                <FormControl>
                  <Textarea
                    data-testid="textarea-coding-input-format"
                    rows={3}
                    placeholder="Describe input format..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="outputFormat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Output Format</FormLabel>
                <FormControl>
                  <Textarea
                    data-testid="textarea-coding-output-format"
                    rows={3}
                    placeholder="Describe output format..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div>
          <Label className="text-sm font-medium text-foreground mb-3 block">Sample Test Cases</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="sampleInput"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Sample Input</FormLabel>
                  <FormControl>
                    <Textarea
                      data-testid="textarea-coding-sample-input"
                      rows={3}
                      placeholder="Sample input..."
                      className="font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sampleOutput"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Expected Output</FormLabel>
                  <FormControl>
                    <Textarea
                      data-testid="textarea-coding-sample-output"
                      rows={3}
                      placeholder="Expected output..."
                      className="font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-coding-difficulty">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="points"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Points</FormLabel>
                <FormControl>
                  <Input
                    data-testid="input-coding-points"
                    type="number"
                    placeholder="100"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="timeLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time Limit (ms)</FormLabel>
                <FormControl>
                  <Input
                    data-testid="input-coding-time-limit"
                    type="number"
                    placeholder="1000"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="memoryLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Memory Limit (MB)</FormLabel>
                <FormControl>
                  <Input
                    data-testid="input-coding-memory-limit"
                    type="number"
                    placeholder="256"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex space-x-4">
          <Button
            type="submit"
            data-testid="button-create-coding"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={createQuestionMutation.isPending}
          >
            {createQuestionMutation.isPending 
              ? (editingQuestion ? "Updating..." : "Creating...") 
              : (editingQuestion ? "Update Question" : "Create Question")
            }
          </Button>
          <Button
            type="button"
            variant="outline"
            data-testid="button-cancel-coding"
            onClick={() => {
              form.reset();
              if (onCancel) onCancel();
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
