using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

/// <summary>
/// DTO for Teacher data.
/// </summary>
public class TeacherDto
{
    public int Id { get; set; }
    public int SchoolId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for creating a new teacher.
/// </summary>
public class CreateTeacherDto
{
    [Required(ErrorMessage = "Teacher name is required")]
    [StringLength(200, ErrorMessage = "Teacher name cannot exceed 200 characters")]
    public string Name { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "School ID is required")]
    public int SchoolId { get; set; }
}

