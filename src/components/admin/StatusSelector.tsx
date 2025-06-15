
import React from "react";

interface StatusSelectorProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const STATUSES = [
  { value: "entwurf", label: "Entwurf" },
  { value: "veröffentlicht", label: "Veröffentlicht" },
  { value: "archiviert", label: "Archiviert" },
];

const StatusSelector: React.FC<StatusSelectorProps> = ({ value, onChange, disabled }) => (
  <div className="flex items-center gap-2">
    <label className="text-sm font-semibold">Status:</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className="border rounded px-3 py-1"
    >
      {STATUSES.map(s => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  </div>
);

export default StatusSelector;
