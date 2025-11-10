# Engage Now Africa - Student Attendance Tracking System

A lightweight full-stack web application for tracking student attendance across 4 schools in Ghana. Built with React (Vite + TypeScript) frontend and .NET 9 Web API backend.

## Project Structure

```
GhanaAttendance/
├── backend/          # .NET 9 Web API
│   ├── Data/        # DbContext and database configuration
│   ├── DTOs/        # Data Transfer Objects
│   ├── Models/      # Entity models
│   └── Program.cs   # Application entry point and API endpoints
├── frontend/         # React + TypeScript (Vite)
│   ├── src/
│   │   ├── api/     # API client functions
│   │   ├── components/  # Reusable React components
│   │   ├── pages/   # Page components (Teacher, Admin)
│   │   └── config.ts    # API base URL configuration
└── README.md
```

## Features

- **Teacher View**: Simple form to submit attendance records with localStorage persistence
- **Admin Dashboard**: View statistics grouped by school and region with filtering
- **Mobile-First Design**: Optimized for low-end devices and weak Wi-Fi connections
- **Lightweight**: Minimal dependencies, fast loading times

## Prerequisites

- **.NET SDK 9.0** (or later) - [Download](https://dotnet.microsoft.com/download)
- **Node.js 18+** and npm - [Download](https://nodejs.org/)
- **SQLite** (included with .NET, no separate installation needed)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Restore dependencies (if not already done):
   ```bash
   dotnet restore
   ```

3. Apply database migrations:
   ```bash
   dotnet ef database update
   ```
   
   Note: If `dotnet ef` is not found, install it globally:
   ```bash
   dotnet tool install --global dotnet-ef
   ```

4. Run the backend:
   ```bash
   dotnet run
   ```

   The API will be available at:
   - HTTP: `http://localhost:5000`
   - HTTPS: `https://localhost:7164` (if configured)

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure API Base URL (optional):
   
   The frontend is configured to use `http://localhost:5000` by default. To change this:
   
   - Create a `.env` file in the `frontend` directory:
     ```
     VITE_API_BASE_URL=http://localhost:5000
     ```
   
   - Or update `src/config.ts` directly

4. Run the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173` (or another port if 5173 is in use)

## API Endpoints

### POST /api/attendance
Create a new attendance record.

**Request Body:**
```json
{
  "schoolName": "School Name",
  "grade": "Grade 1",
  "studentCount": 25,
  "date": "2024-01-15",
  "region": "Accra" // optional
}
```

**Response:** 201 Created with the created record

### GET /api/attendance
Get attendance records with optional filters.

**Query Parameters:**
- `schoolName` (optional): Filter by school name
- `grade` (optional): Filter by grade
- `region` (optional): Filter by region
- `startDate` (optional): Filter records from this date (YYYY-MM-DD)
- `endDate` (optional): Filter records until this date (YYYY-MM-DD)

**Response:** Array of attendance records

### GET /api/attendance/stats/summary
Get summary statistics.

**Query Parameters:**
- `startDate` (optional): Filter statistics from this date
- `endDate` (optional): Filter statistics until this date

**Response:**
```json
{
  "totalSubmissions": 100,
  "totalStudents": 2500,
  "averageStudentsPerRecord": 25.0,
  "schoolSummaries": [
    {
      "schoolName": "School A",
      "totalStudents": 1000,
      "submissionsCount": 40,
      "averageStudents": 25.0
    }
  ],
  "regionSummaries": [
    {
      "region": "Accra",
      "totalStudents": 1500,
      "submissionsCount": 60,
      "averageStudents": 25.0
    }
  ]
}
```

## Usage

### For Teachers

1. Open the application in your browser
2. Navigate to "Record Attendance"
3. Fill in the form:
   - School Name (required)
   - Grade (required)
   - Region/Community (optional)
   - Number of Students (required, 0-200)
   - Date (required, defaults to today)
4. Click "Submit Attendance"
5. Your school name, grade, and region will be saved for next time

### For Administrators

1. Navigate to "Dashboard"
2. Use the filters to narrow down statistics:
   - Date range (start and end dates)
   - School name filter
   - Region filter
3. Click "Apply Filters" to update the view
4. View summary cards showing:
   - Total submissions
   - Total students counted
   - Average students per submission
5. Review tables grouped by:
   - School (with submission counts and averages)
   - Region (if region data is available)

## Database

The application uses SQLite with a database file named `attendance.db` in the backend directory. The database is automatically created when you first run the application.

### Database Schema

**AttendanceRecord:**
- `Id` (int, PK)
- `SchoolName` (string, max 200, required)
- `Grade` (string, max 100, required)
- `StudentCount` (int, required, >= 0)
- `Date` (DateOnly, required)
- `Region` (string, max 100, optional)
- `CreatedAt` (DateTime, UTC, auto-set)

## Development Notes

### Backend

- Uses minimal APIs (no controllers)
- EF Core with SQLite provider
- CORS enabled for frontend origins (localhost:5173, localhost:3000, localhost:5174)
- Error handling with appropriate HTTP status codes
- Server-side validation using Data Annotations

### Frontend

- React with TypeScript
- React Router for navigation
- localStorage for form field persistence
- Mobile-first responsive design
- Minimal dependencies for fast loading
- No heavy UI frameworks or chart libraries

## Production Deployment

### Backend

1. Build the application:
   ```bash
   cd backend
   dotnet publish -c Release -o ./publish
   ```

2. Update CORS settings in `Program.cs` to allow your production frontend URL

3. Configure the database connection string if using PostgreSQL instead of SQLite

### Frontend

1. Build for production:
   ```bash
   cd frontend
   npm run build
   ```

2. The `dist` folder contains the production build

3. Update `VITE_API_BASE_URL` in `.env.production` or build configuration to point to your production API

## Troubleshooting

### Backend won't start
- Ensure port 5000 is not in use
- Check that all NuGet packages are restored: `dotnet restore`
- Verify database migrations are applied: `dotnet ef database update`

### Frontend can't connect to backend
- Verify the backend is running on `http://localhost:5000`
- Check CORS configuration in `Program.cs`
- Update `API_BASE_URL` in `frontend/src/config.ts` if using a different port

### Database issues
- Delete `attendance.db` and run `dotnet ef database update` to recreate
- Check that SQLite is properly configured in `Program.cs`

## License

This project is built for Engage Now Africa.

