import { cn } from "@/lib/utils";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "@/hooks/use-translation";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Plus, 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  Search, 
  LogOut, 
  Brain,
  Menu
} from "lucide-react";

const navigationItems = [
  { path: "/", labelKey: "dashboard", icon: LayoutDashboard },
  { path: "/create", labelKey: "createFlashcard", icon: Plus },
  { path: "/collections", labelKey: "myCollections", icon: BookOpen },
  { path: "/quiz", labelKey: "quiz", icon: Trophy },
  { path: "/progress", labelKey: "progress", icon: TrendingUp },
  { path: "/search", labelKey: "search", icon: Search },
];

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-study-blue to-study-purple rounded-lg flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">StudyMemo</h1>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2 flex-1">
        {navigationItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <div 
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                location === item.path
                  ? "bg-study-blue text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-gray-800"
              )}
              onClick={onLinkClick}
            >
              <item.icon className="w-5 h-5" />
              <span>{t(item.labelKey)}</span>
            </div>
          </Link>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-slate-200 dark:border-gray-700 space-y-2">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-study-blue to-study-purple flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.firstName?.[0] || user?.username?.[0] || "U"}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-800 dark:text-white">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.username || "사용자"}
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-400">{t('studyMemoUser')}</p>
          </div>
        </div>
        <Button
          onClick={() => {
            logoutMutation.mutate();
            onLinkClick?.();
          }}
          variant="ghost"
          className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800"
        >
          <LogOut className="w-5 h-5 mr-3" />
          {t('logout')}
        </Button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="fixed top-4 left-4 z-[100] lg:hidden bg-white shadow-md hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 z-[90]">
          <SidebarContent onLinkClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="w-64 bg-white shadow-lg border-r border-slate-200 fixed h-full z-10 dark:bg-gray-900 dark:border-gray-700">
      <SidebarContent />
    </div>
  );
}