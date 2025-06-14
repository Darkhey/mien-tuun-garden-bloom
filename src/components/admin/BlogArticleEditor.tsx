
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface BlogArticleEditorProps {
  generated: string | null;
  editing: string;
  setEditing: (v: string) => void;
  loading: boolean;
  handleGenerate: () => void;
  handleSave: () => void;
  canGenerate: boolean;
}

const BlogArticleEditor: React.FC<BlogArticleEditorProps> = ({
  generated,
  editing,
  setEditing,
  loading,
  handleGenerate,
  handleSave,
  canGenerate
}) => (
  <>
    <Button
      onClick={handleGenerate}
      className="mb-2"
      disabled={loading || !canGenerate}
    >
      {loading && !generated && <span className="w-4 h-4 animate-spin mr-2 inline-block border-2 border-gray-400 rounded-full" />}
      KI-Artikel generieren
    </Button>
    {generated && (
      <div className="mt-4 border-t pt-4">
        <div className="text-xs text-sage-700 mb-1">Artikel-Entwurf (anpassbar, Markdown möglich):</div>
        <Textarea
          className="mb-2"
          rows={12}
          value={editing}
          onChange={e => setEditing(e.target.value)}
          disabled={loading}
        />
        <Button
          className="mt-2"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? <span className="w-4 h-4 animate-spin mr-2 inline-block border-2 border-gray-400 rounded-full" /> : null}
          Bestätigen & speichern
        </Button>
      </div>
    )}
  </>
);

export default BlogArticleEditor;
