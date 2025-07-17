// components/data-table/columns.tsx
"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Inquiry } from "@/app/actions/fetch-inquiries";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/inquiry/status-badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { MoreVerticalIcon, GripVerticalIcon } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { Button } from "../ui/button";

/**
 * A small handle for row dragging.
 * Remove if you don't need reordering.
 */
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({ id });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="h-4 w-4" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

export const columns: ColumnDef<Inquiry>[] = [
  // Drag column
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
    enableSorting: false,
    enableHiding: false,
  },
  // Select column
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Customer Name",
    enableSorting: true,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    enableSorting: true,
  },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: true,
  },
  {
    accessorKey: "inquiry_date",
    header: "Inquiry Date",
    cell: ({ row }) => {
      const value = row.original.inquiry_date;
      return value ? new Date(value).toLocaleDateString() : "N/A";
    },
  },
  {
    accessorKey: "job_type",
    header: "Service Type",
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.original.job_type;
      if (!value) return "N/A";

      // Categorize the job type for display consistency
      const categorizeJobType = (jobType: string): string => {
        const jobTypeLower = jobType.toLowerCase();

        const serviceKeywordMappings = {
          "New Builds": [
            "new build",
            "new builds",
            "new construction",
            "new home",
            "new house",
            "construction",
            "building",
            "build",
            "new property",
            "ground up",
          ],
          Renovations: [
            "renovation",
            "renovations",
            "renovate",
            "remodel",
            "remodeling",
            "kitchen renovation",
            "bathroom renovation",
            "home renovation",
            "renovation work",
            "makeover",
            "upgrade",
            "modernize",
            "refurbish",
            "kitchen remodel",
            "bathroom remodel",
            "room renovation",
          ],
          Repairs: [
            "repair",
            "repairs",
            "fix",
            "fixing",
            "broken",
            "maintenance",
            "leak repair",
            "roof repair",
            "plumbing repair",
            "electrical repair",
            "pipe repair",
            "drain repair",
            "tap repair",
            "faucet repair",
            "heating repair",
            "cooling repair",
            "hvac repair",
            "boiler repair",
          ],
          Installations: [
            "installation",
            "installations",
            "install",
            "installing",
            "fit",
            "fitting",
            "new installation",
            "system installation",
            "appliance installation",
            "fixture installation",
            "equipment installation",
            "setup",
            "mounting",
          ],
          "Emergency Call-Outs": [
            "emergency",
            "urgent",
            "call-out",
            "callout",
            "emergency call",
            "urgent repair",
            "emergency service",
            "after hours",
            "weekend service",
            "immediate",
            "asap",
            "burst pipe",
            "no hot water",
            "no heating",
          ],
          Inspections: [
            "inspection",
            "inspections",
            "check",
            "assessment",
            "survey",
            "safety inspection",
            "compliance check",
            "pre-purchase inspection",
            "building inspection",
            "system check",
            "maintenance check",
          ],
          "Custom Work": [
            "custom",
            "bespoke",
            "specialized",
            "unique",
            "custom work",
            "special project",
            "one-off",
            "tailored",
            "specific requirements",
          ],
        };

        for (const [category, keywords] of Object.entries(serviceKeywordMappings)) {
          if (keywords.some((keyword) => jobTypeLower.includes(keyword.toLowerCase()))) {
            return category;
          }
        }

        return jobType;
      };

      const categorized = categorizeJobType(value);

      // Show original with categorized in parentheses if different
      return categorized === value ? categorized : `${categorized}`;
    },
  },
  {
    accessorKey: "preferred_service_date",
    header: "Job Time",
    cell: ({ row }) => {
      const dateValue = row.original.preferred_service_date;
      const textValue = row.original.preferred_service_date_text;

      if (textValue) {
        return textValue;
      } else if (dateValue) {
        return new Date(dateValue).toLocaleDateString();
      } else {
        return "N/A";
      }
    },
  },
  {
    accessorKey: "budget",
    header: "Budget",
    cell: ({ row }) => {
      const value = row.original.budget;
      return value ? `$${value.toFixed(2)}` : "N/A";
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const inquiryDate = row.original.inquiry_date;

      return <StatusBadge status={status} inquiryDate={inquiryDate} />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted">
            <MoreVerticalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>View</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
