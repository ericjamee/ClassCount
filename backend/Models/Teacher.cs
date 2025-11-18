namespace backend.Models;

/// <summary>
/// Represents a teacher associated with a school.
/// </summary>
public class Teacher
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
    /// Teacher's full name (required, max 200 characters)
    /// </summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// UTC timestamp when the teacher was created
    /// </summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// Navigation property for attendance records
    /// </summary>
    public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
}

