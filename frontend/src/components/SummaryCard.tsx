import './SummaryCard.css';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

/**
 * Reusable summary card component for displaying statistics
 */
export default function SummaryCard({ title, value, subtitle }: SummaryCardProps) {
  return (
    <div className="summary-card">
      <h3 className="summary-card-title">{title}</h3>
      <div className="summary-card-value">{value}</div>
      {subtitle && <div className="summary-card-subtitle">{subtitle}</div>}
    </div>
  );
}

