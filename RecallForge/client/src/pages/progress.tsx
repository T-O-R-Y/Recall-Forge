import { useQuery } from "@tanstack/react-query";
import { TopBar } from "@/components/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Trophy, Target, Calendar, BookOpen, Brain } from "lucide-react";

export default function ProgressPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: progress, isLoading: progressLoading } = useQuery<any>({
    queryKey: ["/api/progress"],
  });

  const isLoading = statsLoading || progressLoading;

  // Calculate some example progress metrics
  const totalStudyDays = 15; // This would come from the API
  const studyStreak = 5; // This would come from the API
  const averageAccuracy = 85; // This would come from the API
  const weeklyGoal = 50; // This would come from the API
  const weeklyProgress = 35; // This would come from the API

  return (
    <div className="main-content">
      <TopBar 
        title="학습 진도" 
        subtitle="당신의 학습 성과를 확인해보세요"
        showCreateButton={false}
        showSearch={false}
      />
      <main className="p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 카드</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalCards || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalCollections || 0}개 컬렉션
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">연속 학습일</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{studyStreak}</div>
                <p className="text-xs text-muted-foreground">
                  총 {totalStudyDays}일 학습
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">평균 정답률</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageAccuracy}%</div>
                <p className="text-xs text-muted-foreground">
                  지난 30일 기준
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">완료한 퀴즈</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.completedQuizzes || 0}</div>
                <p className="text-xs text-muted-foreground">
                  이번 주 완료
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-study-blue" />
                <span>주간 학습 목표</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">
                  이번 주 진행도: {weeklyProgress}/{weeklyGoal} 카드
                </span>
                <Badge variant={weeklyProgress >= weeklyGoal ? "default" : "secondary"}>
                  {Math.round((weeklyProgress / weeklyGoal) * 100)}%
                </Badge>
              </div>
              <Progress value={(weeklyProgress / weeklyGoal) * 100} className="h-3" />
              <p className="text-xs text-slate-500">
                목표 달성까지 {Math.max(0, weeklyGoal - weeklyProgress)}개 카드 남았습니다
              </p>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-study-purple" />
                  <span>최근 학습 활동</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium">기본 영어 단어</p>
                        <p className="text-sm text-slate-500">퀴즈 완료 - 85% 정답률</p>
                      </div>
                      <span className="text-sm text-slate-400">2시간 전</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium">한국사 기본</p>
                        <p className="text-sm text-slate-500">새 카드 5개 추가</p>
                      </div>
                      <span className="text-sm text-slate-400">1일 전</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium">수학 공식</p>
                        <p className="text-sm text-slate-500">퀴즈 완료 - 92% 정답률</p>
                      </div>
                      <span className="text-sm text-slate-400">2일 전</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span>성취도</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">연속 학습자</p>
                      <p className="text-sm text-slate-600">5일 연속 학습 달성!</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">정확한 학습자</p>
                      <p className="text-sm text-slate-600">정답률 80% 이상 달성!</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">컬렉션 마스터</p>
                      <p className="text-sm text-slate-600">첫 번째 컬렉션 완성!</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}