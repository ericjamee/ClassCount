import './DateInput.css';

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

/**
 * Reusable date input component
 */
export default function DateInput({
  label,
  value,
  onChange,
  required = false,
}: DateInputProps) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        type="date"
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}

