import { Search, RefreshCw, GitCompare, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  lastRefreshed?: Date;
  isRefreshing?: boolean;
}

export function Header({ searchQuery, onSearchChange, lastRefreshed, isRefreshing }: HeaderProps) {
  const formatLastRefreshed = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <header className="bg-primary border-b border-primary-border sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        <div className="py-4 md:py-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-xl md:text-2xl font-bold text-primary-foreground leading-tight">
                UK Government Petitions
              </h1>
              <div className="flex items-center gap-2">
                <Link href="/tracked">
                  <Button variant="outline" size="sm" className="gap-2 bg-white" data-testid="button-tracked">
                    <Bell className="h-4 w-4" />
                    <span className="hidden sm:inline">Tracked</span>
                  </Button>
                </Link>
                <Link href="/compare">
                  <Button variant="outline" size="sm" className="gap-2 bg-white" data-testid="button-compare">
                    <GitCompare className="h-4 w-4" />
                    <span className="hidden sm:inline">Compare</span>
                  </Button>
                </Link>
                {isRefreshing && (
                  <Badge variant="secondary" className="gap-1.5">
                    <RefreshCw className="h-3 w-3 animate-spin" data-testid="icon-refreshing" />
                    <span className="hidden sm:inline">Updating</span>
                  </Badge>
                )}
                {lastRefreshed && !isRefreshing && (
                  <span className="text-xs text-primary-foreground/80 hidden sm:inline" data-testid="text-last-refreshed">
                    Updated {formatLastRefreshed(lastRefreshed)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search petitions..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 bg-white border-card-border text-foreground placeholder:text-muted-foreground h-11"
                data-testid="input-search"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
