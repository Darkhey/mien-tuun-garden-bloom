
import React from "react";
import { Button } from "@/components/ui/button";

interface BlogTopicSuggestionsProps {
  topicInput: string;
  setTopicInput: (v: string) => void;
  isSuggesting: boolean;
  loading: boolean;
  handleSuggestTopics: () => void;
  suggestions: string[];
  selected?: string[];
  onSuggestionClick: (s: string) => void;
}

const BlogTopicSuggestions: React.FC<BlogTopicSuggestionsProps> = ({
  topicInput,
  setTopicInput,
  isSuggesting,
  loading,
  handleSuggestTopics,
  suggestions,
  selected = [],
  onSuggestionClick
}) => (
  <>
    <div className="flex gap-2 mb-2">
      <input
        className="border rounded px-2 py-1 flex-1"
        value={topicInput}
        onChange={e => setTopicInput(e.target.value)}
        placeholder="Schlagwort/Oberthema"
        disabled={isSuggesting || loading}
      />
      <Button
        variant="secondary"
        onClick={handleSuggestTopics}
        disabled={isSuggesting || loading}
      >
        {isSuggesting && <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 rounded-full border-gray-400" />}
        Themenvorschläge
      </Button>
    </div>
    {suggestions.length > 0 && (
      <div className="mb-3">
        <div className="text-xs mb-1 text-sage-700">Vorschläge (bitte wählen):</div>
        <ul className="flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                className={`border px-3 py-1 rounded-full text-sm hover:bg-sage-100 transition
                  ${selected.includes(s) ? "bg-sage-300 text-white font-bold border-sage-400" : "bg-white text-sage-800"}`}
                onClick={() => onSuggestionClick(s)}
                disabled={isSuggesting || loading}
              >
                {selected.includes(s) ? "✓ " : ""}
                {s}
              </button>
            </li>
          ))}
        </ul>
        <div className="text-xs text-sage-600 mt-1">
          Du kannst mehrere Vorschläge antippen und daraus Artikel generieren lassen.
        </div>
      </div>
    )}
  </>
);

export default BlogTopicSuggestions;
