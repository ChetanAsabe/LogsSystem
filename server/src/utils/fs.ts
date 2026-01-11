import fs from "fs";
import path from "path";
import type { Log } from "../types/types";

const DB_PATH = path.join(__dirname, "data", "logs.json");

function readLogs() {
  const data = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(data) as Log[];
}

function writeLogs(logs: Log[]) {
  fs.writeFileSync(DB_PATH, JSON.stringify(logs, null, 2));
}

export { readLogs, writeLogs };
