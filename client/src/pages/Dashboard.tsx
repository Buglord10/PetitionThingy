import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { FilterControls } from "@/components/FilterControls";
import { PetitionCard } from "@/components/PetitionCard";
import { PetitionCardSkeleton } from "@/components/PetitionCardSkeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import type { PetitionsResponse, PetitionStatus, PetitionSort, SignatureRange } from "@shared/schema";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<PetitionStatus>("all");
  const [sort, setSort] = useState<PetitionSort>("signature_count");
  const [signatureRange, setSignatureRange] = useState<SignatureRange>("all");

  // Memoize query URL to prevent unnecessary refetches
  const queryUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (status !== "all") params.append("status", status);
    params.append("sort", sort);
    if (signatureRange !== "all") params.append("signatureRange", signatureRange);
    if (searchQuery) params.append("search", searchQuery);
    return `/api/petitions?${params.toString()}`;
  }, [status, sort, signatureRange, searchQuery]);

  const { data, isLoading, error, refetch, dataUpdatedAt } = useQuery<PetitionsResponse>({
    queryKey: [queryUrl],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: true,
  });

  const lastRefreshed = dataUpdatedAt ? new Date(dataUpdatedAt) : undefined;

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        lastRefreshed={lastRefreshed}
      />

      <FilterControls
        status={status}
        onStatusChange={setStatus}
        sort={sort}
        onSortChange={setSort}
        signatureRange={signatureRange}
        onSignatureRangeChange={setSignatureRange}
        searchQuery={searchQuery}
        onClearSearch={handleClearSearch}
      />

      <main className="max-w-[1200px] mx-auto px-5 md:px-10 py-8 md:py-12">
        {error && (
          <Alert variant="destructive" className="mb-6" data-testid="alert-error">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading petitions</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-4">
              <span>Failed to load petitions. Please try again.</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                className="gap-2"
                data-testid="button-retry"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <PetitionCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && data && (
          <>
            {data.data.length === 0 && (
              <div className="text-center py-16" data-testid="text-no-results">
                <p className="text-lg text-muted-foreground">
                  {searchQuery 
                    ? `No petitions found matching "${searchQuery}"`
                    : "No petitions found"}
                </p>
              </div>
            )}

            {data.data.length > 0 && (
              <>
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground" data-testid="text-results-count">
                    Showing {data.data.length} petition{data.data.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {data.data.map((petition) => (
                    <PetitionCard key={petition.id} petition={petition} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
