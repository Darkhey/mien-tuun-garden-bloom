
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface BlogPromptEditorProps {
  input: string;
  setInput: (v: string) => void;
  prompt: string;
  setPrompt: (v: string) => void;
  handleImprovePrompt: () => void;
  isPromptImproved: boolean;
  loading: boolean;
  isSuggesting: boolean;
}

const BlogPromptEditor: React.FC<BlogPromptEditorProps> = ({
  input, setInput,
  prompt, setPrompt,
  handleImprovePrompt,
  isPromptImproved,
  loading,
  isSuggesting
}) => (
  <div>
    <Textarea
      className="mb-2"
      rows={2}
      placeholder="Blogthema oder ausführlicher KI-Prompt (z.B. 'So wird dein Hochbeet im Sommer grün')"
      value={input}
      onChange={e => { setInput(e.target.value); setPrompt(""); }}
      disabled={loading || isSuggesting}
    />
    <Button
      onClick={handleImprovePrompt}
      className="mb-2"
      disabled={!input || loading || isSuggesting || isPromptImproved}
      variant="secondary"
    >
      {loading && !isPromptImproved && <span className="w-4 h-4 animate-spin mr-2 inline-block border-2 border-gray-400 rounded-full" />}
      Prompt von KI optimieren
    </Button>

    {prompt && (
      <div className="mb-2">
        <div className="text-xs text-sage-700 mb-1">Verbesserter Prompt:</div>
        <Textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={3}
          className="mb-2"
          disabled={loading}
        />
      </div>
    )}
  </div>
);

export default BlogPromptEditor;
