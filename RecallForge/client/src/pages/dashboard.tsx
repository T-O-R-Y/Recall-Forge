import { useQuery } from "@tanstack/react-query";
import { TopBar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Layers, 
  CheckCircle, 
  Clock, 
  Target, 
  Play, 
  Plus, 
  Eye,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { QuizModal } from "@/components/quiz-modal";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";

export default function Dashboard() {
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

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

  const { data: stats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  if (isLoading || statsLoading) {
    return (
      <div className="main-content">
        <TopBar title="대시보드" subtitle="로딩 중..." showCreateButton={false} showSearch={false} />
        <main className="p-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-12 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
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
        title="대시보드" 
        subtitle="오늘도 열심히 공부해볼까요?"
        onCreateNew={() => setLocation("/create")}
      />
      
      <main className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">총 암기 카드</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {stats?.totalCards || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Layers className="text-study-blue text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">완료한 퀴즈</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {stats?.completedQuizzes || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-study-green text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">컬렉션 수</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {stats?.totalCollections || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-study-purple text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">연속 학습일</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {stats?.studyStreak || 0}일
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Target className="text-amber-500 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Collections */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800">최근 컬렉션</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setLocation("/collections")}
                    className="text-study-blue hover:text-blue-600"
                  >
                    전체 보기
                  </Button>
                </div>
              </div>
              <CardContent className="p-6">
                {stats?.recentCollections?.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentCollections.map((collection: any) => (
                      <div 
                        key={collection.id}
                        className="flex items-start justify-between p-4 border border-slate-200 rounded-lg hover:border-study-blue transition-colors cursor-pointer"
                        onClick={() => setLocation(`/collections/${collection.id}`)}
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-800">{collection.title}</h4>
                          <p className="text-slate-600 text-sm mt-1">{collection.description}</p>
                          <div className="flex items-center space-x-4 mt-3">
                            <span className="text-xs bg-blue-100 text-study-blue px-2 py-1 rounded">
                              {collection.category}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(collection.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500">아직 컬렉션이 없습니다.</p>
                    <Button 
                      onClick={() => setLocation("/create")}
                      className="mt-4 bg-study-blue text-white hover:bg-blue-600"
                    >
                      첫 번째 컬렉션 만들기
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Progress */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">빠른 작업</h3>
                <div className="space-y-3">
                  <Button
                    onClick={() => setShowQuizModal(true)}
                    variant="outline"
                    className="w-full justify-start space-x-3 p-3 h-auto hover:border-study-blue hover:bg-blue-50"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Play className="w-4 h-4 text-study-blue" />
                    </div>
                    <span className="font-medium text-slate-700">퀴즈 시작</span>
                  </Button>
                  
                  <Button
                    onClick={() => setLocation("/create")}
                    variant="outline"
                    className="w-full justify-start space-x-3 p-3 h-auto hover:border-study-blue hover:bg-blue-50"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Plus className="w-4 h-4 text-study-green" />
                    </div>
                    <span className="font-medium text-slate-700">카드 만들기</span>
                  </Button>
                  
                  <Button
                    onClick={() => setLocation("/collections")}
                    variant="outline"
                    className="w-full justify-start space-x-3 p-3 h-auto hover:border-study-blue hover:bg-blue-50"
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Eye className="w-4 h-4 text-study-purple" />
                    </div>
                    <span className="font-medium text-slate-700">복습하기</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Study Progress */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">학습 현황</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">총 카드 수</span>
                      <span className="font-medium text-slate-800">{stats?.totalCards || 0}개</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-study-blue h-2 rounded-full" 
                        style={{ width: `${Math.min((stats?.totalCards || 0) / 100 * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">완료한 퀴즈</span>
                      <span className="font-medium text-slate-800">{stats?.completedQuizzes || 0}개</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-study-green h-2 rounded-full" 
                        style={{ width: `${Math.min((stats?.completedQuizzes || 0) / 50 * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600">연속 학습일</p>
                    <p className="text-2xl font-bold text-slate-800">{stats?.studyStreak || 0}일</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <QuizModal 
          isOpen={showQuizModal} 
          onClose={() => setShowQuizModal(false)} 
        />
      </main>
    </div>
  );
}
