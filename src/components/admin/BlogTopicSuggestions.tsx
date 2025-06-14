
import React from "react";
import { Button } from "@/components/ui/button";

interface BlogTopicSuggestionsProps {
  topicInput: string;
  setTopicInput: (v: string) => void;
  isSuggesting: boolean;
  loading: boolean;
  handleSuggestTopics: () => void;
  suggestions: string[];
  onSuggestionClick: (s: string) => void;
}

const BlogTopicSuggestions: React.FC<BlogTopicSuggestionsProps> = ({
  topicInput,
  setTopicInput,
  isSuggesting,
  loading,
  handleSuggestTopics,
  suggestions,
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
        <div className="text-xs mb-1 text-sage-700">Vorschläge:</div>
        <ul className="flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <li key={i}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSuggestionClick(s)}
              >
                {s}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    )}
  </>
);

export default BlogTopicSuggestions;
