import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getRelativeTime } from "@/lib/time";
import { Trophy, Medal, Award } from "lucide-react";

export default function AdminLeaderboard() {
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  if (isLoading) {
    return <div>Loading leaderboard...</div>;
  }

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leaderboard</CardTitle>
            <Select defaultValue="week">
              <SelectTrigger data-testid="select-time-period" className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
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
                  "bg-gradient-to-br from-accent to-primary",
                  "bg-gradient-to-br from-muted to-border",
                  "bg-gradient-to-br from-accent/20 to-primary/20"
                ];

                return (
                  <div key={student.id} className={`${backgrounds[index]} p-6 rounded-lg text-center`}>
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
              <tbody data-testid="table-leaderboard">
                {remaining.map((student: any) => (
                  <tr key={student.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="ranking-badge">
                        {student.rank}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.studentId}</p>
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
                ))}
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No student data available
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
