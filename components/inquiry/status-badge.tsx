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

  // Use consistent color scheme for both variants with hover effects
  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900";
      case "contacted":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:text-yellow-900";
      case "scheduled":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200 hover:text-purple-900";
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900";
    }
  };

  return (
    <Badge className={getStatusColor(status)}>
      {formattedLabel}
    </Badge>
  );
}