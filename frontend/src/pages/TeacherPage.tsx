import { useState, useEffect } from 'react';
import { createAttendanceRecord } from '../api/attendanceApi';
import { getSchools } from '../api/schoolApi';
import type { SchoolDto } from '../types';
import TextInput from '../components/TextInput';
import NumberInput from '../components/NumberInput';
import DateInput from '../components/DateInput';
import './TeacherPage.css';

/**
 * Teacher page for submitting attendance records
 * Includes localStorage persistence for form fields
 */
export default function TeacherPage() {
  // Load persisted values from localStorage on mount
  const loadPersistedValue = (key: string, defaultValue: string | number): string | number => {
    try {
      const saved = localStorage.getItem(`attendance_${key}`);
      if (saved !== null) {
        return key === 'schoolId' ? parseInt(saved, 10) : saved;
      }
      return defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [schools, setSchools] = useState<SchoolDto[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [schoolsError, setSchoolsError] = useState<string | null>(null);

  const [schoolId, setSchoolId] = useState<number>(() => {
    const saved = loadPersistedValue('schoolId', 0) as number;
    return saved || 0;
  });
  const [grade, setGrade] = useState(() => loadPersistedValue('grade', '') as string);
  const [studentCount, setStudentCount] = useState(0);
  const [date, setDate] = useState(() => {
    // Default to today's date in YYYY-MM-DD format
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load schools on mount
  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    setLoadingSchools(true);
    setSchoolsError(null);

    try {
      const data = await getSchools();
      setSchools(data);
      
      // If no school is selected but there are schools, select the first one
      if (schoolId === 0 && data.length > 0) {
        setSchoolId(data[0].id);
      }
    } catch (err) {
      setSchoolsError(
        err instanceof Error
          ? err.message
          : 'Failed to load schools. Please contact an administrator.'
      );
    } finally {
      setLoadingSchools(false);
    }
  };

  // Persist form values to localStorage (except studentCount and date)
  useEffect(() => {
    try {
      if (schoolId) localStorage.setItem('attendance_schoolId', schoolId.toString());
      if (grade) localStorage.setItem('attendance_grade', grade);
    } catch (error) {
      // localStorage might not be available, ignore
      console.warn('Failed to save to localStorage:', error);
    }
  }, [schoolId, grade]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Front-end validation
    if (!schoolId || schoolId === 0) {
      setErrorMessage('Please select a school');
      return;
    }
    if (!grade.trim()) {
      setErrorMessage('Grade is required');
      return;
    }
    if (studentCount < 0) {
      setErrorMessage('Student count must be 0 or greater');
      return;
    }
    if (!date) {
      setErrorMessage('Date is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await createAttendanceRecord({
        schoolId,
        grade: grade.trim(),
        studentCount,
        date,
      });

      // Success - clear studentCount and date, show success message
      setStudentCount(0);
      const today = new Date();
      setDate(today.toISOString().split('T')[0]);
      setSuccessMessage('Attendance saved successfully!');

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to save attendance. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSchool = schools.find(s => s.id === schoolId);

  return (
    <div className="teacher-page">
      <h2 className="page-title">Record Attendance</h2>
      <p className="page-description">
        Submit attendance records for your class. Select your school from the list below.
      </p>

      {schoolsError && (
        <div className="message message-error">
          {schoolsError}
          <button onClick={loadSchools} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {loadingSchools ? (
        <div className="loading-message">Loading schools...</div>
      ) : schools.length === 0 ? (
        <div className="message message-error">
          No schools available. Please contact an administrator to add schools.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="attendance-form">
          <div className="form-group">
            <label className="form-label">
              School <span className="required">*</span>
            </label>
            <select
              className="form-input form-select"
              value={schoolId}
              onChange={(e) => setSchoolId(parseInt(e.target.value, 10))}
              required
            >
              <option value={0}>Select a school...</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                  {school.region ? ` (${school.region})` : ''}
                </option>
              ))}
            </select>
            {selectedSchool?.region && (
              <div className="form-hint">Region: {selectedSchool.region}</div>
            )}
          </div>

          <TextInput
            label="Grade"
            value={grade}
            onChange={setGrade}
            required
            placeholder="e.g., Grade 1, Class 3"
            maxLength={100}
          />

          <NumberInput
            label="Number of Students"
            value={studentCount}
            onChange={setStudentCount}
            required
            min={0}
            max={200}
          />

          <DateInput
            label="Date"
            value={date}
            onChange={setDate}
            required
          />

          {successMessage && (
            <div className="message message-success">{successMessage}</div>
          )}

          {errorMessage && (
            <div className="message message-error">
              {errorMessage}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                }}
                className="retry-button"
              >
                Retry
              </button>
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Submit Attendance'}
          </button>
        </form>
      )}
    </div>
  );
}
