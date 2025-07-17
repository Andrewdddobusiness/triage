import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { fetchInvoices } from "@/app/actions/stripe/invoice";
import { BreadcrumbHeader } from "@/components/dashboard/breadcrumb-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon, AlertCircleIcon, DownloadIcon, SearchIcon, FilterIcon } from "lucide-react";
import { PaymentNotification } from "../../../components/billing/payment-notification";
import { SubscriptionSection } from "../../../components/billing/subscription-section";

interface SubscriptionData {
  hasActiveSubscription: boolean;
  hasSubscriptionHistory: boolean;
  subscription?: {
    status: string;
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    canceled_at?: string;
    trial_end?: string;
    billing_cycle: string;
    plan_name?: string;
  };
}

export default async function BillingPage() {
  const supabase = await createClient();

  // Redirect if not logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch subscription status from your existing Edge Function
  let subscriptionData: SubscriptionData = {
    hasActiveSubscription: false,
    hasSubscriptionHistory: false,
  };

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/stripe-check-subscription`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: user.id }),
    });

    if (response.ok) {
      subscriptionData = await response.json();
    } else {
      console.error("Subscription check failed:", await response.text());
    }
  } catch (error) {
    console.error("Error fetching subscription data:", error);
  }

  // Fetch real invoice data
  const invoiceData = await fetchInvoices({ limit: 20 });

  const formatInvoiceDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Paid</Badge>;
      case "open":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Open</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "uncollectible":
        return <Badge variant="destructive">Uncollectible</Badge>;
      case "void":
        return <Badge variant="outline">Void</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      <BreadcrumbHeader currentPage="Billing" />
      <div className="space-y-6 px-4">
        <PaymentNotification />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Plans & billing</h1>
          <p className="text-muted-foreground">Manage your plan and billing history here.</p>
        </div>

        {/* Subscription Status Card */}
        <SubscriptionSection subscriptionData={subscriptionData} userId={user.id} />

        {/* Previous Invoices Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Previous invoices</h2>
          </div>

          {/* Invoice List */}
          <div className="space-y-3">
            {invoiceData.error ? (
              <Card className="p-8">
                <div className="text-center">
                  <AlertCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Failed to load invoices</h3>
                  <p className="text-muted-foreground">{invoiceData.error}</p>
                </div>
              </Card>
            ) : invoiceData.invoices.length === 0 ? (
              <Card className="p-8">
                <div className="text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
                  <p className="text-muted-foreground">
                    Your invoices will appear here once you have an active subscription
                  </p>
                </div>
              </Card>
            ) : (
              invoiceData.invoices.map((invoice) => (
                <Card key={invoice.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded flex items-center justify-center">
                        <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                          {invoice.number ? invoice.number.slice(-3) : invoice.id.slice(-3)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{invoice.number || `Invoice ${invoice.id.slice(-8)}`}</div>
                          {getInvoiceStatusBadge(invoice.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">{formatInvoiceDate(invoice.created)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {invoice.lines.length > 0 && invoice.lines[0].description
                            ? invoice.lines[0].description
                            : "Pro plan"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(invoice.amount_paid, invoice.currency)}</div>
                      </div>
                      {invoice.invoice_pdf && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer">
                            <DownloadIcon className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {invoiceData.has_more && (
            <div className="text-center pt-4">
              <Button variant="outline">Load More Invoices</Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
