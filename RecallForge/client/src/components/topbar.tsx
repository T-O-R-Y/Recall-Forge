import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";

import { ThemeToggle } from "@/components/theme-toggle";

interface TopBarProps {
  title: string;
  subtitle: string;
  onSearch?: (query: string) => void;
  onCreateNew?: () => void;
  showCreateButton?: boolean;
  showSearch?: boolean;
}

export function TopBar({
  title,
  subtitle,
  onSearch,
  onCreateNew,
  showCreateButton = true,
  showSearch = true
}: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();
  

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleCreateClick = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      setLocation("/create");
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-slate-200 dark:border-gray-700 px-4 lg:px-6 py-4 relative z-20">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Title Section */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white truncate">{title}</h2>
          <p className="text-slate-600 dark:text-slate-300 mt-1 text-sm lg:text-base truncate">{subtitle}</p>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4">
          {/* Theme Toggle */}
          <div className="flex justify-end sm:justify-center">
            <ThemeToggle />
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="relative flex-1 sm:flex-none">
              <Input
                type="text"
                placeholder="카드 검색..."
                value={searchQuery}
                onChange={handleSearchChange}
                className={`pl-10 pr-4 py-2 w-full ${isMobile ? 'sm:w-64' : 'lg:w-80'} dark:bg-gray-800 dark:border-gray-600 dark:text-white`}
              />
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
            </div>
          )}

          {/* Create Button */}
          {showCreateButton && (
            <Button
              onClick={handleCreateClick}
              className="bg-study-blue text-white hover:bg-blue-600 flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span className="whitespace-nowrap">새 카드</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}