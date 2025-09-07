import { useState } from "react";
import { useQuery,useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2 } from "lucide-react";
import MCQForm from "@/components/question-forms/mcq-form";
import CodingForm from "@/components/question-forms/coding-form";
import CTFForm from "@/components/question-forms/ctf-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Question } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function AdminQuestions() {
  const [activeTab, setActiveTab] = useState("mcq");
  const { toast } = useToast();


  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const response = await apiRequest("DELETE", `/api/questions/${questionId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete Question",
        variant: "destructive",
      });
    },
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-success/10 text-success";
      case "Medium": return "bg-accent/10 text-accent";
      case "Hard": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "mcq": return "bg-primary/10 text-primary";
      case "coding": return "bg-secondary/10 text-secondary";
      case "ctf": return "bg-accent/10 text-accent";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return <div>Loading questions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Question Management</h3>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Question</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mcq" data-testid="tab-mcq">MCQ</TabsTrigger>
              <TabsTrigger value="coding" data-testid="tab-coding">Coding</TabsTrigger>
              <TabsTrigger value="ctf" data-testid="tab-ctf">CTF</TabsTrigger>
            </TabsList>
            
            <TabsContent value="mcq" className="mt-6">
              <MCQForm />
            </TabsContent>
            
            <TabsContent value="coding" className="mt-6">
              <CodingForm />
            </TabsContent>
            
            <TabsContent value="ctf" className="mt-6">
              <CTFForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Existing Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4" data-testid="list-questions">
            {questions.map((question) => (
              <div key={question.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge className={getTypeColor(question.type)}>
                      {question.type.toUpperCase()}
                    </Badge>
                    <Badge className={getDifficultyColor(question.difficulty)}>
                      {question.difficulty}
                    </Badge>
                  </div>
                  <h5 className="font-medium text-foreground">{question.title}</h5>
                  <p className="text-sm text-muted-foreground mt-1">
                    {question.description.length > 100 
                      ? `${question.description.substring(0, 100)}...` 
                      : question.description
                    }
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">{question.points} pts</span>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      data-testid={`button-edit-question-${question.id}`}
                      className="text-secondary hover:text-secondary/80"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      data-testid={`button-delete-question-${question.id}`}
                      className="text-destructive hover:text-destructive/80"
                      onClick={() => deleteUserMutation.mutate(question.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {questions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No questions created yet. Create your first question above.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
