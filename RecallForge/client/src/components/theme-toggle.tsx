
import { Moon, Sun, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/theme-context";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Settings className="h-4 w-4" />
          <span className="sr-only">설정</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>설정</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
          {theme === 'light' ? (
            <Moon className="mr-2 h-4 w-4" />
          ) : (
            <Sun className="mr-2 h-4 w-4" />
          )}
          {theme === 'light' ? '다크 모드' : '라이트 모드'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
