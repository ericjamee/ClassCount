import './NumberInput.css';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
  min?: number;
  max?: number;
}

/**
 * Reusable number input component
 */
export default function NumberInput({
  label,
  value,
  onChange,
  required = false,
  min,
  max,
}: NumberInputProps) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        type="number"
        className="form-input"
        value={value || ''}
        onChange={(e) => {
          const numValue = parseInt(e.target.value, 10);
          if (!isNaN(numValue)) {
            onChange(numValue);
          } else if (e.target.value === '') {
            onChange(0);
          }
        }}
        required={required}
        min={min}
        max={max}
      />
    </div>
  );
}

