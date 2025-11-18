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
    TeacherId = record.TeacherId,
    TeacherName = record.Teacher.Name,
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

// PUT /api/schools/{id} - Update an existing school
app.MapPut("/api/schools/{id}", async (AppDbContext db, int id, CreateSchoolDto dto) =>
{
    // Server-side validation
    var validationResults = new List<ValidationResult>();
    var validationContext = new ValidationContext(dto);
    
    if (!Validator.TryValidateObject(dto, validationContext, validationResults, true))
    {
        return Results.BadRequest(new { errors = validationResults.Select(v => v.ErrorMessage) });
    }
    
    var school = await db.Schools.FindAsync(id);
    if (school == null)
    {
        return Results.NotFound();
    }
    
    // Trim and validate
    var name = dto.Name.Trim();
    if (string.IsNullOrWhiteSpace(name))
    {
        return Results.BadRequest(new { errors = new[] { "School name is required" } });
    }
    
    // Check if another school with same name already exists
    var existingSchool = await db.Schools.FirstOrDefaultAsync(s => s.Name == name && s.Id != id);
    if (existingSchool != null)
    {
        return Results.BadRequest(new { errors = new[] { "A school with this name already exists" } });
    }
    
    try
    {
        school.Name = name;
        school.Region = string.IsNullOrWhiteSpace(dto.Region) ? null : dto.Region.Trim();
        
        await db.SaveChangesAsync();
        
        return Results.Ok(new SchoolDto
        {
            Id = school.Id,
            Name = school.Name,
            Region = school.Region,
            CreatedAt = school.CreatedAt
        });
    }
    catch (DbUpdateException ex)
    {
        Console.WriteLine($"Error updating school: {ex.Message}");
        return Results.BadRequest(new { errors = new[] { "A school with this name already exists" } });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error updating school: {ex.Message}");
        return Results.StatusCode(500);
    }
})
.WithName("UpdateSchool")
.Produces<SchoolDto>(StatusCodes.Status200OK)
.Produces(StatusCodes.Status400BadRequest)
.Produces(StatusCodes.Status404NotFound)
.Produces(StatusCodes.Status500InternalServerError);

// DELETE /api/schools/{id} - Delete a school
app.MapDelete("/api/schools/{id}", async (AppDbContext db, int id) =>
{
    try
    {
        var school = await db.Schools
            .Include(s => s.AttendanceRecords)
            .FirstOrDefaultAsync(s => s.Id == id);
        
        if (school == null)
        {
            return Results.NotFound();
        }
        
        // Check if school has attendance records
        if (school.AttendanceRecords.Any())
        {
            return Results.BadRequest(new { errors = new[] { "Cannot delete school with existing attendance records" } });
        }
        
        db.Schools.Remove(school);
        await db.SaveChangesAsync();
        
        return Results.NoContent();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error deleting school: {ex.Message}");
        return Results.StatusCode(500);
    }
})
.WithName("DeleteSchool")
.Produces(StatusCodes.Status204NoContent)
.Produces(StatusCodes.Status400BadRequest)
.Produces(StatusCodes.Status404NotFound)
.Produces(StatusCodes.Status500InternalServerError);

// ========== TEACHER MANAGEMENT ENDPOINTS ==========

// GET /api/schools/{schoolId}/teachers - Get all teachers for a school
app.MapGet("/api/schools/{schoolId}/teachers", async (AppDbContext db, int schoolId) =>
{
    try
    {
        var teachers = await db.Teachers
            .Where(t => t.SchoolId == schoolId)
            .OrderBy(t => t.Name)
            .ToListAsync();
        
        return Results.Ok(teachers.Select(t => new TeacherDto
        {
            Id = t.Id,
            SchoolId = t.SchoolId,
            Name = t.Name,
            CreatedAt = t.CreatedAt
        }).ToList());
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error retrieving teachers: {ex.Message}");
        return Results.StatusCode(500);
    }
})
.WithName("GetTeachersBySchool")
.Produces<List<TeacherDto>>(StatusCodes.Status200OK)
.Produces(StatusCodes.Status500InternalServerError);

// POST /api/teachers - Create a new teacher
app.MapPost("/api/teachers", async (AppDbContext db, CreateTeacherDto dto) =>
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
    
    // Trim and validate
    var name = dto.Name.Trim();
    if (string.IsNullOrWhiteSpace(name))
    {
        return Results.BadRequest(new { errors = new[] { "Teacher name is required" } });
    }
    
    try
    {
        var teacher = new Teacher
        {
            SchoolId = dto.SchoolId,
            Name = name,
            CreatedAt = DateTime.UtcNow
        };
        
        db.Teachers.Add(teacher);
        await db.SaveChangesAsync();
        
        return Results.Created($"/api/teachers/{teacher.Id}", new TeacherDto
        {
            Id = teacher.Id,
            SchoolId = teacher.SchoolId,
            Name = teacher.Name,
            CreatedAt = teacher.CreatedAt
        });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error saving teacher: {ex.Message}");
        return Results.StatusCode(500);
    }
})
.WithName("CreateTeacher")
.Produces<TeacherDto>(StatusCodes.Status201Created)
.Produces(StatusCodes.Status400BadRequest)
.Produces(StatusCodes.Status500InternalServerError);

// PUT /api/teachers/{id} - Update an existing teacher
app.MapPut("/api/teachers/{id}", async (AppDbContext db, int id, CreateTeacherDto dto) =>
{
    // Server-side validation
    var validationResults = new List<ValidationResult>();
    var validationContext = new ValidationContext(dto);
    
    if (!Validator.TryValidateObject(dto, validationContext, validationResults, true))
    {
        return Results.BadRequest(new { errors = validationResults.Select(v => v.ErrorMessage) });
    }
    
    var teacher = await db.Teachers.FindAsync(id);
    if (teacher == null)
    {
        return Results.NotFound();
    }
    
    // Verify school exists
    var school = await db.Schools.FindAsync(dto.SchoolId);
    if (school == null)
    {
        return Results.BadRequest(new { errors = new[] { "Invalid school ID" } });
    }
    
    // Trim and validate
    var name = dto.Name.Trim();
    if (string.IsNullOrWhiteSpace(name))
    {
        return Results.BadRequest(new { errors = new[] { "Teacher name is required" } });
    }
    
    try
    {
        teacher.Name = name;
        teacher.SchoolId = dto.SchoolId;
        
        await db.SaveChangesAsync();
        
        return Results.Ok(new TeacherDto
        {
            Id = teacher.Id,
            SchoolId = teacher.SchoolId,
            Name = teacher.Name,
            CreatedAt = teacher.CreatedAt
        });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error updating teacher: {ex.Message}");
        return Results.StatusCode(500);
    }
})
.WithName("UpdateTeacher")
.Produces<TeacherDto>(StatusCodes.Status200OK)
.Produces(StatusCodes.Status400BadRequest)
.Produces(StatusCodes.Status404NotFound)
.Produces(StatusCodes.Status500InternalServerError);

// DELETE /api/teachers/{id} - Delete a teacher
app.MapDelete("/api/teachers/{id}", async (AppDbContext db, int id) =>
{
    try
    {
        var teacher = await db.Teachers
            .Include(t => t.AttendanceRecords)
            .FirstOrDefaultAsync(t => t.Id == id);
        
        if (teacher == null)
        {
            return Results.NotFound();
        }
        
        // Check if teacher has attendance records
        if (teacher.AttendanceRecords.Any())
        {
            return Results.BadRequest(new { errors = new[] { "Cannot delete teacher with existing attendance records" } });
        }
        
        db.Teachers.Remove(teacher);
        await db.SaveChangesAsync();
        
        return Results.NoContent();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error deleting teacher: {ex.Message}");
        return Results.StatusCode(500);
    }
})
.WithName("DeleteTeacher")
.Produces(StatusCodes.Status204NoContent)
.Produces(StatusCodes.Status400BadRequest)
.Produces(StatusCodes.Status404NotFound)
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
    
    // Verify teacher exists and belongs to the school
    var teacher = await db.Teachers.FindAsync(dto.TeacherId);
    if (teacher == null)
    {
        return Results.BadRequest(new { errors = new[] { "Invalid teacher ID" } });
    }
    if (teacher.SchoolId != dto.SchoolId)
    {
        return Results.BadRequest(new { errors = new[] { "Teacher does not belong to the selected school" } });
    }
    
    try
    {
        var record = new AttendanceRecord
        {
            SchoolId = dto.SchoolId,
            TeacherId = dto.TeacherId,
            Grade = dto.Grade.Trim(),
            StudentCount = dto.StudentCount,
            Date = dto.Date,
            CreatedAt = DateTime.UtcNow
        };
        
        db.AttendanceRecords.Add(record);
        await db.SaveChangesAsync();
        
        // Load school and teacher for DTO mapping
        await db.Entry(record).Reference(r => r.School).LoadAsync();
        await db.Entry(record).Reference(r => r.Teacher).LoadAsync();
        
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
            .Include(r => r.Teacher)
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
        
        // Calculate overall stats (removed TotalStudents - it's not a meaningful metric)
        var totalSubmissions = records.Count;
        var averageStudents = totalSubmissions > 0 ? records.Average(r => (double)r.StudentCount) : 0;
        
        // Group by school
        var schoolSummaries = records
            .GroupBy(r => r.School.Name)
            .Select(g => new SchoolSummaryDto
            {
                SchoolName = g.Key,
                TotalStudents = 0, // Not used anymore, but keeping for backward compatibility
                SubmissionsCount = g.Count(),
                AverageStudents = g.Average(r => (double)r.StudentCount)
            })
            .OrderByDescending(s => s.SubmissionsCount)
            .ToList();
        
        // Group by region (only records with region)
        var regionSummaries = records
            .Where(r => !string.IsNullOrWhiteSpace(r.School.Region))
            .GroupBy(r => r.School.Region!)
            .Select(g => new RegionSummaryDto
            {
                Region = g.Key,
                TotalStudents = 0, // Not used anymore, but keeping for backward compatibility
                SubmissionsCount = g.Count(),
                AverageStudents = g.Average(r => (double)r.StudentCount)
            })
            .OrderByDescending(r => r.SubmissionsCount)
            .ToList();
        
        var summary = new StatsSummaryDto
        {
            TotalSubmissions = totalSubmissions,
            TotalStudents = 0, // Removed - not a meaningful metric
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
