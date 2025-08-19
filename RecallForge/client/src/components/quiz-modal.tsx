import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuizModal({ isOpen, onClose }: QuizModalProps) {
  const [collectionId, setCollectionId] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [quizType, setQuizType] = useState("multiple");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: collections, isLoading: collectionsLoading } = useQuery({
    queryKey: ["/api/collections"],
    enabled: isOpen,
  });

  const createQuizMutation = useMutation({
    mutationFn: async (quizData: { collectionId: string; questionCount: number; quizType: string }) => {
      const response = await apiRequest("POST", "/api/quizzes", quizData);
      return response.json();
    },
    onSuccess: (quiz) => {
      toast({
        title: "퀴즈 생성 완료",
        description: "퀴즈가 생성되었습니다. 퀴즈를 시작해보세요!",
      });
      onClose();
      setLocation(`/quiz/${quiz.id}`);
    },
    onError: (error) => {
      console.error("Error creating quiz:", error);
      toast({
        title: "퀴즈 생성 실패",
        description: "퀴즈를 생성하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionId) {
      toast({
        title: "컬렉션을 선택해주세요",
        variant: "destructive",
      });
      return;
    }
    createQuizMutation.mutate({ collectionId, questionCount, quizType });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>퀴즈 생성</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              컬렉션 선택
            </Label>
            <Select value={collectionId} onValueChange={setCollectionId} disabled={collectionsLoading}>
              <SelectTrigger>
                <SelectValue placeholder={collectionsLoading ? "로딩 중..." : "컬렉션을 선택하세요"} />
              </SelectTrigger>
              <SelectContent>
                {collections?.map((collection: any) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              문제 수
            </Label>
            <Input
              type="number"
              min="1"
              max="50"
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value) || 10)}
            />
          </div>
          
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              문제 유형
            </Label>
            <RadioGroup value={quizType} onValueChange={setQuizType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multiple" id="multiple" />
                <Label htmlFor="multiple">객관식</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fill" id="fill" />
                <Label htmlFor="fill">빈칸 채우기</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mixed" id="mixed" />
                <Label htmlFor="mixed">혼합</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
            >
              취소
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-study-blue text-white hover:bg-blue-600"
              disabled={createQuizMutation.isPending}
            >
              {createQuizMutation.isPending ? "생성 중..." : "퀴즈 시작"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
