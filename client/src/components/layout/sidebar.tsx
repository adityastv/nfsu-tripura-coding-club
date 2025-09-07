import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { 
  ChartLine, 
  Users, 
  Code, 
  Trophy, 
  Home, 
  Clock, 
  LogOut 
} from "lucide-react";

export default function Sidebar() {
  const [user, setUser] = useState(auth.getUser());
  const [location, navigate] = useLocation();
  
  const handleLogout = () => {
    auth.logout();
    setUser(null);
    window.location.reload();
  };

  if (!user) return null;

  const adminNavItems = [
    { path: "/", icon: ChartLine, label: "Dashboard" },
    { path: "/admin/users", icon: Users, label: "User Management" },
    { path: "/admin/questions", icon: Code, label: "Question Management" },
    { path: "/admin/leaderboard", icon: Trophy, label: "Leaderboard" },
  ];

  const studentNavItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/student/practice", icon: Code, label: "Practice" },
    { path: "/student/contests", icon: Clock, label: "Contests" },
    { path: "/student/leaderboard", icon: Trophy, label: "Leaderboard" },
  ];

  const navItems = user.role === "admin" ? adminNavItems : studentNavItems;

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="indian-flag-accent mb-2"></div>
        <h1 className="text-lg font-bold text-foreground">NFSU Coding Club</h1>
        <p className="text-sm text-muted-foreground">Management Platform</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Button
              key={item.path}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              variant="ghost"
              className={`w-full justify-start ${
                isActive 
                  ? user.role === "admin" 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  : "text-foreground hover:bg-muted"
              }`}
              onClick={() => navigate(item.path)}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mr-3">
            <span data-testid="text-user-initial">{user.name[0].toUpperCase()}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground" data-testid="text-user-name">{user.name}</p>
            <p className="text-xs text-muted-foreground" data-testid="text-user-role">
              {user.role === "admin" ? "Administrator" : "Student"}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            data-testid="button-logout"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
