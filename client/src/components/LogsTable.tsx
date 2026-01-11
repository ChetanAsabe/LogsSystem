import { useEffect, useState, useCallback, useMemo, memo } from "react";
import axios, { AxiosError } from "axios";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Spinner } from "./ui/spinner";
import type { FilterState } from "./Main";

interface Log {
  id: string;
  resourceId: string;
  traceId: string;
  spanId: string;
  commit: string;
  message: string;
  timestamp: string;
  level: "error" | "info" | "warning";
}

interface LogsResponse {
  data: Log[];
  total?: number;
  page?: number;
  limit?: number;
}

const TABLE_HEADERS = [
  "Id",
  "Resource Id",
  "Trace Id",
  "Span Id",
  "Commit",
  "Message",
  "Timestamp",
  "Level",
] as const;

const LEVEL_STYLES = {
  error: "bg-red-500 text-white",
  warning: "bg-yellow-500 text-black",
  info: "bg-gray-500 text-white",
} as const;

function LoadingState() {
  return (
    <TableRow>
      <TableCell colSpan={TABLE_HEADERS.length} className="py-6">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Spinner className="h-4 w-4" />
          Applying filters...
        </div>
      </TableCell>
    </TableRow>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <TableRow>
      <TableCell
        colSpan={TABLE_HEADERS.length}
        className="py-6 text-center text-destructive"
      >
        {message}
      </TableCell>
    </TableRow>
  );
}

function EmptyState() {
  return (
    <TableRow>
      <TableCell
        colSpan={TABLE_HEADERS.length}
        className="text-center py-6 text-muted-foreground"
      >
        No logs found.
      </TableCell>
    </TableRow>
  );
}

const LogRow = memo(({ log }: { log: Log }) => {
  const formattedDate = useMemo(
    () => new Date(log.timestamp).toLocaleString(),
    [log.timestamp]
  );

  return (
    <TableRow>
      <TableCell className="font-mono text-xs">{log.id}</TableCell>
      <TableCell className="font-mono text-xs">{log.resourceId}</TableCell>
      <TableCell className="font-mono text-xs">{log.traceId}</TableCell>
      <TableCell className="font-mono text-xs">{log.spanId}</TableCell>
      <TableCell className="font-mono text-xs">{log.commit}</TableCell>
      <TableCell className="max-w-[240px]">
        <div className="truncate" title={log.message}>
          {log.message}
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap">{formattedDate}</TableCell>
      <TableCell>
        <Badge className={`capitalize w-16 ${LEVEL_STYLES[log.level]}`}>
          {log.level}
        </Badge>
      </TableCell>
    </TableRow>
  );
});

interface LogsTableProps {
  filters: FilterState;
  onPageChange?: (page: number) => void;
}

export default function LogsTable({ filters, onPageChange }: LogsTableProps) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPaginating, setIsPaginating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [prevFiltersRef, setPrevFiltersRef] = useState<FilterState>(filters);

  const fetchLogs = useCallback(async (): Promise<void> => {
    const isOnlyPageChange =
      prevFiltersRef.message === filters.message &&
      prevFiltersRef.level === filters.level &&
      prevFiltersRef.resourceId === filters.resourceId &&
      JSON.stringify(prevFiltersRef.dateRange) ===
        JSON.stringify(filters.dateRange) &&
      prevFiltersRef.page !== filters.page;

    if (isOnlyPageChange) {
      setIsPaginating(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const response = await axios.get<LogsResponse>(
        `http://localhost:3000/logs`,
        {
          params: filters,
        }
      );
      setLogs(response.data.data);
      setTotalCount(response.data.total || response.data.data.length);
      setPrevFiltersRef(filters);
    } catch (err) {
      const axiosError = err as AxiosError;
      const errorMessage =
        axiosError.response?.status === 404
          ? "Logs endpoint not found"
          : axiosError.response?.status === 500
          ? "Server error occurred"
          : axiosError.message || "Failed to fetch logs";
      setError(errorMessage);
      setLogs([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
      setIsPaginating(false);
    }
  }, [filters, prevFiltersRef]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const currentPage = filters.page || 1;
  const limit = filters.limit || 50;
  const totalPages = Math.ceil(totalCount / limit);

  const handlePreviousPage = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="w-full rounded-md border">
      <div className="h-108 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {TABLE_HEADERS.map((header) => (
                <TableHead
                  key={header}
                  className="bg-primary-foreground text-muted-foreground border-b"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody
            className={isPaginating ? "opacity-50 pointer-events-none" : ""}
          >
            {loading && <LoadingState />}
            {!loading && error && <ErrorState message={error} />}
            {!loading && !error && logs.length === 0 && <EmptyState />}
            {!loading &&
              !error &&
              logs.map((log) => <LogRow key={log.id} log={log} />)}
          </TableBody>
        </Table>
      </div>

      {!loading && !error && totalCount > 0 && (
        <div className="flex justify-end px-4 py-3 border-t bg-muted/30">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isPaginating}
              type="button"
            >
              Previous
            </Button>

            <div className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || isPaginating}
              type="button"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
