# System Log Management Application

A full-stack log management system for ingesting, querying, and filtering logs with a simple file based storage.

## Overview

- **Log Ingestion**: REST API endpoint to ingest logs with validation
- **Advanced Filtering**: Search by message, log level, resource ID, and date range
- **Pagination**: Efficient handling of large datasets with server side pagination
- **File based Storage**: Simple JSON based persistence storage

### Approach

The application follows a **client-server architecture** with a clear separation of concerns:

- **Backend**: Handles log ingestion, filtering, pagination, and file I/O operations
- **Frontend**: Provides an intuitive UI with real-time filtering and smooth pagination
- **Data Layer**: File-based JSON storage for simplicity

---

## Features

### Core Features
- Log ingestion with full validation
- Multi-field filtering (message, level, resource ID, date range)
- Server-side pagination
- Responsive Design

### Performance Optimizations
- Separate loading states for pagination vs filtering
- Optimized filter application
---

## Tech Stack
### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Shadcn** - Component library
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **File System** - JSON-based persistence

---

## Installation

### Prerequisites
- [**Bun**](https://bun.com)

### Install Backend Dependencies
```bash
cd server
bun install
```

### Install Frontend Dependencies
```bash
cd client
bun install
```

## Running the Application

### Option 1: Run Both Servers Separately

#### Start Backend Server
```bash
cd backend
bun dev
```
The server will start on `http://localhost:3000`

#### Start Frontend Server
```bash
cd frontend
bun dev
```
The frontend will start on `http://localhost:5173`


## Design Decisions

### 1. **File-based Storage (JSON)**

**Decision**: Use a simple JSON file for data persistence.

- Zero external dependencies (no database setup required)
- Portable across environments
- Sufficient for the project scope

### 2. **Server Architecture**

**Decision**: Apply filters and pagination on the backend, not the frontend.

- Scales better with large datasets
- Faster frontend rendering
- Lower memory consumption on client

### 3. **Client Architecture**

**Decision**: Break down components into small, focused, memoized units.
- Separate `LoadingState`, `ErrorState`, `EmptyState` components
- Clear separation of concerns
---

## Project Structure

```
root/
├── server/
│   ├── src/
│   │   ├── server.ts           # Express server
│   │   ├── types/              # types
│   │   │   └── types.ts
│   │   └── utils/              # utilities
│   │       └── fs.ts
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Main.tsx        # Root component
│   │   │   ├── Filter.tsx      # Filter component
│   │   │   ├── LogsTable.tsx   # Log table
│   │   │   └── ui/             # shadcn components
│   │   ├── lib/                # utilities
│   │   │   └── utils.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│
└── README.md
```

---

## API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. Ingest Log
**POST** `/logs`

**Request Body**:
```json
{
  "level": "error",
  "message": "Database connection failed",
  "resourceId": "server-1234",
  "timestamp": "2024-09-15T08:00:00Z",
  "traceId": "abc-xyz-123",
  "spanId": "span-456",
  "commit": "5e5342f",
  "metadata": {
    "parentResourceId": "server-0987"
  }
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "message": "Log successfully created and stored.",
  "data": {
    "id": 1
  }
}
```

**Validation**: All fields are required. Returns `400` if any field is missing.

---

#### 2. Query Logs

**Example Request**:
```
GET /logs?level=error&message=database&page=1&limit=50
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": [
    {
      "id": "1",
      "level": "error",
      "message": "Database connection failed",
      "resourceId": "server-1234",
      "timestamp": "2024-09-15T08:00:00Z",
      "traceId": "abc-xyz-123",
      "spanId": "span-456",
      "commit": "5e5342f",
      "metadata": {
        "parentResourceId": "server-0987"
      }
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 50,
  "totalPages": 3
}
```