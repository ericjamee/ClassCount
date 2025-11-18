import { useState, useEffect } from 'react';
import { getSchools, createSchool, updateSchool, deleteSchool } from '../api/schoolApi';
import type { SchoolDto } from '../types';
import TextInput from '../components/TextInput';
import './SchoolsPage.css';

/**
 * Admin page for managing schools with CRUD operations
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

  return (
    <div className="schools-page">
      <h2 className="page-title">Manage Schools</h2>
      <p className="page-description">
        Add, edit, or delete schools that teachers can select when recording attendance. This ensures consistent school names.
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
              <div className="schools-table-container">
                <table className="schools-table">
                  <thead>
                    <tr>
                      <th>School Name</th>
                      <th>Region</th>
                      <th>Added</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schools.map((school) => (
                      <tr key={school.id}>
                        {editingId === school.id ? (
                          <>
                            <td>
                              <input
                                type="text"
                                className="edit-input"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="edit-input"
                                value={editRegion}
                                onChange={(e) => setEditRegion(e.target.value)}
                              />
                            </td>
                            <td>
                              {new Date(school.createdAt).toLocaleDateString()}
                            </td>
                            <td>
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
                            </td>
                          </>
                        ) : (
                          <>
                            <td>{school.name}</td>
                            <td>{school.region || '-'}</td>
                            <td>
                              {new Date(school.createdAt).toLocaleDateString()}
                            </td>
                            <td>
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
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
