import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Info } from "lucide-react";

export type Message = { success: string } | { error: string } | { message: string };

export function FormMessage({ message }: { message: Message }) {
  if ("success" in message) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">{message.success}</AlertDescription>
      </Alert>
    );
  }

  if ("error" in message) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>{message.error}</AlertDescription>
      </Alert>
    );
  }

  if ("message" in message) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>{message.message}</AlertDescription>
      </Alert>
    );
  }

  return null;
}
