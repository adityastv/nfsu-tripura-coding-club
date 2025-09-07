import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { auth } from "@/lib/auth";
import CodeEditor from "@/components/code-editor";
import { Users, Clock, CheckCircle } from "lucide-react";
import type { Question, Submission } from "@shared/schema";

export default function StudentPractice() {
  const user = auth.getUser();
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
  });

  const { data: submissions = [] } = useQuery<Submission[]>({
    queryKey: ["/api/submissions/user", user?.id],
    enabled: !!user?.id,
  });

  // Get question statistics
  const getQuestionStats = (questionId: string) => {
    const questionSubmissions = submissions.filter((sub: any) => sub.questionId === questionId);
    const totalSubmissions = questionSubmissions.length;
    const correctSubmissions = questionSubmissions.filter((sub: any) => sub.isCorrect).length;
    
    return {
      solved: correctSubmissions > 0,
      attempts: totalSubmissions
    };
  };

  // Filter questions
  const filteredQuestions = questions.filter(question => {
    const matchesDifficulty = difficultyFilter === "all" || question.difficulty === difficultyFilter;
    const matchesType = typeFilter === "all" || question.type === typeFilter;
    return matchesDifficulty && matchesType;
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

  const handleSolveProblem = (question: Question) => {
    setSelectedQuestion(question);
    if (question.type === "coding") {
      setIsEditorOpen(true);
    } else {
      // For MCQ and CTF, we could open a different modal
      setIsEditorOpen(true);
    }
  };

  if (isLoading) {
    return <div>Loading practice problems...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Practice Problems</h3>
        <div className="flex space-x-4">
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger data-testid="select-difficulty-filter" className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger data-testid="select-type-filter" className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="mcq">MCQ</SelectItem>
              <SelectItem value="coding">Coding</SelectItem>
              <SelectItem value="ctf">CTF</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="grid-practice-problems">
        {filteredQuestions.map((question) => {
          const stats = getQuestionStats(question.id);
          const submissionCount = submissions.filter((sub: any) => sub.questionId === question.id).length;
          
          return (
            <Card key={question.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getTypeColor(question.type)}>
                        {question.type.toUpperCase()}
                      </Badge>
                      <Badge className={getDifficultyColor(question.difficulty)}>
                        {question.difficulty}
                      </Badge>
                      {stats.solved && (
                        <Badge className="bg-success/10 text-success">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Solved
                        </Badge>
                      )}
                    </div>
                    <h4 className="text-lg font-semibold text-foreground">{question.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {question.description.length > 100 
                        ? `${question.description.substring(0, 100)}...`
                        : question.description
                      }
                    </p>
                  </div>
                  <span className="text-sm font-medium text-accent">{question.points} pts</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>
                      <Users className="inline mr-1 h-3 w-3" />
                      {submissionCount} solved
                    </span>
                    {question.type === "coding" && (
                      <span>
                        <Clock className="inline mr-1 h-3 w-3" />
                        Time: {(question as any).timeLimit / 1000}s
                      </span>
                    )}
                  </div>
                  <Button
                    data-testid={`button-solve-${question.id}`}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => handleSolveProblem(question)}
                  >
                    {stats.solved ? "Review" : question.type === "mcq" ? "Start" : "Solve"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {filteredQuestions.length === 0 && (
          <div className="col-span-2 text-center py-8 text-muted-foreground">
            No problems found matching your criteria
          </div>
        )}
      </div>

      {/* Code Editor Modal */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden" data-testid="dialog-code-editor">
          {selectedQuestion && (
            <>
              <DialogHeader className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-lg font-semibold">{selectedQuestion.title}</DialogTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getDifficultyColor(selectedQuestion.difficulty)}>
                        {selectedQuestion.difficulty}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {selectedQuestion.points} points
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>
              <CodeEditor question={selectedQuestion} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
