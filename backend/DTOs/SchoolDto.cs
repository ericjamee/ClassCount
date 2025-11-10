using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

/// <summary>
/// DTO for School data.
/// </summary>
public class SchoolDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Region { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for creating a new school.
/// </summary>
public class CreateSchoolDto
{
    [Required(ErrorMessage = "School name is required")]
    [StringLength(200, ErrorMessage = "School name cannot exceed 200 characters")]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(100, ErrorMessage = "Region cannot exceed 100 characters")]
    public string? Region { get; set; }
}

