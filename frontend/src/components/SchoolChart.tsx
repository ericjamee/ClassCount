import type { SchoolSummaryDto } from '../types';
import './SchoolChart.css';

interface SchoolChartProps {
  data: SchoolSummaryDto[];
}

/**
 * Lightweight SVG bar chart component showing average attendance by school
 * No external dependencies - pure SVG for maximum performance
 */
export default function SchoolChart({ data }: SchoolChartProps) {
  if (data.length === 0) {
    return <div className="chart-empty">No data available for chart</div>;
  }

  // Chart dimensions (using viewBox units for scalability)
  const width = 100;
  const height = 60;
  const padding = { top: 5, right: 5, bottom: 20, left: 22 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Find max value for scaling
  const maxValue = Math.max(...data.map((d) => d.averageStudents), 0);
  const maxY = maxValue > 0 ? Math.ceil(maxValue * 1.1) : 10; // Add 10% padding at top, minimum 10

  // Bar width calculation
  const barWidth = chartWidth / data.length;
  const barSpacing = barWidth * 0.1; // 10% spacing between bars
  const actualBarWidth = barWidth - barSpacing;

  return (
    <div className="chart-container">
      <h3 className="chart-title">Average Attendance by School</h3>
      <div className="chart-wrapper">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="chart-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Y-axis */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="#d1d5db"
            strokeWidth="0.5"
          />

          {/* X-axis */}
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="#d1d5db"
            strokeWidth="0.5"
          />

          {/* Y-axis labels and grid lines */}
          {[0, maxY / 2, maxY].map((value) => {
            const y = height - padding.bottom - (value / maxY) * chartHeight;
            return (
              <g key={value}>
                {/* Grid line */}
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#f3f4f6"
                  strokeWidth="0.3"
                  strokeDasharray="1,1"
                />
                {/* Tick mark */}
                <line
                  x1={padding.left - 2}
                  y1={y}
                  x2={padding.left}
                  y2={y}
                  stroke="#d1d5db"
                  strokeWidth="0.3"
                />
                {/* Label */}
                <text
                  x={padding.left - 5}
                  y={y + 1}
                  textAnchor="end"
                  fontSize="2.5"
                  fill="#6b7280"
                >
                  {value.toFixed(0)}
                </text>
              </g>
            );
          })}
          
          {/* Y-axis label */}
          <text
            x={padding.left / 2}
            y={height / 2}
            textAnchor="middle"
            fontSize="2.8"
            fill="#6b7280"
            transform={`rotate(-90 ${padding.left / 2} ${height / 2})`}
          >
            Avg Attendance
          </text>

          {/* Bars */}
          {data.map((school, index) => {
            const barHeight = (school.averageStudents / maxY) * chartHeight;
            const x = padding.left + index * barWidth + barSpacing / 2;
            const y = height - padding.bottom - barHeight;

            // Truncate school name for display
            const displayName =
              school.schoolName.length > 12
                ? school.schoolName.substring(0, 10) + '...'
                : school.schoolName;

            return (
              <g key={school.schoolName}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={actualBarWidth}
                  height={barHeight}
                  fill="#2563eb"
                  className="chart-bar"
                />
                {/* School name label (rotated) */}
                <text
                  x={x + actualBarWidth / 2}
                  y={height - padding.bottom + 12}
                  textAnchor="middle"
                  fontSize="2.2"
                  fill="#374151"
                  transform={`rotate(-45 ${x + actualBarWidth / 2} ${height - padding.bottom + 12})`}
                >
                  {displayName}
                </text>
                {/* Value label on top of bar */}
                {barHeight > 3 && (
                  <text
                    x={x + actualBarWidth / 2}
                    y={y - 1}
                    textAnchor="middle"
                    fontSize="2.2"
                    fill="#111827"
                    fontWeight="600"
                  >
                    {school.averageStudents.toFixed(1)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

