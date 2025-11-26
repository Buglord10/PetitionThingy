import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

interface SignatureGraphProps {
  signatureCount: number;
  createdAt: string;
  responseThresholdReachedAt?: string | null;
  debateThresholdReachedAt?: string | null;
}

export function SignatureGraph({ 
  signatureCount, 
  createdAt,
  responseThresholdReachedAt,
  debateThresholdReachedAt 
}: SignatureGraphProps) {
  // Generate estimated growth data based on current signatures and milestones
  // This is an estimation since the API doesn't provide historical data
  const generateEstimatedData = () => {
    const data = [];
    const created = new Date(createdAt);
    const now = new Date();
    const daysSinceCreation = Math.max(1, Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Start point
    data.push({
      date: created.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      signatures: 0,
    });

    // Add milestone points if they exist
    if (responseThresholdReachedAt) {
      const responseDate = new Date(responseThresholdReachedAt);
      data.push({
        date: responseDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        signatures: 10000,
      });
    }

    if (debateThresholdReachedAt) {
      const debateDate = new Date(debateThresholdReachedAt);
      data.push({
        date: debateDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        signatures: 100000,
      });
    }

    // Add intermediate points for smoother curve
    const numPoints = Math.min(8, daysSinceCreation);
    for (let i = 1; i < numPoints; i++) {
      const ratio = i / numPoints;
      const pointDate = new Date(created.getTime() + (now.getTime() - created.getTime()) * ratio);
      
      // Estimate signatures with logarithmic growth pattern
      let estimatedSigs;
      if (signatureCount < 10000) {
        estimatedSigs = Math.floor(signatureCount * ratio);
      } else if (signatureCount < 100000) {
        estimatedSigs = Math.floor(10000 + (signatureCount - 10000) * ratio);
      } else {
        estimatedSigs = Math.floor(100000 + (signatureCount - 100000) * ratio);
      }

      data.push({
        date: pointDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        signatures: estimatedSigs,
      });
    }

    // Current point
    data.push({
      date: now.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      signatures: signatureCount,
    });

    return data;
  };

  const data = generateEstimatedData();

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  return (
    <Card data-testid="card-signature-graph">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-card-foreground">Signature growth</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Estimated growth based on current signatures and milestone dates
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={formatYAxis}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--card-foreground))",
                }}
                formatter={(value: number) => [value.toLocaleString(), "Signatures"]}
                labelStyle={{ color: "hsl(var(--muted-foreground))" }}
              />
              <Line 
                type="monotone" 
                dataKey="signatures" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
