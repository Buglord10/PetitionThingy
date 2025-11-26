import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Share2, Mail } from "lucide-react";
import { SiX, SiFacebook } from "react-icons/si";

interface ShareButtonsProps {
  petitionTitle: string;
  petitionId: number;
  signatureCount: number;
}

export function ShareButtons({ petitionTitle, petitionId, signatureCount }: ShareButtonsProps) {
  const petitionUrl = `${window.location.origin}/petition/${petitionId}`;
  const shareText = `Sign this petition: "${petitionTitle}" - ${signatureCount.toLocaleString()} signatures so far!`;

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(petitionUrl)}`;
    window.open(twitterUrl, "_blank", "width=550,height=420");
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(petitionUrl)}`;
    window.open(facebookUrl, "_blank", "width=550,height=420");
  };

  const shareViaEmail = () => {
    const emailSubject = encodeURIComponent(`Petition: ${petitionTitle}`);
    const emailBody = encodeURIComponent(
      `I thought you might be interested in this UK Government petition:\n\n${petitionTitle}\n\nIt currently has ${signatureCount.toLocaleString()} signatures.\n\nView and sign here: ${petitionUrl}`
    );
    window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;
  };

  return (
    <Card data-testid="card-share">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-card-foreground">Share this petition</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Help raise awareness by sharing on social media
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={shareOnTwitter}
            data-testid="button-share-twitter"
          >
            <SiX className="h-4 w-4" />
            Share on X
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={shareOnFacebook}
            data-testid="button-share-facebook"
          >
            <SiFacebook className="h-4 w-4" />
            Share on Facebook
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={shareViaEmail}
            data-testid="button-share-email"
          >
            <Mail className="h-4 w-4" />
            Share via Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
