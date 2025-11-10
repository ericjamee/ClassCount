using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.DTOs;
using System.ComponentModel.DataAnnotations;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=attendance.db"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // Get allowed origins from environment variable or use defaults
        var allowedOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS");
        var origins = allowedOrigins?.Split(',') ?? new[] 
        { 
            "http://localhost:5173", 
            "http://localhost:3000", 
            "http://localhost:5174" 
        };
        
        policy.WithOrigins(origins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

var app = builder.Build();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Only use HTTPS redirection in development (Render handles HTTPS)
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");

// Helper method to map AttendanceRecord entity to DTO
static AttendanceRecordDto MapToDto(AttendanceRecord record) => new()
{
    Id = record.Id,
    SchoolId = record.SchoolId,
    SchoolName = record.School.Name,
    SchoolRegion = record.School.Region,
    Grade = record.Grade,
    StudentCount = record.StudentCount,
    Date = record.Date,
    CreatedAt = record.CreatedAt
};

// ========== SCHOOL MANAGEMENT ENDPOINTS ==========

// GET /api/schools - Get all schools
app.MapGet("/api/schools", async (AppDbContext db) =>
{
    try
    {
        var schools = await db.Schools
            .OrderBy(s => s.Name)
            .ToListAsync();
        
        return Results.Ok(schools.Select(s => new SchoolDto
        {
            Id = s.Id,
            Name = s.Name,
            Region = s.Region,
            CreatedAt = s.CreatedAt
        }).ToList());
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error retrieving schools: {ex.Message}");
        return Results.StatusCode(500);
    }
})
.WithName("GetSchools")
.Produces<List<SchoolDto>>(StatusCodes.Status200OK)
.Produces(StatusCodes.Status500InternalServerError);

// POST /api/schools - Create a new school
app.MapPost("/api/schools", async (AppDbContext db, CreateSchoolDto dto) =>
{
    // Server-side validation
    var validationResults = new List<ValidationResult>();
    var validationContext = new ValidationContext(dto);
    
    if (!Validator.TryValidateObject(dto, validationContext, validationResults, true))
    {
        return Results.BadRequest(new { errors = validationResults.Select(v => v.ErrorMessage) });
    }
    
    // Trim and validate
    var name = dto.Name.Trim();
    if (string.IsNullOrWhiteSpace(name))
    {
        return Results.BadRequest(new { errors = new[] { "School name is required" } });
    }
    
    // Check if school with same name already exists
    var existingSchool = await db.Schools.FirstOrDefaultAsync(s => s.Name == name);
    if (existingSchool != null)
    {
        return Results.BadRequest(new { errors = new[] { "A school with this name already exists" } });
    }
    
    try
    {
        var school = new School
        {
            Name = name,
            Region = string.IsNullOrWhiteSpace(dto.Region) ? null : dto.Region.Trim(),
            CreatedAt = DateTime.UtcNow
        };
        
        db.Schools.Add(school);
        await db.SaveChangesAsync();
        
        return Results.Created($"/api/schools/{school.Id}", new SchoolDto
        {
            Id = school.Id,
            Name = school.Name,
            Region = school.Region,
            CreatedAt = school.CreatedAt
        });
    }
    catch (DbUpdateException ex)
    {
        Console.WriteLine($"Error saving school: {ex.Message}");
        return Results.BadRequest(new { errors = new[] { "A school with this name already exists" } });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error saving school: {ex.Message}");
        return Results.StatusCode(500);
    }
})
.WithName("CreateSchool")
.Produces<SchoolDto>(StatusCodes.Status201Created)
.Produces(StatusCodes.Status400BadRequest)
.Produces(StatusCodes.Status500InternalServerError);

// ========== ATTENDANCE ENDPOINTS ==========

// POST /api/attendance - Create a new attendance record
app.MapPost("/api/attendance", async (AppDbContext db, CreateAttendanceRecordDto dto) =>
{
    // Server-side validation
    var validationResults = new List<ValidationResult>();
    var validationContext = new ValidationContext(dto);
    
    if (!Validator.TryValidateObject(dto, validationContext, validationResults, true))
    {
        return Results.BadRequest(new { errors = validationResults.Select(v => v.ErrorMessage) });
    }
    
    // Verify school exists
    var school = await db.Schools.FindAsync(dto.SchoolId);
    if (school == null)
    {
        return Results.BadRequest(new { errors = new[] { "Invalid school ID" } });
    }
    
    try
    {
        var record = new AttendanceRecord
        {
            SchoolId = dto.SchoolId,
            Grade = dto.Grade.Trim(),
            StudentCount = dto.StudentCount,
            Date = dto.Date,
            CreatedAt = DateTime.UtcNow
        };
        
        db.AttendanceRecords.Add(record);
        await db.SaveChangesAsync();
        
        // Load school for DTO mapping
        await db.Entry(record).Reference(r => r.School).LoadAsync();
        
        return Results.Created($"/api/attendance/{record.Id}", MapToDto(record));
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error saving attendance record: {ex.Message}");
        return Results.StatusCode(500);
    }
})
.WithName("CreateAttendanceRecord")
.Produces<AttendanceRecordDto>(StatusCodes.Status201Created)
.Produces(StatusCodes.Status400BadRequest)
.Produces(StatusCodes.Status500InternalServerError);

// GET /api/attendance - Get attendance records with optional filters
app.MapGet("/api/attendance", async (AppDbContext db, 
    int? schoolId = null,
    string? schoolName = null,
    string? grade = null,
    string? region = null,
    DateOnly? startDate = null,
    DateOnly? endDate = null) =>
{
    try
    {
        var query = db.AttendanceRecords
            .Include(r => r.School)
            .AsQueryable();
        
        // Apply filters
        if (schoolId.HasValue)
        {
            query = query.Where(r => r.SchoolId == schoolId.Value);
        }
        
        if (!string.IsNullOrWhiteSpace(schoolName))
        {
            var schoolNameFilter = schoolName.Trim();
            query = query.Where(r => EF.Functions.Like(r.School.Name, $"%{schoolNameFilter}%"));
        }
        
        if (!string.IsNullOrWhiteSpace(grade))
        {
            var gradeFilter = grade.Trim();
            query = query.Where(r => EF.Functions.Like(r.Grade, $"%{gradeFilter}%"));
        }
        
        if (!string.IsNullOrWhiteSpace(region))
        {
            var regionFilter = region.Trim();
            query = query.Where(r => r.School.Region != null && EF.Functions.Like(r.School.Region, $"%{regionFilter}%"));
        }
        
        if (startDate.HasValue)
        {
            query = query.Where(r => r.Date >= startDate.Value);
        }
        
        if (endDate.HasValue)
        {
            query = query.Where(r => r.Date <= endDate.Value);
        }
        
        // Order by date descending (most recent first)
        var records = await query
            .OrderByDescending(r => r.Date)
            .ThenByDescending(r => r.CreatedAt)
            .ToListAsync();
        
        return Results.Ok(records.Select(MapToDto).ToList());
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error retrieving attendance records: {ex.Message}");
        return Results.StatusCode(500);
    }
})
.WithName("GetAttendanceRecords")
.Produces<List<AttendanceRecordDto>>(StatusCodes.Status200OK)
.Produces(StatusCodes.Status500InternalServerError);

// GET /api/attendance/stats/summary - Get summary statistics
app.MapGet("/api/attendance/stats/summary", async (AppDbContext db,
    DateOnly? startDate = null,
    DateOnly? endDate = null) =>
{
    try
    {
        var query = db.AttendanceRecords
            .Include(r => r.School)
            .AsQueryable();
        
        // Apply date filters if provided
        if (startDate.HasValue)
        {
            query = query.Where(r => r.Date >= startDate.Value);
        }
        
        if (endDate.HasValue)
        {
            query = query.Where(r => r.Date <= endDate.Value);
        }
        
        var records = await query.ToListAsync();
        
        if (!records.Any())
        {
            return Results.Ok(new StatsSummaryDto
            {
                TotalSubmissions = 0,
                TotalStudents = 0,
                AverageStudentsPerRecord = 0,
                SchoolSummaries = new List<SchoolSummaryDto>(),
                RegionSummaries = new List<RegionSummaryDto>()
            });
        }
        
        // Calculate overall stats
        var totalSubmissions = records.Count;
        var totalStudents = records.Sum(r => r.StudentCount);
        var averageStudents = totalSubmissions > 0 ? (double)totalStudents / totalSubmissions : 0;
        
        // Group by school
        var schoolSummaries = records
            .GroupBy(r => r.School.Name)
            .Select(g => new SchoolSummaryDto
            {
                SchoolName = g.Key,
                TotalStudents = g.Sum(r => r.StudentCount),
                SubmissionsCount = g.Count(),
                AverageStudents = g.Count() > 0 ? (double)g.Sum(r => r.StudentCount) / g.Count() : 0
            })
            .OrderByDescending(s => s.TotalStudents)
            .ToList();
        
        // Group by region (only records with region)
        var regionSummaries = records
            .Where(r => !string.IsNullOrWhiteSpace(r.School.Region))
            .GroupBy(r => r.School.Region!)
            .Select(g => new RegionSummaryDto
            {
                Region = g.Key,
                TotalStudents = g.Sum(r => r.StudentCount),
                SubmissionsCount = g.Count(),
                AverageStudents = g.Count() > 0 ? (double)g.Sum(r => r.StudentCount) / g.Count() : 0
            })
            .OrderByDescending(r => r.TotalStudents)
            .ToList();
        
        var summary = new StatsSummaryDto
        {
            TotalSubmissions = totalSubmissions,
            TotalStudents = totalStudents,
            AverageStudentsPerRecord = averageStudents,
            SchoolSummaries = schoolSummaries,
            RegionSummaries = regionSummaries
        };
        
        return Results.Ok(summary);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error calculating statistics: {ex.Message}");
        return Results.StatusCode(500);
    }
})
.WithName("GetStatsSummary")
.Produces<StatsSummaryDto>(StatusCodes.Status200OK)
.Produces(StatusCodes.Status500InternalServerError);

// Configure port from environment variable (for Render) or default to 5000
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
app.Urls.Add($"http://0.0.0.0:{port}");

app.Run();
