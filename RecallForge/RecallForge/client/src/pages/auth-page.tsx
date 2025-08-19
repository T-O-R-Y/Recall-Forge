import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, loginUserSchema } from "@shared/schema";
import { z } from "zod";
import { Loader2, BookOpen, Users, Target, TrendingUp } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const loginForm = useForm({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerSchema = z.object({
    username: z.string().min(1, "아이디를 입력해주세요"),
    email: z.string().email("올바른 이메일을 입력해주세요").optional().or(z.literal("")),
    password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
    confirmPassword: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const onLogin = (data: any) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: any) => {
    const { confirmPassword, ...registerData } = data;
    // Convert empty email to null for API compatibility
    if (registerData.email === "") {
      registerData.email = null;
    }
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Forms */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">StudyMemo</h1>
            <p className="text-muted-foreground mt-2">효율적인 학습을 위한 디지털 암기카드</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">로그인</TabsTrigger>
              <TabsTrigger value="register">회원가입</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>로그인</CardTitle>
                  <CardDescription>계정에 로그인하여 학습을 시작하세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>아이디</FormLabel>
                            <FormControl>
                              <Input placeholder="아이디를 입력하세요" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>비밀번호</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="비밀번호를 입력하세요" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        로그인
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>회원가입</CardTitle>
                  <CardDescription>새 계정을 만들어 학습을 시작하세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>아이디</FormLabel>
                            <FormControl>
                              <Input placeholder="아이디를 입력하세요" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>이메일 (선택사항)</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="이메일을 입력하세요" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>이름 (선택사항)</FormLabel>
                              <FormControl>
                                <Input placeholder="이름" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>성 (선택사항)</FormLabel>
                              <FormControl>
                                <Input placeholder="성" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>비밀번호</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="비밀번호를 입력하세요" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>비밀번호 확인</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="비밀번호를 다시 입력하세요" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        회원가입
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="hidden lg:flex bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 items-center justify-center p-8">
        <div className="max-w-md text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            효과적인 학습의 시작
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            디지털 플래시카드로 기억력을 향상시키고 학습 목표를 달성하세요
          </p>
          <div className="grid grid-cols-1 gap-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">컬렉션으로 체계적 관리</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">맞춤형 퀴즈 생성</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">학습 진도 추적</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}