import { Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled
      data-testid="button-theme-toggle"
      className="cursor-default"
    >
      <Moon className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Dark theme active</span>
    </Button>
  );
}