
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Textarea } from '@/components/ui/textarea';

interface EditableBlogPreviewProps {
  content: string;
  onContentChange: (content: string) => void;
  title: string;
}

const EditableBlogPreview: React.FC<EditableBlogPreviewProps> = ({
  content,
  onContentChange,
  title
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [tempContent, setTempContent] = useState(content);

  useEffect(() => {
    setTempContent(content);
  }, [content]);

  const sections = content.split('\n\n').filter(section => section.trim() !== '');

  const handleSectionEdit = (index: number, newContent: string) => {
    const newSections = [...sections];
    newSections[index] = newContent;
    const updatedContent = newSections.join('\n\n');
    onContentChange(updatedContent);
    setEditingSection(null);
  };

  const renderEditableSection = (section: string, index: number) => {
    const isCurrentlyEditing = editingSection === `section-${index}`;

    if (isCurrentlyEditing) {
      return (
        <div key={index} className="border rounded-lg p-4 bg-gray-50 mb-4">
          <Textarea
            value={section}
            onChange={(e) => {
              const newSections = [...sections];
              newSections[index] = e.target.value;
              setTempContent(newSections.join('\n\n'));
            }}
            className="min-h-[100px] mb-2"
            placeholder="Bearbeiten Sie diesen Abschnitt..."
          />
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => handleSectionEdit(index, sections[index])}
            >
              Speichern
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setEditingSection(null)}
            >
              Abbrechen
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div 
        key={index}
        className="group relative border border-transparent hover:border-gray-200 rounded-lg p-2 mb-4 cursor-pointer transition-colors"
        onClick={() => setEditingSection(`section-${index}`)}
      >
        <div className="prose max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-earth-800 mb-4" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl font-bold text-earth-800 mb-3" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg font-bold text-earth-800 mb-2" {...props} />,
              p: ({node, ...props}) => <p className="text-earth-600 mb-3 leading-relaxed" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 text-earth-600" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 text-earth-600" {...props} />,
              li: ({node, ...props}) => <li className="mb-1" {...props} />,
            }}
          >
            {section}
          </ReactMarkdown>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setEditingSection(`section-${index}`);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Blog-Inhalt bearbeiten</CardTitle>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Vorschau
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={tempContent}
            onChange={(e) => {
              setTempContent(e.target.value);
              onContentChange(e.target.value);
            }}
            rows={20}
            className="font-mono text-sm"
            placeholder="Markdown-Inhalt hier bearbeiten..."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Blog-Vorschau - {title}</CardTitle>
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Markdown bearbeiten
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-gray-600 mb-4">
            Klicken Sie auf einen Abschnitt, um ihn direkt zu bearbeiten, oder verwenden Sie den "Markdown bearbeiten" Button für den vollständigen Editor.
          </p>
          {sections.map((section, index) => renderEditableSection(section, index))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EditableBlogPreview;
