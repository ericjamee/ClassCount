import { API_BASE_URL } from '../config';
import type { ClassDto, CreateClassDto } from '../types';

/**
 * API client for class management operations
 */

/**
 * Get all classes for a specific teacher
 */
export async function getClassesByTeacher(teacherId: number): Promise<ClassDto[]> {
  const response = await fetch(`${API_BASE_URL}/api/teachers/${teacherId}/classes`);

  if (!response.ok) {
    throw new Error('Failed to fetch classes');
  }

  return response.json();
}

/**
 * Create a new class
 */
export async function createClass(data: CreateClassDto): Promise<ClassDto> {
  const response = await fetch(`${API_BASE_URL}/api/classes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create class' }));
    throw new Error(error.message || error.errors?.[0] || 'Failed to create class');
  }

  return response.json();
}

/**
 * Update an existing class
 */
export async function updateClass(id: number, data: CreateClassDto): Promise<ClassDto> {
  const response = await fetch(`${API_BASE_URL}/api/classes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update class' }));
    throw new Error(error.message || error.errors?.[0] || 'Failed to update class');
  }

  return response.json();
}

/**
 * Delete a class
 */
export async function deleteClass(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/classes/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete class' }));
    throw new Error(error.message || error.errors?.[0] || 'Failed to delete class');
  }
}

