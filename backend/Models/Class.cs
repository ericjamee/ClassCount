namespace backend.Models;

/// <summary>
/// Represents a class taught by a teacher.
/// </summary>
public class Class
{
    public int Id { get; set; }
    
    /// <summary>
    /// Foreign key to the Teacher (required)
    /// </summary>
    public int TeacherId { get; set; }
    
    /// <summary>
    /// Navigation property to the Teacher
    /// </summary>
    public Teacher Teacher { get; set; } = null!;
    
    /// <summary>
    /// Class name or identifier (required, max 200 characters)
    /// </summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// Enrollment number - total students enrolled in this class (required, >= 0)
    /// </summary>
    public int Enrollment { get; set; }
    
    /// <summary>
    /// UTC timestamp when the class was created
    /// </summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// Navigation property for attendance records
    /// </summary>
    public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
}

