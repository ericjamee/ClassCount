import { useState, useEffect } from 'react';
import { getStatsSummary } from '../api/attendanceApi';
import type { StatsSummaryDto } from '../types';
import SummaryCard from '../components/SummaryCard';
import SchoolChart from '../components/SchoolChart';
import './AdminDashboard.css';

/**
 * Admin dashboard page for viewing attendance statistics
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [schoolNameFilter, setSchoolNameFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  // Load stats on mount and when filters change
  const loadStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getStatsSummary({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setStats(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load statistics. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []); // Only load on mount

  const handleApplyFilters = () => {
    loadStats();
  };

  // Filter school summaries by school name
  const filteredSchoolSummaries = stats?.schoolSummaries.filter((school) =>
    school.schoolName.toLowerCase().includes(schoolNameFilter.toLowerCase())
  ) || [];

  // Filter region summaries by region name
  const filteredRegionSummaries = stats?.regionSummaries.filter((region) =>
    region.region.toLowerCase().includes(regionFilter.toLowerCase())
  ) || [];

  return (
    <div className="admin-dashboard">
      <h2 className="page-title">Attendance Dashboard</h2>
      <p className="page-description">
        View attendance statistics and summaries by school and region.
      </p>

      {/* Filters */}
      <div className="filters-section">
        <h3 className="section-title">Filters</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Start Date</label>
            <input
              type="date"
              className="filter-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">End Date</label>
            <input
              type="date"
              className="filter-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">School Name</label>
            <input
              type="text"
              className="filter-input"
              value={schoolNameFilter}
              onChange={(e) => setSchoolNameFilter(e.target.value)}
              placeholder="Filter by school..."
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Region</label>
            <input
              type="text"
              className="filter-input"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              placeholder="Filter by region..."
            />
          </div>
        </div>
        <button onClick={handleApplyFilters} className="apply-button">
          Apply Filters
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="loading-message">Loading statistics...</div>
      )}

      {/* Error state */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={loadStats} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {/* Summary Cards */}
      {stats && !loading && (
        <>
          <div className="summary-cards">
            <SummaryCard
              title="Total Submissions"
              value={stats.totalSubmissions}
            />
            <SummaryCard
              title="Total Students"
              value={stats.totalStudents.toLocaleString()}
            />
            <SummaryCard
              title="Average per Submission"
              value={stats.averageStudentsPerRecord.toFixed(1)}
            />
          </div>

          {/* School Chart */}
          {filteredSchoolSummaries.length > 0 && (
            <SchoolChart data={filteredSchoolSummaries} />
          )}

          {/* School Summaries Table */}
          <div className="table-section">
            <h3 className="section-title">By School</h3>
            {filteredSchoolSummaries.length > 0 ? (
              <div className="table-container">
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>School</th>
                      <th>Submissions</th>
                      <th>Total Students</th>
                      <th>Avg Students</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchoolSummaries.map((school) => (
                      <tr key={school.schoolName}>
                        <td>{school.schoolName}</td>
                        <td>{school.submissionsCount}</td>
                        <td>{school.totalStudents}</td>
                        <td>{school.averageStudents.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No school data available</p>
            )}
          </div>

          {/* Region Summaries Table */}
          {stats.regionSummaries.length > 0 && (
            <div className="table-section">
              <h3 className="section-title">By Region</h3>
              {filteredRegionSummaries.length > 0 ? (
                <div className="table-container">
                  <table className="stats-table">
                    <thead>
                      <tr>
                        <th>Region</th>
                        <th>Submissions</th>
                        <th>Total Students</th>
                        <th>Avg Students</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegionSummaries.map((region) => (
                        <tr key={region.region}>
                          <td>{region.region}</td>
                          <td>{region.submissionsCount}</td>
                          <td>{region.totalStudents}</td>
                          <td>{region.averageStudents.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-data">No region data matches the filter</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

