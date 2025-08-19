import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/contexts/theme-context";
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import CreateCard from "@/pages/create-card";
import Collections from "@/pages/collections";
import Quiz from "@/pages/quiz";
import Search from "@/pages/search";
import ProgressPage from "@/pages/progress";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  const { user, isLoading } = useAuth();

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-gray-900">
      {user && !isLoading && <Sidebar />}
      <main className={cn(
        "min-h-screen w-full transition-all duration-300",
        user && !isLoading ? "lg:ml-64 pt-16 lg:pt-0" : ""
      )}>
        <Switch>
        {!user ? (
          <>
            <Route path="/" component={Landing} />
            <Route path="/auth" component={AuthPage} />
          </>
        ) : (
          <>
            <ProtectedRoute path="/" component={Dashboard} />
            <ProtectedRoute path="/create" component={CreateCard} />
            <ProtectedRoute path="/collections" component={Collections} />
            <ProtectedRoute path="/quiz" component={Quiz} />
            <ProtectedRoute path="/quiz/:id" component={Quiz} />
            <ProtectedRoute path="/progress" component={ProgressPage} />
            <ProtectedRoute path="/search" component={Search} />
          </>
        )}
        <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
