namespace backend.DTOs;

/// <summary>
/// DTO for returning attendance record data.
/// </summary>
public class AttendanceRecordDto
{
    public int Id { get; set; }
    public int SchoolId { get; set; }
    public string SchoolName { get; set; } = string.Empty;
    public string? SchoolRegion { get; set; }
    public int TeacherId { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public int? ClassId { get; set; }
    public string? ClassName { get; set; }
    public string Grade { get; set; } = string.Empty;
    public int StudentCount { get; set; }
    public DateOnly Date { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
}

