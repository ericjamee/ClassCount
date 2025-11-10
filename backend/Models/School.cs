namespace backend.Models;

/// <summary>
/// Represents a school that can be selected when recording attendance.
/// </summary>
public class School
{
    public int Id { get; set; }
    
    /// <summary>
    /// Name of the school (required, max 200 characters, unique)
    /// </summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// Region or community where the school is located (optional, max 100 characters)
    /// </summary>
    public string? Region { get; set; }
    
    /// <summary>
    /// UTC timestamp when the school was created
    /// </summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// Navigation property for attendance records
    /// </summary>
    public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
}

