import express, { type Request, type Response } from "express";
import cors from "cors";
import type { ApiResponse, Log } from "./types/types";
import { readLogs, writeLogs } from "./utils/fs";

const PORT = process.env.PORT || 3000;

const REQUIRED_LOG_FIELDS: (keyof Log)[] = [
  "level",
  "message",
  "resourceId",
  "timestamp",
  "traceId",
  "spanId",
  "commit",
  "metadata",
];

interface LogQueryParams {
  level?: string;
  message?: string;
  resourceId?: string;
  timestamp?: string;
  traceId?: string;
  spanId?: string;
  commit?: string;
  "dateRange[from]"?: string;
  "dateRange[to]"?: string;
  page?: string;
  limit?: string;
}

function validateLog(log: Partial<Log>): { valid: boolean; missing?: string } {
  for (const field of REQUIRED_LOG_FIELDS) {
    if (log[field] === undefined) {
      return { valid: false, missing: field };
    }
  }
  return { valid: true };
}

function applyFilters(logs: Log[], filters: any): Log[] {
  let filtered = [...logs];

  if (filters.level) {
    filtered = filtered.filter((log) => log.level === filters.level);
  }

  if (filters.message) {
    const searchTerm = filters.message.toLowerCase();
    filtered = filtered.filter((log) =>
      log.message.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.resourceId) {
    filtered = filtered.filter((log) => log.resourceId === filters.resourceId);
  }

  if (filters.timestamp) {
    const filterDate = new Date(filters.timestamp);
    filtered = filtered.filter((log) => new Date(log.timestamp) >= filterDate);
  }

  if (filters.traceId) {
    filtered = filtered.filter((log) => log.traceId === filters.traceId);
  }

  if (filters.spanId) {
    filtered = filtered.filter((log) => log.spanId === filters.spanId);
  }

  if (filters.commit) {
    filtered = filtered.filter((log) => log.commit === filters.commit);
  }

  const dateFrom = filters["dateRange[from]"];
  const dateTo = filters["dateRange[to]"];

  if (dateFrom || dateTo) {
    filtered = filtered.filter((log) => {
      const logDate = new Date(log.timestamp);

      if (dateFrom && dateTo) {
        return logDate >= new Date(dateFrom) && logDate <= new Date(dateTo);
      } else if (dateFrom) {
        return logDate >= new Date(dateFrom);
      } else if (dateTo) {
        return logDate <= new Date(dateTo);
      }

      return true;
    });
  }

  return filtered;
}

function sortLogsByTimestamp(logs: Log[]): Log[] {
  return logs.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

async function ingestLog(req: Request, res: Response, next: any) {
  try {
    const log = req.body as Log;

    const validation = validateLog(log);
    if (!validation.valid) {
      return res.status(400).json({
        status: "error",
        message: `${validation.missing} is required.`,
      } as ApiResponse);
    }

    const logs = readLogs();

    const id = logs.length === 0 ? 1 : Number(logs[logs.length - 1]?.id) + 1;

    logs.push({ ...log, id } as Log);
    writeLogs(logs);

    res.status(201).json({
      status: "success",
      message: "Log successfully created and stored.",
      data: { id, ...log },
    } as ApiResponse);
  } catch (error) {
    next(error);
  }
}

async function getLogs(req: Request, res: Response, next: any) {
  try {
    const filters = req.query as LogQueryParams;

    let logs = readLogs();

    logs = applyFilters(logs, filters);

    logs = sortLogsByTimestamp(logs);
    const totalCount = logs.length;

    const page = parseInt(filters.page || "1", 10);
    const limit = parseInt(filters.limit || "50", 10);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginated = logs.slice(startIndex, endIndex);

    res.status(200).json({
      status: "success",
      data: paginated,
      total: totalCount,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalCount / limit),
    } as ApiResponse<Log[]>);
  } catch (error) {
    next(error);
  }
}

const app = express();

app.use(cors());
app.use(express.json());

app.post("/logs", ingestLog);
app.get("/logs", getLogs);

app.use((err: Error, req: Request, res: Response) => {
  res.status(500).json({
    status: "error",
    message: "Internal server error",
    error: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
