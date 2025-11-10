/**
 * Type definitions for the attendance tracking application
 */

export interface SchoolDto {
  id: number;
  name: string;
  region?: string;
  createdAt: string; // ISO datetime string
}

export interface CreateSchoolDto {
  name: string;
  region?: string;
}

export interface CreateAttendanceRecordDto {
  schoolId: number;
  grade: string;
  studentCount: number;
  date: string; // ISO date string (YYYY-MM-DD)
}

export interface AttendanceRecordDto {
  id: number;
  schoolId: number;
  schoolName: string;
  schoolRegion?: string;
  grade: string;
  studentCount: number;
  date: string; // ISO date string (YYYY-MM-DD)
  createdAt: string; // ISO datetime string
}

export interface SchoolSummaryDto {
  schoolName: string;
  totalStudents: number;
  submissionsCount: number;
  averageStudents: number;
}

export interface RegionSummaryDto {
  region: string;
  totalStudents: number;
  submissionsCount: number;
  averageStudents: number;
}

export interface StatsSummaryDto {
  totalSubmissions: number;
  totalStudents: number;
  averageStudentsPerRecord: number;
  schoolSummaries: SchoolSummaryDto[];
  regionSummaries: RegionSummaryDto[];
}

