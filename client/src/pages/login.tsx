import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { LogIn, GraduationCap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isAdminLogin, setIsAdminLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Remove this line
  const { toast } = useToast();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const user = await auth.login(username, password);
      if (user) {
        onLogin(user);
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid admin credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const user = await auth.login(studentId, studentPassword);
      if (user) {
        onLogin(user);
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid student credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="indian-flag-accent mb-4"></div>
            <h1 className="text-2xl font-bold text-foreground">NFSU Tripura Coding Club</h1>
            <p className="text-muted-foreground mt-2">Management Platform</p>
          </div>
          
          <div className="mb-6">
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                data-testid="tab-admin-login"
                variant={isAdminLogin ? "default" : "ghost"}
                className={`flex-1 ${isAdminLogin ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                onClick={() => setIsAdminLogin(true)}
              >
                Admin Login
              </Button>
              <Button
                data-testid="tab-student-login"
                variant={!isAdminLogin ? "default" : "ghost"}
                className={`flex-1 ${!isAdminLogin ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                onClick={() => setIsAdminLogin(false)}
              >
                Student Login
              </Button>
            </div>
          </div>
          
          {isAdminLogin ? (
            <form onSubmit={handleAdminLogin} className="space-y-4" data-testid="form-admin-login">
              <div>
                <Label htmlFor="admin-username">Username</Label>
                <Input
                  id="admin-username"
                  data-testid="input-admin-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  required
                />
              </div>
              <div>
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  data-testid="input-admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </div>
              <Button
                type="submit"
                data-testid="button-admin-login"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                <LogIn className="mr-2 h-4 w-4" />
                {isLoading ? "Logging in..." : "Login as Admin"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleStudentLogin} className="space-y-4" data-testid="form-student-login">
              <div>
                <Label htmlFor="student-id">Student ID</Label>
                <Input
                  id="student-id"
                  data-testid="input-student-id"
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter student ID (e.g., STU001)"
                  required
                />
              </div>
              <div>
                <Label htmlFor="student-password">Password</Label>
                <Input
                  id="student-password"
                  data-testid="input-student-password"
                  type="password"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              <Button
                type="submit"
                data-testid="button-student-login"
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                disabled={isLoading}
              >
                <GraduationCap className="mr-2 h-4 w-4" />
                {isLoading ? "Logging in..." : "Login as Student"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
