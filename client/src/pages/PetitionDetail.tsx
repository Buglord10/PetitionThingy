import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  MessageSquare
} from "lucide-react";
import type { Petition } from "@shared/schema";

export default function PetitionDetail() {
  const [, params] = useRoute("/petition/:id");
  const petitionId = params?.id;

  const { data: petition, isLoading, error } = useQuery<Petition>({
    queryKey: [`/api/petitions/${petitionId}`],
    enabled: !!petitionId,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-primary border-b border-primary-border">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10 py-4 md:py-5">
            <Skeleton className="h-8 w-48" />
          </div>
        </header>
        <main className="max-w-[1200px] mx-auto px-5 md:px-10 py-8 md:py-12">
          <Card>
            <CardHeader className="space-y-4 pb-6">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-4/5" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (error || !petition) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-primary border-b border-primary-border">
          <div className="max-w-[1200px] mx-auto px-5 md:px-10 py-4 md:py-5">
            <Link href="/">
              <Button variant="outline" className="gap-2 bg-white" data-testid="button-back">
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Button>
            </Link>
          </div>
        </header>
        <main className="max-w-[1200px] mx-auto px-5 md:px-10 py-8 md:py-12">
          <Alert variant="destructive" data-testid="alert-error">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load petition details.</AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  const { attributes } = petition;
  const signatureCount = attributes.signature_count;
  const moderationThreshold = 10000;
  const debateThreshold = 100000;

  const getProgress = () => {
    if (signatureCount >= debateThreshold) return 100;
    if (signatureCount >= moderationThreshold) {
      return 50 + ((signatureCount - moderationThreshold) / (debateThreshold - moderationThreshold)) * 50;
    }
    return (signatureCount / moderationThreshold) * 50;
  };

  const getStatusBadge = () => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      open: { label: "Open", variant: "default" },
      closed: { label: "Closed", variant: "secondary" },
      rejected: { label: "Rejected", variant: "destructive" },
      awaiting_response: { label: "Awaiting response", variant: "outline" },
      awaiting_moderation: { label: "Awaiting moderation", variant: "secondary" },
    };
    return statusMap[attributes.state] || { label: attributes.state, variant: "outline" };
  };

  const statusBadge = getStatusBadge();

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-GB", { 
      day: "numeric", 
      month: "long", 
      year: "numeric" 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary border-b border-primary-border">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10 py-4 md:py-5">
          <Link href="/">
            <Button variant="outline" className="gap-2 bg-white" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-5 md:px-10 py-8 md:py-12">
        <Card>
          <CardHeader className="space-y-4 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusBadge.variant} data-testid="badge-status">
                {statusBadge.label}
              </Badge>
              {signatureCount >= moderationThreshold && (
                <Badge variant="secondary" className="gap-1" data-testid="badge-milestone">
                  <CheckCircle2 className="h-3 w-3" />
                  {signatureCount >= debateThreshold ? "100k+ signatures" : "10k+ signatures"}
                </Badge>
              )}
              {petition.government_response && (
                <Badge variant="secondary" className="gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Government responded
                </Badge>
              )}
              {petition.debate_outcome?.debated && (
                <Badge variant="secondary" className="gap-1">
                  <FileText className="h-3 w-3" />
                  Debated in Parliament
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-card-foreground leading-tight" data-testid="text-title">
              {attributes.action}
            </h1>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Signature Count */}
            <div className="flex items-baseline gap-3 pb-6 border-b border-card-border">
              <Users className="h-6 w-6 text-muted-foreground flex-shrink-0" />
              <div>
                <div className="text-5xl font-bold text-card-foreground" data-testid="text-signatures">
                  {signatureCount.toLocaleString()}
                </div>
                <div className="text-base text-muted-foreground mt-1">signatures</div>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-card-foreground">Progress to thresholds</h2>
              <div className="space-y-2">
                <Progress value={getProgress()} className="h-3" data-testid="progress-bar" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">10,000</span>
                    <span className="text-xs">Government response</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-medium">100,000</span>
                    <span className="text-xs">Parliamentary debate</span>
                  </div>
                </div>
              </div>
              {signatureCount >= debateThreshold && (
                <p className="text-sm text-secondary font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  This petition has reached the debate threshold
                </p>
              )}
              {signatureCount >= moderationThreshold && signatureCount < debateThreshold && (
                <p className="text-sm text-secondary font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  This petition has reached the response threshold
                </p>
              )}
            </div>

            {/* Petition Details */}
            {attributes.background && (
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-card-foreground">Background</h2>
                <p className="text-base text-card-foreground leading-relaxed whitespace-pre-wrap">
                  {attributes.background}
                </p>
              </div>
            )}

            {attributes.additional_details && (
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-card-foreground">Additional details</h2>
                <p className="text-base text-card-foreground leading-relaxed whitespace-pre-wrap">
                  {attributes.additional_details}
                </p>
              </div>
            )}

            {/* Government Response */}
            {petition.government_response && (
              <div className="pl-4 border-l-4 border-l-secondary" data-testid="card-government-response">
                <Card className="bg-card">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-5 w-5 text-secondary" />
                      <h2 className="text-xl font-bold text-card-foreground">Government response</h2>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      Responded on {formatDate(petition.government_response.responded_on)}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-base font-medium text-card-foreground">
                      {petition.government_response.summary}
                    </p>
                    <p className="text-base text-card-foreground leading-relaxed whitespace-pre-wrap">
                      {petition.government_response.details}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Debate Outcome */}
            {petition.debate_outcome?.debated && (
              <div className="pl-4 border-l-4 border-l-primary" data-testid="card-debate-outcome">
                <Card className="bg-card">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-bold text-card-foreground">Parliamentary debate</h2>
                    </div>
                    {petition.debate_outcome.debated_on && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        Debated on {formatDate(petition.debate_outcome.debated_on)}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {petition.debate_outcome.overview && (
                      <p className="text-base text-card-foreground leading-relaxed whitespace-pre-wrap">
                        {petition.debate_outcome.overview}
                      </p>
                    )}
                    {(petition.debate_outcome.transcript_url || petition.debate_outcome.video_url) && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {petition.debate_outcome.transcript_url && (
                          <Button variant="outline" asChild size="sm">
                            <a href={petition.debate_outcome.transcript_url} target="_blank" rel="noopener noreferrer">
                              View transcript
                            </a>
                          </Button>
                        )}
                        {petition.debate_outcome.video_url && (
                          <Button variant="outline" asChild size="sm">
                            <a href={petition.debate_outcome.video_url} target="_blank" rel="noopener noreferrer">
                              Watch video
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Rejection Details */}
            {attributes.state === "rejected" && attributes.rejection_details && (
              <div className="pl-4 border-l-4 border-l-destructive" data-testid="card-rejection">
                <Card className="bg-card">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <h2 className="text-xl font-bold text-card-foreground">Rejection details</h2>
                    </div>
                    {attributes.rejected_at && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        Rejected on {formatDate(attributes.rejected_at)}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-base text-card-foreground leading-relaxed whitespace-pre-wrap">
                      {attributes.rejection_details}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-card-border">
              {attributes.created_at && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-card-foreground">Created</div>
                    <div className="text-sm text-muted-foreground">{formatDate(attributes.created_at)}</div>
                  </div>
                </div>
              )}
              {attributes.opened_at && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-card-foreground">Opened</div>
                    <div className="text-sm text-muted-foreground">{formatDate(attributes.opened_at)}</div>
                  </div>
                </div>
              )}
              {attributes.closed_at && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-card-foreground">Closed</div>
                    <div className="text-sm text-muted-foreground">{formatDate(attributes.closed_at)}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
