import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TrackButtonProps {
  petitionId: number;
  petitionTitle: string;
  currentSignatures: number;
}

export function TrackButton({ petitionId, petitionTitle, currentSignatures }: TrackButtonProps) {
  const { toast } = useToast();

  // Check if petition is being tracked
  const { data: trackingStatus } = useQuery<{ isTracking: boolean }>({
    queryKey: [`/api/track/${petitionId}/status`],
  });

  const isTracking = trackingStatus?.isTracking ?? false;

  // Track petition mutation
  const trackMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/track", {
        petitionId,
        petitionTitle,
        currentSignatures,
        notifyAt10k: true,
        notifyAt100k: true,
        notified10k: currentSignatures >= 10000,
        notified100k: currentSignatures >= 100000,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/track/${petitionId}/status`] });
      queryClient.invalidateQueries({ queryKey: ["/api/tracked"] });
      toast({
        title: "Petition tracked",
        description: "You'll be notified when this petition reaches signature milestones",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to track petition",
        variant: "destructive",
      });
    },
  });

  // Untrack petition mutation
  const untrackMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/track/${petitionId}`, undefined);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/track/${petitionId}/status`] });
      queryClient.invalidateQueries({ queryKey: ["/api/tracked"] });
      toast({
        title: "Petition untracked",
        description: "You'll no longer receive notifications for this petition",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to untrack petition",
        variant: "destructive",
      });
    },
  });

  const handleClick = () => {
    if (isTracking) {
      untrackMutation.mutate();
    } else {
      trackMutation.mutate();
    }
  };

  return (
    <Button
      variant={isTracking ? "secondary" : "default"}
      className="gap-2"
      onClick={handleClick}
      disabled={trackMutation.isPending || untrackMutation.isPending}
      data-testid="button-track"
    >
      {isTracking ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
      {isTracking ? "Stop tracking" : "Track petition"}
    </Button>
  );
}
