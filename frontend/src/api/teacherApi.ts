import { API_BASE_URL } from '../config';
import type { TeacherDto, CreateTeacherDto } from '../types';

/**
 * API client for teacher management operations
 */

/**
 * Get all teachers for a school
 */
export async function getTeachersBySchool(schoolId: number): Promise<TeacherDto[]> {
  const response = await fetch(`${API_BASE_URL}/api/schools/${schoolId}/teachers`);

  if (!response.ok) {
    throw new Error('Failed to fetch teachers');
  }

  return response.json();
}

/**
 * Create a new teacher
 */
export async function createTeacher(data: CreateTeacherDto): Promise<TeacherDto> {
  const response = await fetch(`${API_BASE_URL}/api/teachers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: data.name,
      schoolId: data.schoolId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create teacher' }));
    throw new Error(error.message || error.errors?.[0] || 'Failed to create teacher');
  }

  return response.json();
}

/**
 * Update an existing teacher
 */
export async function updateTeacher(id: number, data: CreateTeacherDto): Promise<TeacherDto> {
  const response = await fetch(`${API_BASE_URL}/api/teachers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: data.name,
      schoolId: data.schoolId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update teacher' }));
    throw new Error(error.message || error.errors?.[0] || 'Failed to update teacher');
  }

  return response.json();
}

/**
 * Delete a teacher
 */
export async function deleteTeacher(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/teachers/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete teacher' }));
    throw new Error(error.message || error.errors?.[0] || 'Failed to delete teacher');
  }
}

