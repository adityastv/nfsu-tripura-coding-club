import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Trophy, Users } from "lucide-react";

export default function StudentContests() {
  // For now, this is a placeholder for future contest functionality
  const upcomingContests = [
    {
      id: "1",
      title: "Weekly Coding Challenge #1",
      description: "Algorithmic problems focusing on arrays and strings",
      startTime: "2024-12-20T10:00:00",
      duration: 120, // minutes
      participants: 45,
      prizes: ["Trophy", "Certificate", "Badge"]
    },
    {
      id: "2", 
      title: "CTF Challenge: Web Security",
      description: "Capture the flag challenges focusing on web vulnerabilities",
      startTime: "2024-12-22T14:00:00",
      duration: 180,
      participants: 32,
      prizes: ["Trophy", "Certificate"]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Contests</h3>
      </div>

      {/* Upcoming Contests */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Contests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4" data-testid="list-upcoming-contests">
            {upcomingContests.map((contest) => (
              <Card key={contest.id} className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-foreground">{contest.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{contest.description}</p>
                    </div>
                    <Badge className="bg-accent/10 text-accent">Upcoming</Badge>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-4">
                    <span>
                      <Clock className="inline mr-1 h-4 w-4" />
                      {contest.duration} minutes
                    </span>
                    <span>
                      <Users className="inline mr-1 h-4 w-4" />
                      {contest.participants} registered
                    </span>
                    <span>
                      <Trophy className="inline mr-1 h-4 w-4" />
                      {contest.prizes.join(", ")}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Starts: {new Date(contest.startTime).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          dateStyle: "medium",
                          timeStyle: "short"
                        })}
                      </p>
                    </div>
                    <Button 
                      data-testid={`button-register-contest-${contest.id}`}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Register
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Past Contests */}
      <Card>
        <CardHeader>
          <CardTitle>Past Contests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground" data-testid="empty-past-contests">
            <Trophy className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No past contests available</p>
            <p className="text-sm mt-1">Check back later for contest results and archives</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
