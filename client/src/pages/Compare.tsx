import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Plus, X, Users, TrendingUp, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import type { Petition, PetitionsResponse } from "@shared/schema";

export default function Compare() {
  const [, setLocation] = useLocation();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all petitions for search
  const { data: allPetitions } = useQuery<PetitionsResponse>({
    queryKey: ["/api/petitions?sort=signature_count"],
  });

  // Fetch selected petitions
  const selectedPetitions = useQuery<Petition[]>({
    queryKey: ["compare-petitions", selectedIds],
    queryFn: async () => {
      if (selectedIds.length === 0) return [];
      const promises = selectedIds.map(id =>
        fetch(`/api/petitions/${id}`).then(res => res.json())
      );
      return Promise.all(promises);
    },
    enabled: selectedIds.length > 0,
  });

  const filteredPetitions = allPetitions?.data.filter(p =>
    p.attributes.action.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedIds.includes(p.id)
  ).slice(0, 10) || [];

  const addPetition = (id: number) => {
    if (selectedIds.length < 4 && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
      setSearchTerm("");
    }
  };

  const removePetition = (id: number) => {
    setSelectedIds(selectedIds.filter(i => i !== id));
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-GB", { 
      day: "numeric", 
      month: "short", 
      year: "numeric" 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary border-b border-primary-border sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-4 md:py-5">
          <div className="flex items-center justify-between gap-4">
            <Link href="/">
              <Button variant="outline" className="gap-2 bg-white" data-testid="button-back">
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Button>
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-primary-foreground">
              Compare Petitions
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-5 md:px-10 py-8 md:py-12">
        {/* Search and Add Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Plus className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-card-foreground">
                Add petitions to compare
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Select up to 4 petitions to compare side-by-side ({selectedIds.length}/4 selected)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="search"
              placeholder="Search petitions by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              data-testid="input-search-petition"
            />

            {searchTerm && filteredPetitions.length > 0 && (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredPetitions.map((petition) => (
                  <button
                    key={petition.id}
                    onClick={() => addPetition(petition.id)}
                    disabled={selectedIds.length >= 4}
                    className="w-full text-left p-3 rounded-md border border-card-border hover-elevate active-elevate-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid={`button-add-${petition.id}`}
                  >
                    <div className="font-medium text-card-foreground line-clamp-2">
                      {petition.attributes.action}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {petition.attributes.signature_count.toLocaleString()} signatures
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comparison Grid */}
        {selectedIds.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Search and select petitions above to start comparing
            </AlertDescription>
          </Alert>
        )}

        {selectedIds.length > 0 && selectedPetitions.data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {selectedPetitions.data.map((petition) => (
              <Card key={petition.id} className="flex flex-col" data-testid={`card-compare-${petition.id}`}>
                <CardHeader className="space-y-3 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant={petition.attributes.state === "open" ? "default" : "secondary"}>
                      {petition.attributes.state}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={() => removePetition(petition.id)}
                      data-testid={`button-remove-${petition.id}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <h3 className="text-base font-bold text-card-foreground leading-tight line-clamp-3">
                    {petition.attributes.action}
                  </h3>
                </CardHeader>

                <CardContent className="flex-1 space-y-4 pb-4">
                  {/* Signatures */}
                  <div className="flex items-baseline gap-2">
                    <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-card-foreground">
                        {petition.attributes.signature_count.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">signatures</div>
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="space-y-2">
                    {petition.attributes.signature_count >= 10000 && (
                      <div className="flex items-center gap-1.5 text-xs text-secondary">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>10k threshold</span>
                      </div>
                    )}
                    {petition.attributes.signature_count >= 100000 && (
                      <div className="flex items-center gap-1.5 text-xs text-secondary">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>100k threshold</span>
                      </div>
                    )}
                  </div>

                  {/* Government Response */}
                  {petition.government_response && (
                    <div className="pt-2 border-t border-card-border">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>Government responded</span>
                      </div>
                      <p className="text-xs text-card-foreground line-clamp-3">
                        {petition.government_response.summary}
                      </p>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="pt-2 border-t border-card-border space-y-1">
                    {petition.attributes.created_at && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Created {formatDate(petition.attributes.created_at)}</span>
                      </div>
                    )}
                  </div>

                  {/* View Details Link */}
                  <Link href={`/petition/${petition.id}`}>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      View full details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
