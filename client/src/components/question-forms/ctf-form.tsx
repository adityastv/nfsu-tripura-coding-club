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
import { Plus, X } from "lucide-react";
import type { Question, CTFQuestion } from "@shared/schema";

const ctfFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  flag: z.string().min(1, "Flag is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  points: z.number().min(1, "Points must be at least 1"),
});

type CTFFormData = z.infer<typeof ctfFormSchema>;

interface CTFFormProps {
  editingQuestion?: CTFQuestion | null;
  onCancel?: () => void;
}

export default function CTFForm({ editingQuestion, onCancel }: CTFFormProps) {
  const user = auth.getUser();
  const { toast } = useToast();
  const [hints, setHints] = useState<string[]>(editingQuestion?.hints || [""]);

  const form = useForm<CTFFormData>({
    resolver: zodResolver(ctfFormSchema),
    defaultValues: {
      title: editingQuestion?.title || "",
      description: editingQuestion?.description || "",
      flag: editingQuestion?.flag || "",
      difficulty: editingQuestion?.difficulty || "Easy",
      points: editingQuestion?.points || 75,
    },
  });

  // Update form when editing question changes
  useEffect(() => {
    if (editingQuestion) {
      form.reset({
        title: editingQuestion.title,
        description: editingQuestion.description,
        flag: editingQuestion.flag,
        difficulty: editingQuestion.difficulty,
        points: editingQuestion.points,
      });
      setHints(editingQuestion.hints || [""]);
    } else {
      form.reset({
        title: "",
        description: "",
        flag: "",
        difficulty: "Easy",
        points: 75,
      });
      setHints([""]);
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
      setHints([""]);
      if (onCancel) onCancel();
      toast({
        title: "Success",
        description: editingQuestion 
          ? "CTF challenge updated successfully" 
          : "CTF challenge created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: editingQuestion 
          ? "Failed to update challenge" 
          : "Failed to create challenge",
        variant: "destructive",
      });
    },
  });

  const addHint = () => {
    setHints([...hints, ""]);
  };

  const removeHint = (index: number) => {
    if (hints.length > 1) {
      setHints(hints.filter((_, i) => i !== index));
    }
  };

  const updateHint = (index: number, value: string) => {
    const newHints = [...hints];
    newHints[index] = value;
    setHints(newHints);
  };

  const onSubmit = async (data: CTFFormData) => {
    if (!user) return;

    const filteredHints = hints.filter(hint => hint.trim() !== "");

    const questionData = {
      type: "ctf",
      title: data.title,
      description: data.description,
      flag: data.flag,
      hints: filteredHints.length > 0 ? filteredHints : undefined,
      difficulty: data.difficulty,
      points: data.points,
      createdBy: user.id,
      updatedBy: user.id,
    };

    createQuestionMutation.mutate(questionData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-create-ctf">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Challenge Title</FormLabel>
              <FormControl>
                <Input
                  data-testid="input-ctf-title"
                  placeholder="e.g., Simple Caesar Cipher"
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
              <FormLabel>Challenge Description</FormLabel>
              <FormControl>
                <Textarea
                  data-testid="textarea-ctf-description"
                  rows={6}
                  placeholder="Describe the challenge, provide any necessary context or clues..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="flag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Flag (Correct Answer)</FormLabel>
              <FormControl>
                <Input
                  data-testid="input-ctf-flag"
                  placeholder="Enter the correct flag/answer"
                  className="font-mono"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <Label className="text-sm font-medium text-foreground mb-3 block">
            Hints (Optional)
          </Label>
          <div className="space-y-3">
            {hints.map((hint, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  data-testid={`input-ctf-hint-${index}`}
                  placeholder={`Hint ${index + 1}...`}
                  value={hint}
                  onChange={(e) => updateHint(index, e.target.value)}
                  className="flex-1"
                />
                {hints.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-testid={`button-remove-hint-${index}`}
                    onClick={() => removeHint(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                {index === hints.length - 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-testid="button-add-hint"
                    onClick={addHint}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-ctf-difficulty">
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
                    data-testid="input-ctf-points"
                    type="number"
                    placeholder="75"
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
            data-testid="button-create-ctf"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={createQuestionMutation.isPending}
          >
            {createQuestionMutation.isPending 
              ? (editingQuestion ? "Updating..." : "Creating...") 
              : (editingQuestion ? "Update Challenge" : "Create Challenge")
            }
          </Button>
          <Button
            type="button"
            variant="outline"
            data-testid="button-cancel-ctf"
            onClick={() => {
              form.reset();
              setHints([""]);
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
