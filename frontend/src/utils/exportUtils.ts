import type { AttendanceRecordDto } from '../types';

/**
 * Export attendance records to CSV format
 * Each row represents one attendance entry
 */
export function exportToCSV(records: AttendanceRecordDto[], filename: string = 'attendance-data.csv') {
  // CSV header
  const headers = ['ID', 'School Name', 'School Region', 'Teacher Name', 'Grade', 'Student Count', 'Date', 'Created At'];
  
  // Convert records to CSV rows (one row per attendance entry)
  const rows = records.map(record => [
    record.id.toString(),
    `"${record.schoolName.replace(/"/g, '""')}"`, // Escape quotes in CSV
    record.schoolRegion ? `"${record.schoolRegion.replace(/"/g, '""')}"` : '',
    `"${record.teacherName.replace(/"/g, '""')}"`,
    `"${record.grade.replace(/"/g, '""')}"`,
    record.studentCount.toString(),
    record.date,
    new Date(record.createdAt).toLocaleString()
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export stats summary to CSV
 */
export function exportStatsToCSV(
  stats: { schoolSummaries: Array<{ schoolName: string; totalStudents: number; submissionsCount: number; averageStudents: number }> },
  filename: string = 'attendance-stats.csv'
) {
  const headers = ['School Name', 'Submissions', 'Average Students'];
  
  const rows = stats.schoolSummaries.map(school => [
    `"${school.schoolName.replace(/"/g, '""')}"`,
    school.submissionsCount.toString(),
    school.averageStudents.toFixed(2)
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

