import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TopBar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, FileText, Folder, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function Search() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
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

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchResults, isLoading: searchLoading } = useQuery<any>({
    queryKey: ["/api/search", { q: debouncedQuery }],
    enabled: debouncedQuery.length > 0 && !!user,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="main-content">
        <TopBar title="검색" subtitle="로딩 중..." showCreateButton={false} showSearch={false} />
        <main className="p-6 w-full">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
        title="검색" 
        subtitle="암기 카드와 컬렉션을 검색해보세요"
        showCreateButton={false}
        showSearch={false}
      />
      
      <main className="p-6 w-full">
        <div className="max-w-4xl mx-auto">
          {/* Search Input */}
          <div className="relative mb-8">
            <SearchIcon className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="컬렉션명, 카드 내용, 카테고리로 검색..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 text-lg py-3"
              autoFocus
            />
          </div>

          {/* Search Results */}
          {query === "" ? (
            <div className="text-center py-16">
              <SearchIcon className="w-24 h-24 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                검색어를 입력해주세요
              </h3>
              <p className="text-slate-500">
                컬렉션명, 카드 내용, 카테고리로 검색할 수 있습니다.
              </p>
            </div>
          ) : searchLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchResults && (searchResults.collections.length > 0 || searchResults.cards.length > 0) ? (
            <div className="space-y-8">
              {/* Collections Results */}
              {searchResults.collections.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <Folder className="w-5 h-5 mr-2" />
                    컬렉션 ({searchResults.collections.length}개)
                  </h2>
                  <div className="space-y-3">
                    {searchResults.collections.map((collection: any) => (
                      <Card 
                        key={collection.id}
                        className="hover:shadow-md transition-shadow cursor-pointer group"
                        onClick={() => setLocation(`/collections/${collection.id}`)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-study-blue transition-colors">
                                {collection.title}
                              </h3>
                              <p className="text-slate-600 text-sm mb-3">
                                {collection.description || "설명이 없습니다."}
                              </p>
                              <div className="flex items-center space-x-3">
                                <Badge className={getCategoryColor(collection.category)}>
                                  {collection.category}
                                </Badge>
                                <span className="text-xs text-slate-500">
                                  {new Date(collection.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Cards Results */}
              {searchResults.cards.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    카드 ({searchResults.cards.length}개)
                  </h2>
                  <div className="space-y-3">
                    {searchResults.cards.map((card: any) => (
                      <Card 
                        key={card.id}
                        className="hover:shadow-md transition-shadow cursor-pointer group"
                        onClick={() => setLocation(`/collections/${card.collection.id}`)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <div>
                                  <p className="text-xs font-medium text-slate-500 mb-1">질문</p>
                                  <p className="font-medium text-slate-800">{card.front}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-slate-500 mb-1">답</p>
                                  <p className="text-slate-700">{card.back}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="text-sm text-slate-600">
                                  컬렉션: {card.collection.title}
                                </span>
                                <Badge className={getCategoryColor(card.collection.category)}>
                                  {card.collection.category}
                                </Badge>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <SearchIcon className="w-24 h-24 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                검색 결과가 없습니다
              </h3>
              <p className="text-slate-500">
                "{debouncedQuery}"에 대한 검색 결과를 찾을 수 없습니다.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
