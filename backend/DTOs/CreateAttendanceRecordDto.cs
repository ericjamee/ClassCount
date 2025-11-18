using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

/// <summary>
/// DTO for creating a new attendance record.
/// </summary>
public class CreateAttendanceRecordDto
{
    [Required(ErrorMessage = "School ID is required")]
    public int SchoolId { get; set; }
    
    [Required(ErrorMessage = "Teacher ID is required")]
    public int TeacherId { get; set; }
    
    /// <summary>
    /// Optional class ID - if provided, links attendance to a specific class
    /// </summary>
    public int? ClassId { get; set; }
    
    [Required(ErrorMessage = "Grade is required")]
    [StringLength(100, ErrorMessage = "Grade cannot exceed 100 characters")]
    public string Grade { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Student count is required")]
    [Range(0, 200, ErrorMessage = "Student count must be between 0 and 200")]
    public int StudentCount { get; set; }
    
    [Required(ErrorMessage = "Date is required")]
    public DateOnly Date { get; set; }
    
    /// <summary>
    /// Optional note from the teacher (max 500 characters)
    /// </summary>
    [StringLength(500, ErrorMessage = "Note cannot exceed 500 characters")]
    public string? Note { get; set; }
}

