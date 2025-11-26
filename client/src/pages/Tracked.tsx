import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Bell, Users, CheckCircle2, Info } from "lucide-react";
import type { TrackedPetition } from "@shared/schema";

export default function Tracked() {
  const { data: trackedPetitions, isLoading } = useQuery<TrackedPetition[]>({
    queryKey: ["/api/tracked"],
    refetchInterval: 60000, // Refresh every minute
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", { 
      day: "numeric", 
      month: "short", 
      year: "numeric" 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary border-b border-primary-border sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10 py-4 md:py-5">
          <div className="flex items-center justify-between gap-4">
            <Link href="/">
              <Button variant="outline" className="gap-2 bg-white" data-testid="button-back">
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Button>
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-primary-foreground">
              Tracked Petitions
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-5 md:px-10 py-8 md:py-12">
        <Alert className="mb-8">
          <Info className="h-4 w-4" />
          <AlertDescription>
            You're tracking {trackedPetitions?.length || 0} petition{trackedPetitions?.length !== 1 ? "s" : ""}. 
            You'll receive notifications when they reach 10,000 or 100,000 signatures.
          </AlertDescription>
        </Alert>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading tracked petitions...</p>
          </div>
        )}

        {!isLoading && trackedPetitions && trackedPetitions.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                No tracked petitions
              </h3>
              <p className="text-muted-foreground mb-4">
                Start tracking petitions to receive notifications when they reach debate thresholds
              </p>
              <Link href="/">
                <Button>Browse petitions</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {!isLoading && trackedPetitions && trackedPetitions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {trackedPetitions.map((tracked) => (
              <Card key={tracked.id} className="flex flex-col" data-testid={`card-tracked-${tracked.petitionId}`}>
                <CardHeader className="space-y-3 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Bell className="h-3 w-3" />
                      Tracking
                    </Badge>
                  </div>
                  
                  <h3 className="text-base font-bold text-card-foreground leading-tight line-clamp-3">
                    {tracked.petitionTitle}
                  </h3>
                </CardHeader>

                <CardContent className="flex-1 space-y-4 pb-4">
                  <div className="flex items-baseline gap-2">
                    <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-card-foreground">
                        {tracked.currentSignatures.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">signatures</div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-card-border">
                    <div className="text-sm text-muted-foreground">Notifications:</div>
                    {tracked.notifyAt10k && !tracked.notified10k && (
                      <div className="flex items-center gap-1.5 text-xs text-card-foreground">
                        <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                        <span>10k threshold</span>
                      </div>
                    )}
                    {tracked.notified10k && (
                      <div className="flex items-center gap-1.5 text-xs text-secondary">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>10k reached ✓</span>
                      </div>
                    )}
                    {tracked.notifyAt100k && !tracked.notified100k && (
                      <div className="flex items-center gap-1.5 text-xs text-card-foreground">
                        <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                        <span>100k threshold</span>
                      </div>
                    )}
                    {tracked.notified100k && (
                      <div className="flex items-center gap-1.5 text-xs text-secondary">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>100k reached ✓</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground pt-2 border-t border-card-border">
                    Tracking since {formatDate(tracked.createdAt)}
                  </div>

                  <Link href={`/petition/${tracked.petitionId}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View petition
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
