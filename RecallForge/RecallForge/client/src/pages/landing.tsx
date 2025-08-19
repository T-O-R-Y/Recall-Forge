import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, BookOpen, Target, TrendingUp } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-study-blue to-study-purple rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800">StudyMemo</h1>
          </div>
          
          <h2 className="text-5xl font-bold text-slate-800 mb-6 leading-tight">
            스마트한 암기학습으로<br />
            <span className="bg-gradient-to-r from-study-blue to-study-purple bg-clip-text text-transparent">
              학습 효과를 극대화하세요
            </span>
          </h2>
          
          <p className="text-xl text-slate-600 mb-12 leading-relaxed">
            AI가 생성하는 맞춤형 퀴즈와 체계적인 진도 관리로<br />
            더 효율적이고 재미있게 암기학습을 해보세요
          </p>
          
          <Button 
            onClick={() => window.location.href = '/auth'}
            size="lg"
            className="bg-study-blue hover:bg-blue-600 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            지금 시작하기
          </Button>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-24 max-w-6xl mx-auto">
          <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-study-blue" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">스마트 카드 관리</h3>
              <p className="text-slate-600 text-sm">
                주제별로 암기 카드를 체계적으로 정리하고 관리할 수 있습니다
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-study-green" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">맞춤형 퀴즈</h3>
              <p className="text-slate-600 text-sm">
                저장된 카드를 바탕으로 다양한 형태의 퀴즈를 자동으로 생성합니다
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-study-purple" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">학습 진도 추적</h3>
              <p className="text-slate-600 text-sm">
                학습 현황과 성취도를 실시간으로 확인하고 동기를 유지하세요
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">효과적인 복습</h3>
              <p className="text-slate-600 text-sm">
                과학적인 복습 주기로 장기 기억에 효과적으로 저장시킵니다
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-24">
          <Card className="max-w-2xl mx-auto border-0 shadow-xl bg-gradient-to-r from-study-blue to-study-purple text-white">
            <CardContent className="p-12">
              <h3 className="text-3xl font-bold mb-4">지금 바로 시작해보세요!</h3>
              <p className="text-blue-100 mb-8 text-lg">
                무료로 가입하고 스마트한 학습의 경험을 느껴보세요
              </p>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                variant="secondary"
                size="lg"
                className="bg-white text-study-blue hover:bg-gray-100 px-8 py-4 text-lg rounded-xl font-semibold"
              >
                무료로 시작하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
