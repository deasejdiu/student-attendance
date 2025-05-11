# Attendance Export Service

A microservice for exporting student attendance data in various formats, built with Node.js, Express, and MongoDB.

## Features

- Export attendance data in CSV, Excel, PDF, and JSON formats
- Synchronize attendance data from the main application
- Background processing of export jobs
- Automatic cleanup of expired exports
- Authentication and authorization
- Analytics and insights

## Setup

### Prerequisites

- Node.js 14+
- MongoDB 4.4+
- Access to the main attendance API

### Installation

1. Clone the repository:
   ```
   git clone https://your-repo-url/attendance-export-service.git
   cd attendance-export-service
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on the `.env.example` template:
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration

5. Start the service:
   ```
   npm start
   ```

### Configuration

The following environment variables can be set in the `.env` file:

- `PORT`: The port the service will run on (default: 4500)
- `MONGODB_URI`: Connection URI for MongoDB
- `MAIN_API_URL`: URL of the main attendance API
- `SYNC_API_KEY`: API key for syncing data
- `JWT_SECRET`: Secret key for JWT authentication
- `EXPORTS_STORAGE_PATH`: Path to store exported files
- `MAX_EXPORT_AGE_DAYS`: Number of days to keep exports before cleanup

## API Endpoints

### Export Endpoints

- `POST /api/exports`: Create a new export job
- `GET /api/exports`: Get all export jobs for the current user
- `GET /api/exports/status/:jobId`: Get status of an export job
- `GET /api/exports/download/:jobId`: Download an export file
- `GET /api/exports/analytics/:studentId`: Get attendance analytics for a student

### Sync Endpoints

- `GET /api/sync/status`: Get sync status
- `POST /api/sync/full`: Trigger a full sync
- `POST /api/sync/incremental`: Trigger an incremental sync

### Status Endpoint

- `GET /api/status`: Get service status

## Scripts

- `npm start`: Start the service
- `npm run dev`: Start the service in development mode with auto-reload
- `npm run sync`: Run a sync manually (add 'full' argument for full sync)

## Maintenance

### Scheduled Tasks

Set up cron jobs for:

1. Incremental sync (every hour):
   ```
   0 * * * * cd /path/to/attendance-export-service && node scripts/runSync.js
   ```

2. Cleanup of expired exports (daily):
   ```
   0 0 * * * cd /path/to/attendance-export-service && node scripts/cleanupExports.js
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.