# Health Monitoring Manual

This manual details the monitoring services and diagnostics endpoints of the platform.

## Health Diagnostics Endpoint (`GET /health`)

The server exposes a detailed health check endpoint at `/health` returning:
- **status**: Overall platform health (`healthy` | `degraded` | `unhealthy`).
- **database**: JSON file integrity and writability test.
- **ai_service**: Verifies the presence of `GEMINI_API_KEY`. If key is missing, indicates `degraded` (local fallbacks active).
- **uptime**: Formatted process execution time (Hours, Minutes, Seconds).
- **memoryUsage**: Memory footprint (RSS, total heap, and used heap).
- **last_backup**: Date string of database files modification dates.

## Diagnostic Response Example
```json
{
  "status": "healthy",
  "database": "healthy",
  "ai_service": "healthy",
  "uptime": "1h 45m 12s",
  "version": "1.0.0",
  "last_backup": "2026-06-15T13:46:00.000Z",
  "environment": "production",
  "memoryUsage": {
    "rss": "45.23 MB",
    "heapTotal": "22.50 MB",
    "heapUsed": "14.89 MB"
  }
}
```
