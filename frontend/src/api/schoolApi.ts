import { API_BASE_URL } from '../config';
import type { SchoolDto, CreateSchoolDto } from '../types';

/**
 * API client for school management operations
 */

/**
 * Get all schools
 */
export async function getSchools(): Promise<SchoolDto[]> {
  const response = await fetch(`${API_BASE_URL}/api/schools`);

  if (!response.ok) {
    throw new Error('Failed to fetch schools');
  }

  return response.json();
}

/**
 * Create a new school
 */
export async function createSchool(data: CreateSchoolDto): Promise<SchoolDto> {
  const response = await fetch(`${API_BASE_URL}/api/schools`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: data.name,
      region: data.region || null,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create school' }));
    throw new Error(error.message || error.errors?.[0] || 'Failed to create school');
  }

  return response.json();
}

/**
 * Update an existing school
 */
export async function updateSchool(id: number, data: CreateSchoolDto): Promise<SchoolDto> {
  const response = await fetch(`${API_BASE_URL}/api/schools/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: data.name,
      region: data.region || null,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update school' }));
    throw new Error(error.message || error.errors?.[0] || 'Failed to update school');
  }

  return response.json();
}

/**
 * Delete a school
 */
export async function deleteSchool(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/schools/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete school' }));
    throw new Error(error.message || error.errors?.[0] || 'Failed to delete school');
  }
}
