"use server";

import { Stripe } from "stripe";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export interface Invoice {
  id: string;
  number: string | null;
  status: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  created: number;
  due_date: number | null;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  period_start: number | null;
  period_end: number | null;
  customer_email: string | null;
  description: string | null;
  lines: {
    id: string;
    description: string | null;
    amount: number;
    currency: string;
    period: {
      start: number;
      end: number;
    } | null;
    price_id?: string | null;
    unit_amount?: number | null;
  }[];
}

export interface InvoiceListResponse {
  invoices: Invoice[];
  has_more: boolean;
  error?: string;
}

export async function fetchInvoices({
  status,
  limit = 10,
  starting_after,
  ending_before,
}: {
  status?: "draft" | "open" | "paid" | "uncollectible" | "void";
  limit?: number;
  starting_after?: string;
  ending_before?: string;
} = {}): Promise<InvoiceListResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Get user's Stripe customer ID through service_providers table
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq(
        "service_provider_id",
        (await supabase.from("service_providers").select("id").eq("auth_user_id", user.id).single()).data?.id
      )
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!subscription?.stripe_customer_id) {
      return { invoices: [], has_more: false };
    }

    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: subscription.stripe_customer_id,
      limit: Math.min(limit, 100),
      status,
      starting_after,
      ending_before,
    });

    // Transform data with correct field mappings
    const transformedInvoices: Invoice[] = invoices.data.map(
      (invoice: Stripe.Invoice): Invoice => ({
        id: invoice.id || "",
        number: invoice.number,
        status: invoice.status || "draft",
        amount_paid: invoice.amount_paid,
        amount_due: invoice.amount_due,
        currency: invoice.currency,
        created: invoice.created,
        due_date: invoice.due_date,
        hosted_invoice_url: invoice.hosted_invoice_url ?? null,
        invoice_pdf: invoice.invoice_pdf ?? null,
        period_start: invoice.period_start,
        period_end: invoice.period_end,
        customer_email: invoice.customer_email,
        description: invoice.description,
        lines: invoice.lines.data.map((line: Stripe.InvoiceLineItem) => ({
          id: line.id,
          description: line.description,
          amount: line.amount,
          currency: line.currency,
          period: line.period
            ? {
                start: line.period.start,
                end: line.period.end,
              }
            : null,
          price_id: (line as any).price_id || null,
          unit_amount: (line as any).unit_amount || null,
        })),
      })
    );

    return {
      invoices: transformedInvoices,
      has_more: invoices.has_more,
    };
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return {
      invoices: [],
      has_more: false,
      error: error instanceof Error ? error.message : "Failed to fetch invoices",
    };
  }
}
