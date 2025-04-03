// components/data-table/columns.tsx
"use client";

import * as React from "react";
import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { inquirySchema } from "@/schema/inquiry";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { MoreVerticalIcon, GripVerticalIcon } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "../ui/button";

export type Inquiry = z.infer<typeof inquirySchema>;

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
    accessorKey: "service_date",
    header: "Service Date",
    cell: ({ row }) => {
      const value = row.original.service_date;
      return value ? new Date(value).toLocaleDateString() : "N/A";
    },
  },
  {
    accessorKey: "estimated_completion",
    header: "Est. Completion",
    cell: ({ row }) => {
      const value = row.original.estimated_completion;
      return value ? new Date(value).toLocaleDateString() : "N/A";
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

      // Optionally map statuses to different badge variants
      let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
      let label = status;

      switch (status) {
        case "new":
          variant = "default";
          label = "new";
          break;
        case "contacted":
          variant = "secondary";
          label = "contacted";
          break;
        case "scheduled":
          variant = "outline";
          label = "scheduled";
          break;
        case "completed":
          variant = "outline";
          label = "completed";
          break;
        case "cancelled":
          variant = "destructive";
          label = "cancelled";
          break;
      }

      return <Badge variant={variant}>{label}</Badge>;
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
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>View</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
