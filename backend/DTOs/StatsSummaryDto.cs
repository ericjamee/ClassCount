namespace backend.DTOs;

/// <summary>
/// DTO for attendance statistics summary.
/// </summary>
public class StatsSummaryDto
{
    public int TotalSubmissions { get; set; }
    public int TotalStudents { get; set; }
    public double AverageStudentsPerRecord { get; set; }
    public List<SchoolSummaryDto> SchoolSummaries { get; set; } = new();
    public List<RegionSummaryDto> RegionSummaries { get; set; } = new();
}

/// <summary>
/// Summary statistics grouped by school.
/// </summary>
public class SchoolSummaryDto
{
    public string SchoolName { get; set; } = string.Empty;
    public int TotalStudents { get; set; }
    public int SubmissionsCount { get; set; }
    public double AverageStudents { get; set; }
}

/// <summary>
/// Summary statistics grouped by region.
/// </summary>
public class RegionSummaryDto
{
    public string Region { get; set; } = string.Empty;
    public int TotalStudents { get; set; }
    public int SubmissionsCount { get; set; }
    public double AverageStudents { get; set; }
}

