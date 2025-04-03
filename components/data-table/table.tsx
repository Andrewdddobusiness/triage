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

function DraggableRow({ row }: { row: Row<Inquiry> }) {
  // This hook ties a row to @dnd-kit sorting
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
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

export function DataTable({ data: initialData }: { data: Inquiry[] }) {
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
  const [selectedDate, setSelectedDate] = React.useState("");
  const [selectedBudget, setSelectedBudget] = React.useState("");

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

  // Example filter logic (very simplistic)
  // Typically you'd use a custom filter or the built-in column filters.
  const filteredData = React.useMemo(() => {
    return data.filter((row) => {
      // Basic string matching on name/phone/email
      const matchesSearch =
        row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.email || "").toLowerCase().includes(searchTerm.toLowerCase());

      // Basic date match if user selected a date
      const matchesDate = selectedDate ? row.service_date?.slice(0, 10) === selectedDate : true;

      // Basic budget match if user selected a budget
      // e.g. "All budgets", "Under $1000", etc.
      // (You can expand or parse this logic as needed.)
      const matchesBudget = selectedBudget
        ? selectedBudget === "All" // or custom logic
        : true;

      return matchesSearch && matchesDate && matchesBudget;
    });
  }, [data, searchTerm, selectedDate, selectedBudget]);

  // Because we used "data" directly in the table, let's pass filteredData
  // back to the table. Or you can incorporate filtering directly in your
  // table config. For brevity, we can just override the rowModel after the fact.
  const rowModel = table.getRowModel();

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Top bar filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 sm:px-4 lg:px-6">
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-[200px] lg:w-[250px]"
        />
        <Input
          placeholder="dd/mm/yyyy"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-[150px]"
        />
        {/* <Select value={selectedBudget} onValueChange={(val) => setSelectedBudget(val)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All budgets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All budgets</SelectItem>
            <SelectItem value="Under 1000">Under $1000</SelectItem>
            <SelectItem value="Under 5000">Under $5000</SelectItem>
       
          </SelectContent>
        </Select> */}
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
                    return <DraggableRow key={row.id} row={row} />;
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
