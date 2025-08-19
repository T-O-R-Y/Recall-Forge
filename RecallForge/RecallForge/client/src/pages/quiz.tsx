import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useRoute, Link } from "wouter";
import { TopBar } from "@/components/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Award, Play, BookOpen, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Quiz() {
  const [match, params] = useRoute("/quiz/:id");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [answers, setAnswers] = useState<Record<string, { answer: string; isCorrect: boolean; correctAnswer: string }>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();

  // If no quiz ID provided, show quiz selection page
  if (!params?.id) {
    return <QuizSelection />;
  }



  const { data: quiz, isLoading: quizLoading } = useQuery<any>({
    queryKey: ["/api/quizzes", params?.id],
    enabled: !!params?.id && !!user,
    retry: false,
  });

  const answerQuestionMutation = useMutation({
    mutationFn: async ({ questionId, userAnswer }: { questionId: string; userAnswer: string }) => {
      const response = await apiRequest("POST", `/api/quizzes/${params?.id}/answer`, {
        questionId,
        userAnswer,
      });
      return response.json();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      console.error("Error submitting answer:", error);
      toast({
        title: "오류",
        description: "답안을 제출하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const completeQuizMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/quizzes/${params?.id}/complete`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsCompleted(true);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      console.error("Error completing quiz:", error);
      toast({
        title: "오류",
        description: "퀴즈를 완료하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || !quiz?.questions[currentQuestionIndex]) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    
    try {
      const result = await answerQuestionMutation.mutateAsync({
        questionId: currentQuestion.id,
        userAnswer: userAnswer.trim(),
      });

      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: {
          answer: userAnswer.trim(),
          isCorrect: result.isCorrect,
          correctAnswer: result.correctAnswer,
        }
      }));

      setShowResult(true);

      // Auto advance to next question after 2 seconds
      setTimeout(() => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setUserAnswer("");
          setShowResult(false);
        } else {
          // Complete the quiz
          completeQuizMutation.mutate();
        }
      }, 2000);

    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showResult) {
      handleSubmitAnswer();
    }
  };

  if (!match || isLoading || quizLoading) {
    return (
      <div className="main-content">
        <TopBar title="퀴즈" subtitle="로딩 중..." showCreateButton={false} showSearch={false} />
        <main className="p-6">
          <div className="max-w-2xl mx-auto">
            <Card className="animate-pulse">
              <CardContent className="p-8">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!user || !quiz) {
    return null;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const correctAnswers = Object.values(answers).filter(a => a.isCorrect).length;

  // Quiz completion screen
  if (isCompleted) {
    const accuracy = (correctAnswers / quiz.questions.length) * 100;
    
    return (
      <div className="main-content">
        <TopBar title="퀴즈 완료" subtitle="수고하셨습니다!" showCreateButton={false} showSearch={false} />
        
        <main className="p-6">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="p-8">
                <Award className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-slate-800 mb-4">퀴즈 완료!</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600">정답률</p>
                    <p className="text-2xl font-bold text-study-blue">{accuracy.toFixed(1)}%</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600">정답 수</p>
                    <p className="text-2xl font-bold text-study-green">
                      {correctAnswers}/{quiz.questions.length}
                    </p>
                  </div>
                </div>

                {/* Results breakdown */}
                <div className="space-y-3 mb-6 text-left">
                  {quiz.questions.map((question: any, index: number) => {
                    const answer = answers[question.id];
                    return (
                      <div key={question.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{question.card.front}</p>
                          <p className="text-sm text-slate-600">정답: {question.card.back}</p>
                          {answer && (
                            <p className="text-sm text-slate-500">답안: {answer.answer}</p>
                          )}
                        </div>
                        {answer?.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation("/quiz")}
                    className="flex-1"
                  >
                    다른 퀴즈 보기
                  </Button>
                  <Button 
                    onClick={() => setLocation("/")}
                    className="flex-1 bg-study-blue text-white hover:bg-blue-600"
                  >
                    대시보드로
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="main-content">
      <TopBar title={quiz.title} subtitle="퀴즈를 진행해보세요" showCreateButton={false} showSearch={false} />
      
      <main className="p-6">
        <div className="max-w-2xl mx-auto">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-600">
                문제 {currentQuestionIndex + 1} / {quiz.questions.length}
              </span>
              <span className="text-sm text-slate-500">
                {correctAnswers}개 정답
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>문제 {currentQuestionIndex + 1}</span>
                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  무제한
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showResult ? (
                <div className="text-center py-8">
                  {answers[currentQuestion?.id]?.isCorrect ? (
                    <div>
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-green-600 mb-2">정답!</h3>
                      <p className="text-slate-600">
                        답: {answers[currentQuestion?.id]?.correctAnswer}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-red-600 mb-2">틀렸습니다</h3>
                      <p className="text-slate-600 mb-2">
                        정답: {answers[currentQuestion?.id]?.correctAnswer}
                      </p>
                      <p className="text-slate-500">
                        입력한 답: {answers[currentQuestion?.id]?.answer}
                      </p>
                    </div>
                  )}
                  
                  {currentQuestionIndex < quiz.questions.length - 1 ? (
                    <p className="text-sm text-slate-500 mt-4">
                      다음 문제로 이동 중...
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500 mt-4">
                      퀴즈를 완료하는 중...
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-6 text-center">
                    {currentQuestion?.card.front}
                  </h3>
                  
                  <div className="space-y-4">
                    <Input
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="답을 입력하세요..."
                      className="text-lg p-4"
                      autoFocus
                    />
                    
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={!userAnswer.trim() || answerQuestionMutation.isPending}
                      className="w-full bg-study-blue text-white hover:bg-blue-600 py-3"
                    >
                      {answerQuestionMutation.isPending ? "제출 중..." : "답 제출"}
                    </Button>
                  </div>
                  
                  <div className="text-center mt-6">
                    <p className="text-sm text-slate-500">
                      Enter 키를 눌러서 제출할 수 있습니다
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function QuizSelection() {
  const { data: collections, isLoading } = useQuery<any>({
    queryKey: ["/api/collections"],
  });

  return (
    <div className="main-content">
      <TopBar 
        title="퀴즈" 
        subtitle="컬렉션을 선택하여 퀴즈를 시작하세요"
        showCreateButton={false}
        showSearch={false}
      />
      <main className="p-8">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : collections?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection: any) => (
                <Card key={collection.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-study-blue" />
                      <span>{collection.name}</span>
                    </CardTitle>
                    <p className="text-sm text-slate-600">{collection.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>카드 수:</span>
                        <Badge variant="secondary">{collection.cardCount || 0}개</Badge>
                      </div>
                      <Link href={`/quiz/${collection.id}`}>
                        <Button className="w-full bg-study-blue text-white hover:bg-blue-600">
                          <Play className="w-4 h-4 mr-2" />
                          퀴즈 시작
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                컬렉션이 없습니다
              </h3>
              <p className="text-gray-500 mb-6">
                먼저 암기 카드를 만들고 컬렉션에 추가해보세요.
              </p>
              <Link href="/create">
                <Button className="bg-study-blue text-white hover:bg-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  첫 번째 카드 만들기
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
