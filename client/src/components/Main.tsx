import { useState, useCallback } from "react";
import Filter from "./Filter";
import LogsTable from "./LogsTable";

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface FilterState {
  message: string;
  level: "info" | "warning" | "error" | "";
  resourceId: string;
  dateRange?: DateRange;
  page?: number;
  limit?: number;
}

const initialFilterState: FilterState = {
  message: "",
  level: "",
  resourceId: "",
  dateRange: undefined,
  page: 1,
  limit: 10,
};

export default function Main() {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(initialFilterState);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setAppliedFilters({ ...filters, page: 1 });
    },
    [filters]
  );

  const handleClearFilters = useCallback(() => {
    setFilters(initialFilterState);
    setAppliedFilters(initialFilterState);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setAppliedFilters((prev) => ({ ...prev, page }));
  }, []);

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col gap-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            System Log Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Filter and monitor system logs in real-time
          </p>
        </header>

        <Filter
          filters={filters}
          onChange={setFilters}
          onSubmit={handleSubmit}
          onClear={handleClearFilters}
        />

        <LogsTable filters={appliedFilters} onPageChange={handlePageChange} />
      </div>
    </div>
  );
}
