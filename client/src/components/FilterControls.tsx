import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { PetitionStatus, PetitionSort } from "@shared/schema";

interface FilterControlsProps {
  status: PetitionStatus;
  onStatusChange: (status: PetitionStatus) => void;
  sort: PetitionSort;
  onSortChange: (sort: PetitionSort) => void;
  searchQuery: string;
  onClearSearch: () => void;
}

export function FilterControls({
  status,
  onStatusChange,
  sort,
  onSortChange,
  searchQuery,
  onClearSearch,
}: FilterControlsProps) {
  return (
    <div className="bg-card border-b border-card-border">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10 py-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-foreground">Filter:</span>
            <Select value={status} onValueChange={(value) => onStatusChange(value as PetitionStatus)}>
              <SelectTrigger className="w-[180px] bg-background" data-testid="select-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All petitions</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="awaiting_response">Awaiting response</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-sm font-medium text-foreground ml-2">Sort by:</span>
            <Select value={sort} onValueChange={(value) => onSortChange(value as PetitionSort)}>
              <SelectTrigger className="w-[180px] bg-background" data-testid="select-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="signature_count">Most signatures</SelectItem>
                <SelectItem value="created_at">Recently created</SelectItem>
                <SelectItem value="closing_soon">Closing soon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {searchQuery && (
            <Badge 
              variant="secondary" 
              className="gap-1.5 self-start cursor-pointer hover-elevate" 
              onClick={onClearSearch}
              data-testid="badge-clear-search"
            >
              <span className="text-sm">Search: {searchQuery}</span>
              <X className="h-3 w-3" />
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
