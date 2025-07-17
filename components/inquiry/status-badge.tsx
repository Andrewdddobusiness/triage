import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  inquiryDate?: string | null;
}

export function StatusBadge({ status, inquiryDate }: StatusBadgeProps) {
  // Check if inquiry is older than 7 days (only applies to "new" status)
  const isStale = inquiryDate && status === "new" ? (() => {
    const inquiryDateTime = new Date(inquiryDate);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - inquiryDateTime.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 7;
  })() : false;

  // Don't show badge for "new" status if inquiry is stale (older than 7 days)
  if (status === "new" && isStale) {
    return null;
  }

  const formattedLabel = status.charAt(0).toUpperCase() + status.slice(1);

  // Use semantic theme colors for proper light/dark mode support
  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-accent text-accent-foreground hover:bg-accent/80";
      case "contacted":
        return "bg-muted text-muted-foreground hover:bg-muted/80";
      case "scheduled":
        return "bg-primary text-primary-foreground hover:bg-primary/80";
      case "completed":
        return "bg-secondary text-secondary-foreground hover:bg-secondary/80";
      case "cancelled":
        return "bg-destructive text-destructive-foreground hover:bg-destructive/80";
      default:
        return "bg-muted text-muted-foreground hover:bg-muted/80";
    }
  };

  return (
    <Badge className={getStatusColor(status)}>
      {formattedLabel}
    </Badge>
  );
}