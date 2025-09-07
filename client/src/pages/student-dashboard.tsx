import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { getRelativeTime } from "@/lib/time";
import { CheckCircle, Trophy, Star, ArrowRight, Check, X } from "lucide-react";
import { useLocation } from "wouter";

export default function StudentDashboard() {
  const [user, setUser] = useState(auth.getUser());
  const [, navigate] = useLocation();
  
  useEffect(() => {
    setUser(auth.getUser());
  }, []);
  
  const { data: submissions = [] } = useQuery({
    queryKey: ["/api/submissions/user", user?.id],
    enabled: !!user?.id,
  });

  const { data: questions = [] } = useQuery({
    queryKey: ["/api/questions"],
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ["/api/leaderboard"],
  });

  const userRank = leaderboard.findIndex((student: any) => student.id === user?.id) + 1;
  const recentSubmissions = submissions.slice(0, 3);
  
  // Get recommended problems (unsolved ones, starting with easy)
  const solvedQuestionIds = new Set(submissions.filter((sub: any) => sub.isCorrect).map((sub: any) => sub.questionId));
  const recommendedProblems = questions
    .filter((q: any) => !solvedQuestionIds.has(q.id))
    .sort((a: any, b: any) => {
      const difficultyOrder = { "Easy": 0, "Medium": 1, "Hard": 2 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    })
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-secondary to-primary p-6 rounded-lg text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h2>
        <p className="opacity-90">Continue your coding journey and improve your skills</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Problems Solved</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-problems-solved">
                  {user?.problemsSolved || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-success text-xl h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Rank</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-current-rank">
                  {userRank > 0 ? `#${userRank}` : "-"}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Trophy className="text-accent text-xl h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-total-points">
                  {user?.points || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Star className="text-primary text-xl h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recommended Problems</h3>
            <div className="space-y-3" data-testid="list-recommended-problems">
              {recommendedProblems.length > 0 ? recommendedProblems.map((problem: any) => (
                <div key={problem.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{problem.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={
                        problem.difficulty === "Easy" ? "bg-success/10 text-success" :
                        problem.difficulty === "Medium" ? "bg-accent/10 text-accent" :
                        "bg-destructive/10 text-destructive"
                      }>
                        {problem.difficulty}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{problem.points} pts</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    data-testid={`button-solve-problem-${problem.id}`}
                    onClick={() => navigate("/student/practice")}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">All problems completed! Great job!</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Submissions</h3>
            <div className="space-y-3" data-testid="list-recent-submissions">
              {recentSubmissions.length > 0 ? recentSubmissions.map((submission: any) => {
                const question = questions.find((q: any) => q.id === submission.questionId);
                return (
                  <div key={submission.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{question?.title || "Unknown Question"}</p>
                      <p className="text-xs text-muted-foreground">
                        {getRelativeTime(new Date(submission.submittedAt))}
                      </p>
                    </div>
                    <Badge className={
                      submission.isCorrect 
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    }>
                      {submission.isCorrect ? (
                        <>
                          <Check className="mr-1 h-3 w-3" />
                          Accepted
                        </>
                      ) : (
                        <>
                          <X className="mr-1 h-3 w-3" />
                          Wrong Answer
                        </>
                      )}
                    </Badge>
                  </div>
                );
              }) : (
                <p className="text-sm text-muted-foreground">No submissions yet. Start solving problems!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
