import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { auth } from "@/lib/auth";
import Login from "@/pages/login";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminUsers from "@/pages/admin-users";
import AdminQuestions from "@/pages/admin-questions";
import AdminLeaderboard from "@/pages/admin-leaderboard";
import StudentDashboard from "@/pages/student-dashboard";
import StudentPractice from "@/pages/student-practice";
import StudentContests from "@/pages/student-contests";
import StudentLeaderboard from "@/pages/student-leaderboard";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import NotFound from "@/pages/not-found";

function AuthenticatedApp() {
  const [user, setUser] = useState(auth.getUser());
  
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Switch>
            {user.role === "admin" ? (
              <>
                <Route path="/" component={AdminDashboard} />
                <Route path="/admin/dashboard" component={AdminDashboard} />
                <Route path="/admin/users" component={AdminUsers} />
                <Route path="/admin/questions" component={AdminQuestions} />
                <Route path="/admin/leaderboard" component={AdminLeaderboard} />
              </>
            ) : (
              <>
                <Route path="/" component={StudentDashboard} />
                <Route path="/student/dashboard" component={StudentDashboard} />
                <Route path="/student/practice" component={StudentPractice} />
                <Route path="/student/contests" component={StudentContests} />
                <Route path="/student/leaderboard" component={StudentLeaderboard} />
              </>
            )}
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="nfsu-coding-club-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AuthenticatedApp />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
