import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trash2, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const cardFormSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  description: z.string().optional(),
  category: z.string().min(1, "카테고리를 선택해주세요"),
  cards: z.array(z.object({
    front: z.string().min(1, "질문을 입력해주세요"),
    back: z.string().min(1, "답을 입력해주세요"),
  })).min(1, "최소 하나의 카드가 필요합니다"),
});

type CardFormData = z.infer<typeof cardFormSchema>;

interface CardFormProps {
  initialData?: Partial<CardFormData>;
  collectionId?: string;
  onCancel?: () => void;
}

export function CardForm({ initialData, collectionId, onCancel }: CardFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CardFormData>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      cards: initialData?.cards || [{ front: "", back: "" }],
    },
  });

  const createCollectionMutation = useMutation({
    mutationFn: async (data: CardFormData) => {
      const response = await apiRequest("POST", "/api/collections", {
        title: data.title,
        description: data.description,
        category: data.category,
      });
      return response.json();
    },
  });

  const createCardsMutation = useMutation({
    mutationFn: async ({ collectionId, cards }: { collectionId: string; cards: { front: string; back: string }[] }) => {
      const promises = cards.map(card => 
        apiRequest("POST", `/api/collections/${collectionId}/cards`, card)
      );
      return Promise.all(promises);
    },
  });

  const handleSubmit = async (data: CardFormData) => {
    try {
      let targetCollectionId = collectionId;

      if (!targetCollectionId) {
        const collection = await createCollectionMutation.mutateAsync(data);
        targetCollectionId = collection.id;
      }

      if (!targetCollectionId) {
        throw new Error("Collection ID is required");
      }
      
      await createCardsMutation.mutateAsync({
        collectionId: targetCollectionId,
        cards: data.cards,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });

      toast({
        title: "성공",
        description: "카드가 성공적으로 저장되었습니다.",
      });

      setLocation("/collections");
    } catch (error) {
      console.error("Error saving cards:", error);
      toast({
        title: "오류",
        description: "카드를 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const addCard = () => {
    const currentCards = form.getValues("cards");
    form.setValue("cards", [...currentCards, { front: "", back: "" }]);
  };

  const removeCard = (index: number) => {
    const currentCards = form.getValues("cards");
    if (currentCards.length > 1) {
      form.setValue("cards", currentCards.filter((_, i) => i !== index));
    }
  };

  const isPending = createCollectionMutation.isPending || createCardsMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>새 암기 카드 만들기</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제목</FormLabel>
                    <FormControl>
                      <Input placeholder="암기 카드 제목을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>카테고리</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="language">언어</SelectItem>
                        <SelectItem value="english">영어</SelectItem>
                        <SelectItem value="science">과학</SelectItem>
                        <SelectItem value="math">수학</SelectItem>
                        <SelectItem value="history">역사</SelectItem>
                        <SelectItem value="geography">지리</SelectItem>
                        <SelectItem value="literature">문학</SelectItem>
                        <SelectItem value="art">예술</SelectItem>
                        <SelectItem value="music">음악</SelectItem>
                        <SelectItem value="philosophy">철학</SelectItem>
                        <SelectItem value="psychology">심리학</SelectItem>
                        <SelectItem value="economics">경제학</SelectItem>
                        <SelectItem value="law">법학</SelectItem>
                        <SelectItem value="medicine">의학</SelectItem>
                        <SelectItem value="geology">지질학</SelectItem>
                        <SelectItem value="biology">생물학</SelectItem>
                        <SelectItem value="chemistry">화학</SelectItem>
                        <SelectItem value="physics">물리학</SelectItem>
                        <SelectItem value="computer">컴퓨터</SelectItem>
                        <SelectItem value="programming">프로그래밍</SelectItem>
                        <SelectItem value="business">비즈니스</SelectItem>
                        <SelectItem value="cooking">요리</SelectItem>
                        <SelectItem value="sports">스포츠</SelectItem>
                        <SelectItem value="hobby">취미</SelectItem>
                        <SelectItem value="travel">여행</SelectItem>
                        <SelectItem value="culture">문화</SelectItem>
                        <SelectItem value="other">기타</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={3} 
                      placeholder="이 암기 카드에 대한 간단한 설명을 입력하세요" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Card Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <FormLabel>암기 항목</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCard}
                  className="text-study-blue hover:text-blue-600"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  항목 추가
                </Button>
              </div>

              <div className="space-y-4">
                {form.watch("cards").map((_, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-slate-200 rounded-lg">
                    <FormField
                      control={form.control}
                      name={`cards.${index}.front`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-slate-600">
                            질문/앞면
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="예: sophisticated" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-2">
                      <FormField
                        control={form.control}
                        name={`cards.${index}.back`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="text-xs font-medium text-slate-600">
                              답/뒷면
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="예: 정교한, 세련된" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch("cards").length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-6 text-red-500 hover:text-red-700"
                          onClick={() => removeCard(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel || (() => setLocation("/"))}
              >
                취소
              </Button>
              <Button 
                type="submit" 
                className="bg-study-blue text-white hover:bg-blue-600"
                disabled={isPending}
              >
                {isPending ? "저장 중..." : "카드 저장"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}