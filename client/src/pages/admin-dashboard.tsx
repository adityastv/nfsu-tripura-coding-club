import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Code, Send, TrendingUp, CheckCircle, Star } from "lucide-react";
import { getRelativeTime } from "@/lib/time";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/activities"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
    refetchInterval: 10000,
  });

  if (statsLoading) {
    return <div className="space-y-6">Loading dashboard...</div>;
  }

  const topPerformers = leaderboard?.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-total-students">
                  {stats?.totalStudents || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="text-primary text-xl h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Questions</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-active-questions">
                  {stats?.activeQuestions || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Code className="text-secondary text-xl h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submissions Today</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-submissions-today">
                  {stats?.submissionsToday || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Send className="text-accent text-xl h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-active-users">
                  {stats?.activeUsers || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-success text-xl h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
            {activitiesLoading ? (
              <div>Loading activities...</div>
            ) : (
              <div className="space-y-4" data-testid="list-recent-activities">
                {activities?.map((activity: any) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {getRelativeTime(new Date(activity.timestamp))}
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground">No recent activities</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Top Performers This Week</h3>
            {leaderboardLoading ? (
              <div>Loading top performers...</div>
            ) : (
              <div className="space-y-3" data-testid="list-top-performers">
                {topPerformers.map((performer: any, index: number) => (
                  <div key={performer.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="ranking-badge">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{performer.name}</p>
                        <p className="text-xs text-muted-foreground">{performer.studentId}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-success">{performer.points} pts</span>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground">No performance data available</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
