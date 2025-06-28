"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function PaymentNotification() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [notification, setNotification] = useState<{
    type: "success" | "cancelled" | null;
    message: string;
  }>({ type: null, message: "" });

  useEffect(() => {
    const payment = searchParams.get("payment");
    
    if (payment === "success") {
      setNotification({
        type: "success",
        message: "Payment successful! Your subscription is now active."
      });
      
      // Clear the URL parameter after showing notification
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("payment");
        router.replace(url.pathname + url.search);
        setNotification({ type: null, message: "" });
      }, 5000);
    } else if (payment === "cancelled") {
      setNotification({
        type: "cancelled",
        message: "Payment was cancelled. You can try again anytime."
      });
      
      // Clear the URL parameter after showing notification
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("payment");
        router.replace(url.pathname + url.search);
        setNotification({ type: null, message: "" });
      }, 5000);
    }
  }, [searchParams, router]);

  if (!notification.type) {
    return null;
  }

  return (
    <Alert className={notification.type === "success" ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
      {notification.type === "success" ? (
        <CheckCircleIcon className="h-4 w-4 text-green-600" />
      ) : (
        <XCircleIcon className="h-4 w-4 text-yellow-600" />
      )}
      <AlertDescription className={notification.type === "success" ? "text-green-800" : "text-yellow-800"}>
        {notification.message}
      </AlertDescription>
    </Alert>
  );
}