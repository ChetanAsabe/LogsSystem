import { cn } from "@/lib/utils";
import type { FilterState } from "./Main";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, FilterIcon, XIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useMemo } from "react";

interface FilterProps {
  filters: FilterState;
  onChange: React.Dispatch<React.SetStateAction<FilterState>>;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB");
}

function formatDateRange(range?: any): string {
  if (!range?.from) return "Pick a date range";
  if (!range.to) return formatDate(range.from);
  return `${formatDate(range.from)} – ${formatDate(range.to)}`;
}

function DateRangePicker({ value, onChange }: any) {
  const displayText = useMemo(() => formatDateRange(value), [value]);
  const hasValue = Boolean(value?.from);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-between font-normal w-56",
            !hasValue && "text-muted-foreground"
          )}
          type="button"
        >
          <span className="truncate mr-2">{displayText}</span>
          <div className="flex items-center gap-1">
            {hasValue && (
              <XIcon
                className="h-3 w-3 hover:text-destructive transition-colors"
                onClick={handleClear}
              />
            )}
            <CalendarIcon className="h-4 w-4 shrink-0" />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="center">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
          disabled={{ after: new Date() }}
        />
      </PopoverContent>
    </Popover>
  );
}

function LevelSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: FilterState["level"]) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-52">
        <SelectValue placeholder="Level" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="info">Info</SelectItem>
        <SelectItem value="warning">Warning</SelectItem>
        <SelectItem value="error">Error</SelectItem>
      </SelectContent>
    </Select>
  );
}

export default function Filter({
  filters,
  onChange,
  onSubmit,
  onClear,
}: FilterProps) {
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange((prev) => ({ ...prev, message: e.target.value }));
  };

  const handleLevelChange = (value: FilterState["level"]) => {
    onChange((prev) => ({ ...prev, level: value }));
  };

  const handleDateRangeChange = (range?: any) => {
    onChange((prev) => ({ ...prev, dateRange: range }));
  };

  const handleResourceIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange((prev) => ({ ...prev, resourceId: e.target.value }));
  };

  const handleClearAll = () => {
    onChange({
      message: "",
      level: "",
      dateRange: undefined,
      resourceId: "",
    });
    onClear();
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.message ||
      filters.level ||
      filters.dateRange?.from ||
      filters.resourceId
    );
  }, [filters]);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <Input
            className="w-52"
            placeholder="Search message..."
            value={filters.message}
            onChange={handleMessageChange}
            aria-label="Filter by message"
          />

          <LevelSelect value={filters.level} onChange={handleLevelChange} />

          <DateRangePicker
            value={filters.dateRange}
            onChange={handleDateRangeChange}
          />

          <Input
            className="w-52"
            placeholder="Resource ID"
            value={filters.resourceId}
            onChange={handleResourceIdChange}
            aria-label="Filter by resource ID"
          />
        </div>

        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button
              type="submit"
              variant="ghost"
              onClick={handleClearAll}
              className="h-10"
            >
              Clear All
            </Button>
          )}

          <Button
            type="submit"
            variant="outline"
            className="h-10"
          >
            Apply Filters <FilterIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
