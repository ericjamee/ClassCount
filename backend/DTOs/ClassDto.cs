using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

/// <summary>
/// DTO for returning class data.
/// </summary>
public class ClassDto
{
    public int Id { get; set; }
    public int TeacherId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Enrollment { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for creating a new class.
/// </summary>
public class CreateClassDto
{
    [Required(ErrorMessage = "Class name is required")]
    [StringLength(200, ErrorMessage = "Class name cannot exceed 200 characters")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Enrollment is required")]
    [Range(0, 500, ErrorMessage = "Enrollment must be between 0 and 500")]
    public int Enrollment { get; set; }

    [Required(ErrorMessage = "Teacher ID is required")]
    public int TeacherId { get; set; }
}

