import { useState, useEffect } from 'react';
import React from 'react';
import { getSchools, createSchool, updateSchool, deleteSchool } from '../api/schoolApi';
import { getTeachersBySchool, createTeacher, updateTeacher, deleteTeacher } from '../api/teacherApi';
import { getClassesByTeacher, createClass, updateClass, deleteClass } from '../api/classApi';
import type { SchoolDto, TeacherDto, ClassDto } from '../types';
import TextInput from '../components/TextInput';
import NumberInput from '../components/NumberInput';
import './SchoolsPage.css';

/**
 * Admin page for managing schools with CRUD operations and teacher management
 */
export default function SchoolsPage() {
  const [schools, setSchools] = useState<SchoolDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [schoolName, setSchoolName] = useState('');
  const [region, setRegion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editRegion, setEditRegion] = useState('');

  // Teacher management state
  const [expandedSchoolId, setExpandedSchoolId] = useState<number | null>(null);
  const [teachers, setTeachers] = useState<Record<number, TeacherDto[]>>({});
  const [loadingTeachers, setLoadingTeachers] = useState<Record<number, boolean>>({});
  const [newTeacherName, setNewTeacherName] = useState<Record<number, string>>({});
  const [editingTeacherId, setEditingTeacherId] = useState<number | null>(null);
  const [editTeacherName, setEditTeacherName] = useState('');

  // Class management state
  const [expandedTeacherId, setExpandedTeacherId] = useState<number | null>(null);
  const [classes, setClasses] = useState<Record<number, ClassDto[]>>({});
  const [loadingClasses, setLoadingClasses] = useState<Record<number, boolean>>({});
  const [newClassName, setNewClassName] = useState<Record<number, string>>({});
  const [newClassEnrollment, setNewClassEnrollment] = useState<Record<number, number>>({});
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [editClassName, setEditClassName] = useState('');
  const [editClassEnrollment, setEditClassEnrollment] = useState(0);

  // Load schools on mount
  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getSchools();
      setSchools(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load schools. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async (schoolId: number) => {
    setLoadingTeachers(prev => ({ ...prev, [schoolId]: true }));
    try {
      const data = await getTeachersBySchool(schoolId);
      setTeachers(prev => ({ ...prev, [schoolId]: data }));
    } catch (err) {
      console.error('Failed to load teachers:', err);
    } finally {
      setLoadingTeachers(prev => ({ ...prev, [schoolId]: false }));
    }
  };

  const handleToggleSchool = (schoolId: number) => {
    if (expandedSchoolId === schoolId) {
      setExpandedSchoolId(null);
    } else {
      setExpandedSchoolId(schoolId);
      if (!teachers[schoolId]) {
        loadTeachers(schoolId);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!schoolName.trim()) {
      setSubmitError('School name is required');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSuccessMessage('');

    try {
      await createSchool({
        name: schoolName.trim(),
        region: region.trim() || undefined,
      });

      // Clear form
      setSchoolName('');
      setRegion('');
      setSuccessMessage('School added successfully!');

      // Reload schools
      await loadSchools();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Failed to add school. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (school: SchoolDto) => {
    setEditingId(school.id);
    setEditName(school.name);
    setEditRegion(school.region || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditRegion('');
  };

  const handleSaveEdit = async (id: number) => {
    if (!editName.trim()) {
      alert('School name is required');
      return;
    }

    try {
      await updateSchool(id, {
        name: editName.trim(),
        region: editRegion.trim() || undefined,
      });

      setEditingId(null);
      setEditName('');
      setEditRegion('');
      setSuccessMessage('School updated successfully!');
      await loadSchools();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to update school. Please try again.'
      );
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteSchool(id);
      setSuccessMessage('School deleted successfully!');
      await loadSchools();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to delete school. Please try again.'
      );
    }
  };

  const handleAddTeacher = async (schoolId: number) => {
    const name = newTeacherName[schoolId]?.trim();
    if (!name) {
      alert('Teacher name is required');
      return;
    }

    try {
      await createTeacher({ name, schoolId });
      setNewTeacherName(prev => ({ ...prev, [schoolId]: '' }));
      await loadTeachers(schoolId);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to add teacher. Please try again.'
      );
    }
  };

  const handleEditTeacher = (teacher: TeacherDto) => {
    setEditingTeacherId(teacher.id);
    setEditTeacherName(teacher.name);
  };

  const handleSaveTeacher = async (teacherId: number, schoolId: number) => {
    if (!editTeacherName.trim()) {
      alert('Teacher name is required');
      return;
    }

    try {
      await updateTeacher(teacherId, {
        name: editTeacherName.trim(),
        schoolId,
      });
      setEditingTeacherId(null);
      setEditTeacherName('');
      await loadTeachers(schoolId);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to update teacher. Please try again.'
      );
    }
  };

  const handleDeleteTeacher = async (teacherId: number, schoolId: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await deleteTeacher(teacherId);
      await loadTeachers(schoolId);
      // Clean up classes state for this teacher
      setClasses(prev => {
        const updated = { ...prev };
        delete updated[teacherId];
        return updated;
      });
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to delete teacher. Please try again.'
      );
    }
  };

  // Class management functions
  const loadClasses = async (teacherId: number) => {
    setLoadingClasses(prev => ({ ...prev, [teacherId]: true }));
    try {
      const data = await getClassesByTeacher(teacherId);
      setClasses(prev => ({ ...prev, [teacherId]: data }));
    } catch (err) {
      console.error('Failed to load classes:', err);
    } finally {
      setLoadingClasses(prev => ({ ...prev, [teacherId]: false }));
    }
  };

  const handleToggleTeacher = (teacherId: number) => {
    if (expandedTeacherId === teacherId) {
      setExpandedTeacherId(null);
    } else {
      setExpandedTeacherId(teacherId);
      if (!classes[teacherId]) {
        loadClasses(teacherId);
      }
    }
  };

  const handleAddClass = async (teacherId: number) => {
    const className = newClassName[teacherId]?.trim();
    const enrollment = newClassEnrollment[teacherId] || 0;

    if (!className) {
      alert('Class name is required');
      return;
    }

    if (enrollment < 0) {
      alert('Enrollment must be 0 or greater');
      return;
    }

    try {
      await createClass({
        name: className,
        enrollment,
        teacherId,
      });
      setNewClassName(prev => ({ ...prev, [teacherId]: '' }));
      setNewClassEnrollment(prev => ({ ...prev, [teacherId]: 0 }));
      await loadClasses(teacherId);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to add class. Please try again.'
      );
    }
  };

  const handleEditClass = (classItem: ClassDto) => {
    setEditingClassId(classItem.id);
    setEditClassName(classItem.name);
    setEditClassEnrollment(classItem.enrollment);
  };

  const handleSaveClass = async (classId: number, teacherId: number) => {
    if (!editClassName.trim()) {
      alert('Class name is required');
      return;
    }

    if (editClassEnrollment < 0) {
      alert('Enrollment must be 0 or greater');
      return;
    }

    try {
      await updateClass(classId, {
        name: editClassName.trim(),
        enrollment: editClassEnrollment,
        teacherId,
      });
      setEditingClassId(null);
      setEditClassName('');
      setEditClassEnrollment(0);
      await loadClasses(teacherId);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to update class. Please try again.'
      );
    }
  };

  const handleDeleteClass = async (classId: number, teacherId: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await deleteClass(classId);
      await loadClasses(teacherId);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to delete class. Please try again.'
      );
    }
  };

  return (
    <div className="schools-page">
      <h2 className="page-title">Manage Schools</h2>
      <p className="page-description">
        Add, edit, or delete schools and manage teachers for each school.
      </p>

      {successMessage && (
        <div className="message message-success">{successMessage}</div>
      )}

      {/* Add School Form */}
      <div className="add-school-section">
        <h3 className="section-title">Add New School</h3>
        <form onSubmit={handleSubmit} className="school-form">
          <TextInput
            label="School Name"
            value={schoolName}
            onChange={setSchoolName}
            required
            placeholder="Enter school name"
            maxLength={200}
          />

          <TextInput
            label="Region / Community"
            value={region}
            onChange={setRegion}
            placeholder="Optional"
            maxLength={100}
          />

          {submitError && (
            <div className="message message-error">{submitError}</div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add School'}
          </button>
        </form>
      </div>

      {/* Schools List */}
      <div className="schools-list-section">
        <h3 className="section-title">Existing Schools ({schools.length})</h3>

        {loading && <div className="loading-message">Loading schools...</div>}

        {error && (
          <div className="error-message">
            {error}
            <button onClick={loadSchools} className="retry-button">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {schools.length === 0 ? (
              <p className="no-data">No schools added yet. Add your first school above.</p>
            ) : (
              <div className="schools-list">
                {schools.map((school) => (
                  <div key={school.id} className="school-card">
                    <div className="school-card-header">
                      {editingId === school.id ? (
                        <div className="school-edit-form">
                          <input
                            type="text"
                            className="edit-input"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            required
                          />
                          <input
                            type="text"
                            className="edit-input"
                            value={editRegion}
                            onChange={(e) => setEditRegion(e.target.value)}
                            placeholder="Region (optional)"
                          />
                          <div className="action-buttons">
                            <button
                              onClick={() => handleSaveEdit(school.id)}
                              className="action-button action-button-save"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="action-button action-button-cancel"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="school-info">
                            <h4 className="school-name">{school.name}</h4>
                            {school.region && <span className="school-region">{school.region}</span>}
                          </div>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEdit(school)}
                              className="action-button action-button-edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(school.id, school.name)}
                              className="action-button action-button-delete"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => handleToggleSchool(school.id)}
                              className="action-button action-button-teachers"
                            >
                              {expandedSchoolId === school.id ? '▼' : '▶'} Teachers
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {expandedSchoolId === school.id && (
                      <div className="teachers-section">
                        <h5 className="teachers-title">Teachers</h5>
                        
                        {loadingTeachers[school.id] ? (
                          <div className="loading-message-small">Loading teachers...</div>
                        ) : (
                          <>
                            {/* Add Teacher Form */}
                            <div className="add-teacher-form">
                              <input
                                type="text"
                                className="teacher-input"
                                value={newTeacherName[school.id] || ''}
                                onChange={(e) => setNewTeacherName(prev => ({ ...prev, [school.id]: e.target.value }))}
                                placeholder="Teacher name"
                                maxLength={200}
                              />
                              <button
                                type="button"
                                onClick={() => handleAddTeacher(school.id)}
                                className="action-button action-button-save"
                              >
                                Add Teacher
                              </button>
                            </div>

                            {/* Teachers List */}
                            {teachers[school.id] && teachers[school.id].length > 0 ? (
                              <ul className="teachers-list">
                                {teachers[school.id].map((teacher) => (
                                  <React.Fragment key={teacher.id}>
                                    <li className="teacher-item">
                                      {editingTeacherId === teacher.id ? (
                                        <div className="teacher-edit-form">
                                          <input
                                            type="text"
                                            className="teacher-input"
                                            value={editTeacherName}
                                            onChange={(e) => setEditTeacherName(e.target.value)}
                                            required
                                          />
                                          <div className="action-buttons">
                                            <button
                                              onClick={() => handleSaveTeacher(teacher.id, school.id)}
                                              className="action-button action-button-save"
                                            >
                                              Save
                                            </button>
                                            <button
                                              onClick={() => {
                                                setEditingTeacherId(null);
                                                setEditTeacherName('');
                                              }}
                                              className="action-button action-button-cancel"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="teacher-info">
                                            <span className="teacher-name">{teacher.name}</span>
                                            <button
                                              onClick={() => handleToggleTeacher(teacher.id)}
                                              className="action-button action-button-classes"
                                            >
                                              {expandedTeacherId === teacher.id ? '▼' : '▶'} Classes
                                            </button>
                                          </div>
                                          <div className="action-buttons">
                                            <button
                                              onClick={() => handleEditTeacher(teacher)}
                                              className="action-button action-button-edit"
                                            >
                                              Edit
                                            </button>
                                            <button
                                              onClick={() => handleDeleteTeacher(teacher.id, school.id, teacher.name)}
                                              className="action-button action-button-delete"
                                            >
                                              Delete
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </li>
                                    {expandedTeacherId === teacher.id && (
                                      <li className="classes-section-item">
                                        <div className="classes-section">
                                          <h6 className="classes-title">Classes for {teacher.name}</h6>
                                          
                                          {loadingClasses[teacher.id] ? (
                                            <div className="loading-message-small">Loading classes...</div>
                                          ) : (
                                            <>
                                              {/* Add Class Form */}
                                              <div className="add-class-form">
                                                <input
                                                  type="text"
                                                  className="class-input"
                                                  value={newClassName[teacher.id] || ''}
                                                  onChange={(e) => setNewClassName(prev => ({ ...prev, [teacher.id]: e.target.value }))}
                                                  placeholder="Class name"
                                                  maxLength={200}
                                                />
                                                <input
                                                  type="number"
                                                  className="class-input class-input-number"
                                                  value={newClassEnrollment[teacher.id] || 0}
                                                  onChange={(e) => setNewClassEnrollment(prev => ({ ...prev, [teacher.id]: parseInt(e.target.value, 10) || 0 }))}
                                                  placeholder="Enrollment"
                                                  min="0"
                                                  max="500"
                                                />
                                                <button
                                                  type="button"
                                                  onClick={() => handleAddClass(teacher.id)}
                                                  className="action-button action-button-save"
                                                >
                                                  Add Class
                                                </button>
                                              </div>

                                              {/* Classes List */}
                                              {classes[teacher.id] && classes[teacher.id].length > 0 ? (
                                                <ul className="classes-list">
                                                  {classes[teacher.id].map((classItem) => (
                                                    <li key={classItem.id} className="class-item">
                                                      {editingClassId === classItem.id ? (
                                                        <div className="class-edit-form">
                                                          <input
                                                            type="text"
                                                            className="class-input"
                                                            value={editClassName}
                                                            onChange={(e) => setEditClassName(e.target.value)}
                                                            required
                                                          />
                                                          <input
                                                            type="number"
                                                            className="class-input class-input-number"
                                                            value={editClassEnrollment}
                                                            onChange={(e) => setEditClassEnrollment(parseInt(e.target.value, 10) || 0)}
                                                            min="0"
                                                            max="500"
                                                          />
                                                          <div className="action-buttons">
                                                            <button
                                                              onClick={() => handleSaveClass(classItem.id, teacher.id)}
                                                              className="action-button action-button-save"
                                                            >
                                                              Save
                                                            </button>
                                                            <button
                                                              onClick={() => {
                                                                setEditingClassId(null);
                                                                setEditClassName('');
                                                                setEditClassEnrollment(0);
                                                              }}
                                                              className="action-button action-button-cancel"
                                                            >
                                                              Cancel
                                                            </button>
                                                          </div>
                                                        </div>
                                                      ) : (
                                                        <>
                                                          <span className="class-name">{classItem.name}</span>
                                                          <span className="class-enrollment">Enrollment: {classItem.enrollment}</span>
                                                          <div className="action-buttons">
                                                            <button
                                                              onClick={() => handleEditClass(classItem)}
                                                              className="action-button action-button-edit"
                                                            >
                                                              Edit
                                                            </button>
                                                            <button
                                                              onClick={() => handleDeleteClass(classItem.id, teacher.id, classItem.name)}
                                                              className="action-button action-button-delete"
                                                            >
                                                              Delete
                                                            </button>
                                                          </div>
                                                        </>
                                                      )}
                                                    </li>
                                                  ))}
                                                </ul>
                                              ) : (
                                                <p className="no-classes">No classes added yet. Add a class above.</p>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      </li>
                                    )}
                                  </React.Fragment>
                                ))}
                              </ul>
                            ) : (
                              <p className="no-teachers">No teachers added yet. Add a teacher above.</p>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
