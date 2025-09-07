import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Clock, Calendar } from "lucide-react";
import { getISTTime, formatISTTime, formatISTDate } from "@/lib/time";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Header() {
  const [location] = useLocation();
  const [currentTime, setCurrentTime] = useState(getISTTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getISTTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getPageTitle = (path: string) => {
    const titles: Record<string, string> = {
      "/": "Dashboard",
      "/admin/users": "User Management",
      "/admin/questions": "Question Management", 
      "/admin/leaderboard": "Leaderboard",
      "/student/practice": "Practice Problems",
      "/student/contests": "Contests",
      "/student/leaderboard": "Leaderboard"
    };
    return titles[path] || "Dashboard";
  };

  const getPageDescription = (path: string) => {
    if (path.startsWith("/admin")) {
      return "Welcome to the coding club management platform";
    }
    return "Continue your coding journey and improve your skills";
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground" data-testid="text-page-title">
            {getPageTitle(location)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {getPageDescription(location)}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            <span data-testid="text-current-time">IST: {formatISTTime(currentTime)}</span>
          </div>
          <div className="text-sm text-muted-foreground flex items-center">
            <Calendar className="mr-1 h-4 w-4" />
            <span data-testid="text-current-date">{formatISTDate(currentTime)}</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
