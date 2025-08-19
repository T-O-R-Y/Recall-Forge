import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { TopBar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Play, 
  Plus,
  ChevronRight,
  Folder,
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";

export default function Collections() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();

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

  const { data: collections, isLoading: collectionsLoading, error } = useQuery<any>({
    queryKey: ["/api/collections"],
    retry: false,
  });

  const deleteCollectionMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/collections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "컬렉션 삭제 완료",
        description: "컬렉션이 성공적으로 삭제되었습니다.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      console.error("Error deleting collection:", error);
      toast({
        title: "삭제 실패",
        description: "컬렉션을 삭제하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || collectionsLoading) {
    return (
      <div className="main-content">
        <TopBar title="컬렉션" subtitle="로딩 중..." showCreateButton={false} />
        <main className="p-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
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

  const filteredCollections = collections?.filter((collection: any) =>
    collection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDeleteCollection = (id: string) => {
    if (window.confirm("정말로 이 컬렉션을 삭제하시겠습니까?")) {
      deleteCollectionMutation.mutate(id);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "영어": "bg-blue-100 text-blue-800",
      "한국사": "bg-green-100 text-green-800",
      "화학": "bg-purple-100 text-purple-800",
      "수학": "bg-orange-100 text-orange-800",
      "기타": "bg-gray-100 text-gray-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="main-content">
      <TopBar 
        title="컬렉션" 
        subtitle="나의 암기 카드 컬렉션을 관리해보세요"
        onSearch={setSearchQuery}
        onCreateNew={() => setLocation("/create")}
      />
      
      <main className="p-6 w-full">
        {filteredCollections.length === 0 ? (
          <div className="text-center py-16">
            <Folder className="w-24 h-24 text-slate-300 mx-auto mb-4" />
            {collections?.length === 0 ? (
              <>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">
                  아직 컬렉션이 없습니다
                </h3>
                <p className="text-slate-500 mb-6">
                  첫 번째 암기 카드 컬렉션을 만들어보세요!
                </p>
                <Button 
                  onClick={() => setLocation("/create")}
                  className="bg-study-blue text-white hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  첫 번째 컬렉션 만들기
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-slate-500">
                  다른 검색어로 다시 시도해보세요.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((collection: any) => (
              <Card 
                key={collection.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 
                        className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-study-blue transition-colors"
                        onClick={() => setLocation(`/collections/${collection.id}`)}
                      >
                        {collection.title}
                      </h3>
                      <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                        {collection.description || "설명이 없습니다."}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setLocation(`/collections/${collection.id}/edit`)}>
                          <Edit className="w-4 h-4 mr-2" />
                          편집
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteCollection(collection.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className={getCategoryColor(collection.category)}>
                        {collection.category}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(collection.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLocation(`/quiz/create?collection=${collection.id}`)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        퀴즈
                      </Button>
                      <ChevronRight 
                        className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => setLocation(`/collections/${collection.id}`)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
