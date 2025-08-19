import { TopBar } from "@/components/topbar";
import { CardForm } from "@/components/card-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function CreateCard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/auth");
      }, 500);
      return;
    }
  }, [user, isLoading, toast, setLocation]);

  if (isLoading) {
    return (
      <div className="main-content">
        <TopBar title="새 암기 카드" subtitle="로딩 중..." showCreateButton={false} showSearch={false} />
        <main className="p-6 w-full">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="main-content">
      <TopBar 
        title="새 암기 카드" 
        subtitle="새로운 암기 카드를 만들어보세요"
        showCreateButton={false}
        showSearch={false}
      />
      
      <main className="p-6 w-full">
        <CardForm />
      </main>
    </div>
  );
}
