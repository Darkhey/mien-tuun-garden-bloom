
import React from "react";
interface TagSelectorProps {
  options: string[];
  selected: string[];
  setSelected: (tags: string[]) => void;
  disabled?: boolean;
}

const TagSelector: React.FC<TagSelectorProps> = ({ options, selected, setSelected, disabled }) => {
  function toggleTag(tag: string) {
    setSelected(
      selected.includes(tag)
        ? selected.filter(t => t !== tag)
        : [...selected, tag]
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(tag => (
        <button
          type="button"
          key={tag}
          className={`px-2 py-1 rounded border text-xs ${selected.includes(tag) ? "bg-sage-600 text-white" : "bg-sage-50"} ${disabled && "opacity-40 pointer-events-none"}`}
          onClick={() => toggleTag(tag)}
          disabled={disabled}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};
export default TagSelector;
