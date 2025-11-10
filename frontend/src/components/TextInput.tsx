import './TextInput.css';

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
}

/**
 * Reusable text input component
 */
export default function TextInput({
  label,
  value,
  onChange,
  required = false,
  placeholder,
  maxLength,
}: TextInputProps) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        type="text"
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    </div>
  );
}

