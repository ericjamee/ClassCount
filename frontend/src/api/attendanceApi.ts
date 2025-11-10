import { API_BASE_URL } from '../config';
import type { CreateAttendanceRecordDto, AttendanceRecordDto, StatsSummaryDto } from '../types';

/**
 * API client for attendance operations
 */

/**
 * Create a new attendance record
 */
export async function createAttendanceRecord(
  data: CreateAttendanceRecordDto
): Promise<AttendanceRecordDto> {
  const response = await fetch(`${API_BASE_URL}/api/attendance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      schoolId: data.schoolId,
      grade: data.grade,
      studentCount: data.studentCount,
      date: data.date,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create attendance record' }));
    throw new Error(error.message || 'Failed to create attendance record');
  }

  return response.json();
}

/**
 * Get attendance records with optional filters
 */
export async function getAttendanceRecords(params?: {
  schoolName?: string;
  grade?: string;
  region?: string;
  startDate?: string;
  endDate?: string;
}): Promise<AttendanceRecordDto[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.schoolName) queryParams.append('schoolName', params.schoolName);
  if (params?.grade) queryParams.append('grade', params.grade);
  if (params?.region) queryParams.append('region', params.region);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const url = `${API_BASE_URL}/api/attendance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch attendance records');
  }

  return response.json();
}

/**
 * Get summary statistics
 */
export async function getStatsSummary(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<StatsSummaryDto> {
  const queryParams = new URLSearchParams();
  
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const url = `${API_BASE_URL}/api/attendance/stats/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch statistics');
  }

  return response.json();
}

