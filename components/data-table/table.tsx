"use client";

import React from "react";
import { z } from "zod";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table";

import { inquirySchema } from "@/schema/inquiry";
import { columns } from "./columns"; // The columns from above
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVerticalIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";

const inquiryArraySchema = z.array(inquirySchema);
export type Inquiry = z.infer<typeof inquirySchema>;

function DraggableRow({ row, onRowClick }: { row: Row<Inquiry>; onRowClick?: (inquiryId: string) => void }) {
  // This hook ties a row to @dnd-kit sorting
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  const handleRowClick = () => {
    if (onRowClick) {
      onRowClick(row.original.id);
    }
  };

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      onClick={handleRowClick}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 cursor-pointer hover:bg-muted/50 transition-colors"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable({
  data: initialData,
  onRowClick,
}: {
  data: Inquiry[];
  onRowClick?: (inquiryId: string) => void;
}) {
  const [data, setData] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // For pagination
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);

  // For the top bar filters
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedRecency, setSelectedRecency] = React.useState("");
  const [selectedBudgetRange, setSelectedBudgetRange] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState("");
  const [selectedJobType, setSelectedJobType] = React.useState("");

  // DnD sensors
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor), useSensor(KeyboardSensor));

  // Map each data entry's ID into a list for sorting
  const dataIds = React.useMemo(() => data.map((row) => row.id), [data]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // If you want a global filter for the searchTerm, you can set that up here
    // but for simplicity, we won't add a fuzzy filter. You can adapt as needed.
    // pagination
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const fnValue = updater({
          pageIndex,
          pageSize,
        });
        setPageIndex(fnValue.pageIndex);
        setPageSize(fnValue.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
    },
  });

  // Handle drag-and-drop reordering
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((oldData) => {
        const oldIndex = dataIds.indexOf(active.id as string);
        const newIndex = dataIds.indexOf(over.id as string);
        return arrayMove(oldData, oldIndex, newIndex);
      });
    }
  }

  // Get unique job types from data for filter options
  const uniqueJobTypes = React.useMemo(() => {
    const types = [...new Set(data.map((row) => row.job_type).filter(Boolean))];
    return types.sort();
  }, [data]);

  // Enhanced filter logic
  const filteredData = React.useMemo(() => {
    return data.filter((row) => {
      // Search term matching on name/phone/email/job description
      const matchesSearch =
        !searchTerm ||
        row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.job_description || "").toLowerCase().includes(searchTerm.toLowerCase());

      // Recency filter based on inquiry date
      const matchesRecency =
        !selectedRecency ||
        selectedRecency === "all" ||
        (() => {
          if (!row.created_at) return false;
          const inquiryDate = new Date(row.created_at);
          const now = new Date();
          const daysDiff = Math.floor((now.getTime() - inquiryDate.getTime()) / (1000 * 60 * 60 * 24));

          switch (selectedRecency) {
            case "today":
              return daysDiff === 0;
            case "week":
              return daysDiff <= 7;
            case "month":
              return daysDiff <= 30;
            case "3months":
              return daysDiff <= 90;
            default:
              return true;
          }
        })();

      // Budget range filter
      const matchesBudget =
        !selectedBudgetRange ||
        selectedBudgetRange === "all" ||
        (() => {
          const budget = row.budget;
          if (!budget) return selectedBudgetRange === "unspecified";

          switch (selectedBudgetRange) {
            case "under500":
              return budget < 500;
            case "500-1000":
              return budget >= 500 && budget <= 1000;
            case "1000-5000":
              return budget > 1000 && budget <= 5000;
            case "5000-10000":
              return budget > 5000 && budget <= 10000;
            case "over10000":
              return budget > 10000;
            case "unspecified":
              return false; // already handled above
            default:
              return true;
          }
        })();

      // Status filter
      const matchesStatus = !selectedStatus || selectedStatus === "all" || row.status === selectedStatus;

      // Job type filter
      const matchesJobType = !selectedJobType || selectedJobType === "all" || row.job_type === selectedJobType;

      return matchesSearch && matchesRecency && matchesBudget && matchesStatus && matchesJobType;
    });
  }, [data, searchTerm, selectedRecency, selectedBudgetRange, selectedStatus, selectedJobType]);

  // Because we used "data" directly in the table, let's pass filteredData
  // back to the table. Or you can incorporate filtering directly in your
  // table config. For brevity, we can just override the rowModel after the fact.
  const rowModel = table.getRowModel();

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Top bar filters */}
      <div className="flex flex-wrap items-center gap-4 px-2 sm:px-4 lg:px-6">
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-[200px] lg:w-[250px]"
        />

        <Select value={selectedRecency} onValueChange={setSelectedRecency}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Inquiry Dates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All dates</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
            <SelectItem value="3months">Last 3 months</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedBudgetRange} onValueChange={setSelectedBudgetRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All budgets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All budgets</SelectItem>
            <SelectItem value="under500">Under $500</SelectItem>
            <SelectItem value="500-1000">$500 - $1,000</SelectItem>
            <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
            <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
            <SelectItem value="over10000">Over $10,000</SelectItem>
            <SelectItem value="unspecified">Unspecified</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedJobType} onValueChange={setSelectedJobType}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All job types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All job types</SelectItem>
            {uniqueJobTypes.map((jobType) => (
              <SelectItem key={jobType} value={jobType}>
                {jobType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* DataTable */}
      <div className="overflow-hidden rounded-lg border mx-2 sm:mx-4 lg:mx-6">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          sensors={sensors}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {filteredData.length ? (
                  filteredData.map((inquiry) => {
                    // Because we are filtering outside the table,
                    // we manually render rows that match the filter.
                    const row = rowModel.rows.find((r) => r.original.id === inquiry.id);
                    if (!row) return null;
                    return <DraggableRow key={row.id} row={row} onRowClick={onRowClick} />;
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </SortableContext>
        </DndContext>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2 sm:px-4 lg:px-6">
        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <div className="flex w-full items-center gap-2 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <span className="text-sm font-medium">Rows per page</span>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeftIcon className="h-4 w-4" />
              <span className="sr-only">Go to first page</span>
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeftIcon className="h-4 w-4" />
              <span className="sr-only">Go to previous page</span>
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRightIcon className="h-4 w-4" />
              <span className="sr-only">Go to next page</span>
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRightIcon className="h-4 w-4" />
              <span className="sr-only">Go to last page</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
