namespace backend.Models;

/// <summary>
/// Represents an attendance record submitted by a teacher.
/// </summary>
public class AttendanceRecord
{
    public int Id { get; set; }
    
    /// <summary>
    /// Foreign key to the School (required)
    /// </summary>
    public int SchoolId { get; set; }
    
    /// <summary>
    /// Navigation property to the School
    /// </summary>
    public School School { get; set; } = null!;
    
    /// <summary>
    /// Foreign key to the Teacher (required)
    /// </summary>
    public int TeacherId { get; set; }
    
    /// <summary>
    /// Navigation property to the Teacher
    /// </summary>
    public Teacher Teacher { get; set; } = null!;
    
    /// <summary>
    /// Foreign key to the Class (optional - for tracking specific class enrollment)
    /// </summary>
    public int? ClassId { get; set; }
    
    /// <summary>
    /// Navigation property to the Class
    /// </summary>
    public Class? Class { get; set; }
    
    /// <summary>
    /// Grade or class level (required, max 100 characters)
    /// </summary>
    public string Grade { get; set; } = string.Empty;
    
    /// <summary>
    /// Number of students present (required, >= 0)
    /// </summary>
    public int StudentCount { get; set; }
    
    /// <summary>
    /// Date of attendance (date only)
    /// </summary>
    public DateOnly Date { get; set; }
    
    /// <summary>
    /// Optional note from the teacher (max 500 characters)
    /// </summary>
    public string? Note { get; set; }
    
    /// <summary>
    /// UTC timestamp when the record was created
    /// </summary>
    public DateTime CreatedAt { get; set; }
}

