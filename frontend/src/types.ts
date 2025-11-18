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

export interface TeacherDto {
  id: number;
  schoolId: number;
  name: string;
  createdAt: string; // ISO datetime string
}

export interface CreateTeacherDto {
  name: string;
  schoolId: number;
}

export interface ClassDto {
  id: number;
  teacherId: number;
  name: string;
  enrollment: number;
  createdAt: string; // ISO datetime string
}

export interface CreateClassDto {
  name: string;
  enrollment: number;
  teacherId: number;
}

export interface CreateAttendanceRecordDto {
  schoolId: number;
  teacherId: number;
  classId?: number; // Optional
  grade: string;
  studentCount: number;
  date: string; // ISO date string (YYYY-MM-DD)
  note?: string; // Optional
}

export interface AttendanceRecordDto {
  id: number;
  schoolId: number;
  schoolName: string;
  schoolRegion?: string;
  teacherId: number;
  teacherName: string;
  classId?: number;
  className?: string;
  grade: string;
  studentCount: number;
  date: string; // ISO date string (YYYY-MM-DD)
  note?: string;
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

