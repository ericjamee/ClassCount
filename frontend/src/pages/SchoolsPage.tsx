import { useState, useEffect } from 'react';
import { getSchools, createSchool } from '../api/schoolApi';
import type { SchoolDto } from '../types';
import TextInput from '../components/TextInput';
import './SchoolsPage.css';

/**
 * Admin page for managing schools
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

  return (
    <div className="schools-page">
      <h2 className="page-title">Manage Schools</h2>
      <p className="page-description">
        Add schools that teachers can select when recording attendance. This ensures consistent school names.
      </p>

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

          {successMessage && (
            <div className="message message-success">{successMessage}</div>
          )}

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
                    </tr>
                  </thead>
                  <tbody>
                    {schools.map((school) => (
                      <tr key={school.id}>
                        <td>{school.name}</td>
                        <td>{school.region || '-'}</td>
                        <td>
                          {new Date(school.createdAt).toLocaleDateString()}
                        </td>
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

