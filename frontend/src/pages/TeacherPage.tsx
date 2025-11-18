import { useState, useEffect } from 'react';
import { createAttendanceRecord } from '../api/attendanceApi';
import { getSchools } from '../api/schoolApi';
import { getTeachersBySchool } from '../api/teacherApi';
import { getClassesByTeacher } from '../api/classApi';
import type { SchoolDto, TeacherDto, ClassDto } from '../types';
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
        return key === 'schoolId' || key === 'teacherId' ? parseInt(saved, 10) : saved;
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
  const [teachers, setTeachers] = useState<TeacherDto[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [teacherId, setTeacherId] = useState<number>(() => {
    const saved = loadPersistedValue('teacherId', 0) as number;
    return saved || 0;
  });
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [classId, setClassId] = useState<number | undefined>(() => {
    const saved = loadPersistedValue('classId', 0) as number;
    return saved && saved !== 0 ? saved : undefined;
  });
  const [grade, setGrade] = useState(() => loadPersistedValue('grade', '') as string);
  const [studentCount, setStudentCount] = useState(0);
  const [note, setNote] = useState('');
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

  // Load teachers when school changes
  useEffect(() => {
    if (schoolId && schoolId !== 0) {
      loadTeachers(schoolId);
    } else {
      setTeachers([]);
      setTeacherId(0);
      setClasses([]);
      setClassId(undefined);
    }
  }, [schoolId]);

  // Load classes when teacher changes
  useEffect(() => {
    if (teacherId && teacherId !== 0) {
      loadClasses(teacherId);
    } else {
      setClasses([]);
      setClassId(undefined);
    }
  }, [teacherId]);

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

  const loadTeachers = async (schoolId: number) => {
    setLoadingTeachers(true);
    try {
      const data = await getTeachersBySchool(schoolId);
      setTeachers(data);
      
      // If no teacher is selected but there are teachers, select the first one
      if (teacherId === 0 && data.length > 0) {
        setTeacherId(data[0].id);
      } else if (data.length > 0 && !data.find(t => t.id === teacherId)) {
        // If current teacher doesn't belong to this school, select first teacher
        setTeacherId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load teachers:', err);
      setTeachers([]);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const loadClasses = async (teacherId: number) => {
    setLoadingClasses(true);
    try {
      const data = await getClassesByTeacher(teacherId);
      setClasses(data);
      
      // If a class was previously selected but doesn't exist for this teacher, clear it
      if (classId && !data.find(c => c.id === classId)) {
        setClassId(undefined);
      }
    } catch (err) {
      console.error('Failed to load classes:', err);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Persist form values to localStorage (except studentCount, date, and note)
  useEffect(() => {
    try {
      if (schoolId) localStorage.setItem('attendance_schoolId', schoolId.toString());
      if (teacherId) localStorage.setItem('attendance_teacherId', teacherId.toString());
      if (classId) localStorage.setItem('attendance_classId', classId.toString());
      else localStorage.removeItem('attendance_classId');
      if (grade) localStorage.setItem('attendance_grade', grade);
    } catch (error) {
      // localStorage might not be available, ignore
      console.warn('Failed to save to localStorage:', error);
    }
  }, [schoolId, teacherId, classId, grade]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Front-end validation
    if (!schoolId || schoolId === 0) {
      setErrorMessage('Please select a school');
      return;
    }
    if (!teacherId || teacherId === 0) {
      setErrorMessage('Please select a teacher');
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
        teacherId,
        classId: classId,
        grade: grade.trim(),
        studentCount,
        date,
        note: note.trim() || undefined,
      });

      // Success - clear studentCount, date, and note, show success message
      setStudentCount(0);
      setNote('');
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
        Submit attendance records for your class. Select your school and teacher from the lists below.
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

          {schoolId && schoolId !== 0 && (
            <div className="form-group">
              <label className="form-label">
                Teacher <span className="required">*</span>
              </label>
              {loadingTeachers ? (
                <div className="loading-message-small">Loading teachers...</div>
              ) : teachers.length === 0 ? (
                <div className="message message-error">
                  No teachers available for this school. Please contact an administrator to add teachers.
                </div>
              ) : (
                <select
                  className="form-input form-select"
                  value={teacherId}
                  onChange={(e) => setTeacherId(parseInt(e.target.value, 10))}
                  required
                >
                  <option value={0}>Select a teacher...</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {teacherId && teacherId !== 0 && (
            <div className="form-group">
              <label className="form-label">
                Class (Optional)
              </label>
              {loadingClasses ? (
                <div className="loading-message-small">Loading classes...</div>
              ) : classes.length === 0 ? (
                <div className="form-hint">No classes available. You can add classes in "Manage Schools".</div>
              ) : (
                <select
                  className="form-input form-select"
                  value={classId || ''}
                  onChange={(e) => setClassId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                >
                  <option value="">No class selected (optional)</option>
                  {classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.name} (Enrollment: {classItem.enrollment})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Grade <span className="required">*</span>
            </label>
            <select
              className="form-input form-select"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              required
            >
              <option value="">Select a grade...</option>
              <option value="Primary">Primary</option>
              <option value="JHS">JHS</option>
              <option value="Creche">Creche</option>
              <option value="Other">Other</option>
            </select>
          </div>

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

          <div className="form-group">
            <label className="form-label">
              Note (Optional)
            </label>
            <textarea
              className="form-input form-textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any additional notes..."
              maxLength={500}
              rows={3}
            />
            <div className="form-hint">{note.length}/500 characters</div>
          </div>

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
            disabled={isSubmitting || !teacherId || teacherId === 0}
          >
            {isSubmitting ? 'Sending...' : 'Submit Attendance'}
          </button>
        </form>
      )}
    </div>
  );
}
