import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { getRelativeTime } from "@/lib/time";
import { Trophy, Medal, Award } from "lucide-react";

export default function StudentLeaderboard() {
  const user = auth.getUser();
  
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  if (isLoading) {
    return <div>Loading leaderboard...</div>;
  }

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);
  const userRank = leaderboard.findIndex((student: any) => student.id === user?.id) + 1;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leaderboard</CardTitle>
            <div className="flex items-center space-x-4">
              {userRank > 0 && (
                <Badge className="bg-primary/10 text-primary">
                  Your Rank: #{userRank}
                </Badge>
              )}
              <Select defaultValue="week">
                <SelectTrigger data-testid="select-leaderboard-period" className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Top 3 Special Display */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {topThree.map((student: any, index) => {
                const icons = [
                  <Trophy className="h-8 w-8 text-yellow-500" />,
                  <Medal className="h-8 w-8 text-gray-400" />,
                  <Award className="h-8 w-8 text-amber-600" />
                ];
                
                const backgrounds = [
                  "bg-gradient-to-br from-accent to-primary text-white",
                  "bg-gradient-to-br from-muted to-border",
                  "bg-gradient-to-br from-accent/20 to-primary/20"
                ];

                const isCurrentUser = student.id === user?.id;

                return (
                  <div 
                    key={student.id} 
                    className={`${backgrounds[index]} p-6 rounded-lg text-center ${
                      isCurrentUser ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className="mb-2">{icons[index]}</div>
                    <h4 className={`font-bold text-lg ${index === 0 ? 'text-white' : 'text-foreground'}`}>
                      {student.name}
                    </h4>
                    <p className={`text-sm ${index === 0 ? 'opacity-90 text-white' : 'text-muted-foreground'}`}>
                      {student.studentId}
                    </p>
                    <p className={`text-2xl font-bold mt-2 ${index === 0 ? 'text-white' : 'text-foreground'}`}>
                      {student.points} pts
                    </p>
                    {isCurrentUser && (
                      <Badge className="mt-2 bg-white/20 text-white">You</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Full Leaderboard Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rank</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Problems Solved</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total Points</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Last Activity</th>
                </tr>
              </thead>
              <tbody data-testid="table-student-leaderboard">
                {remaining.map((student: any) => {
                  const isCurrentUser = student.id === user?.id;
                  
                  return (
                    <tr 
                      key={student.id} 
                      className={`border-b border-border hover:bg-muted/50 ${
                        isCurrentUser ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="ranking-badge">
                          {student.rank}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div>
                            <p className="font-medium text-foreground">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.studentId}</p>
                          </div>
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">{student.problemsSolved}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-success">{student.points} pts</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {student.lastLogin ? getRelativeTime(new Date(student.lastLogin)) : "Never"}
                      </td>
                    </tr>
                  );
                })}
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No leaderboard data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
