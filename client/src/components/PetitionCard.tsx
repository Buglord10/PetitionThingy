import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CheckCircle2, Users } from "lucide-react";
import { Link } from "wouter";
import type { Petition } from "@shared/schema";

interface PetitionCardProps {
  petition: Petition;
}

export function PetitionCard({ petition }: PetitionCardProps) {
  const { id, attributes } = petition;
  const signatureCount = attributes.signature_count;
  
  // Calculate progress towards thresholds
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
  const hasMilestone = signatureCount >= moderationThreshold;

  return (
    <Card className="flex flex-col h-full hover-elevate" data-testid={`card-petition-${id}`}>
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-2">
          <Badge variant={statusBadge.variant} data-testid={`badge-status-${id}`}>
            {statusBadge.label}
          </Badge>
          {hasMilestone && (
            <Badge variant="secondary" className="gap-1" data-testid={`badge-milestone-${id}`}>
              <CheckCircle2 className="h-3 w-3" />
              {signatureCount >= debateThreshold ? "100k+" : "10k+"}
            </Badge>
          )}
        </div>
        
        <h3 className="text-lg font-bold text-card-foreground leading-tight line-clamp-3" data-testid={`text-title-${id}`}>
          {attributes.action}
        </h3>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pb-4">
        <div className="flex items-baseline gap-2">
          <Users className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <div className="flex-1">
            <div className="text-3xl font-bold text-card-foreground" data-testid={`text-signatures-${id}`}>
              {signatureCount.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">signatures</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress to thresholds</span>
            <span>
              {signatureCount >= debateThreshold ? "Debate threshold reached" : 
               signatureCount >= moderationThreshold ? "Response threshold reached" : 
               `${signatureCount.toLocaleString()} / ${moderationThreshold.toLocaleString()}`}
            </span>
          </div>
          <Progress value={getProgress()} className="h-2" data-testid={`progress-${id}`} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10k</span>
            <span>100k</span>
          </div>
        </div>

        {petition.government_response && (
          <Badge variant="secondary" className="gap-1.5 w-fit">
            <CheckCircle2 className="h-3 w-3" />
            Government responded
          </Badge>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Link href={`/petition/${id}`} className="w-full">
          <Button variant="outline" className="w-full gap-2 justify-between" data-testid={`button-view-${id}`}>
            <span>View details</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
