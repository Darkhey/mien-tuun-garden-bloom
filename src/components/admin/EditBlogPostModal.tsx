
import React, { useState } from "react";
import StatusSelector from "./StatusSelector";
import ImageUploadField from "./ImageUploadField";
import VersionHistory from "./VersionHistory";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditBlogPostModalProps {
  post: any;
  onClose: () => void;
  onSaved: () => void;
}

const EditBlogPostModal: React.FC<EditBlogPostModalProps> = ({ post, onClose, onSaved }) => {
  const [form, setForm] = useState({ ...post });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  function handleChange(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function saveVersionAndUpdatePost() {
    setSaving(true);
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      toast({ title: "Nicht eingeloggt", description: "Melde dich neu an." });
      setSaving(false);
      return;
    }
    const versionInsert = {
      blog_post_id: post.id,
      user_id: user.data.user.id,
      ...post // alte Werte als Version sichern
    };
    await supabase.from("blog_post_versions").insert([versionInsert]);
    const { error } = await supabase.from("blog_posts").update(form).eq("id", post.id);
    if (error) {
      toast({ title: "Fehler beim Speichern", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Gespeichert!", description: "Artikel wurde erfolgreich aktualisiert." });
      onSaved();
      onClose();
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1001]">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-4 text-xl">&times;</button>
        <h2 className="font-bold text-xl mb-2">Blogartikel bearbeiten</h2>
        <div className="mb-2">
          <label className="block text-sm font-semibold">Titel:</label>
          <input
            className="border rounded px-2 py-1 w-full"
            value={form.title}
            onChange={e => handleChange("title", e.target.value)}
            disabled={saving}
          />
        </div>
        <div className="mb-2">
          <ImageUploadField
            value={form.featured_image}
            onChange={url => handleChange("featured_image", url)}
            bucket="blog-images"
            disabled={saving}
          />
        </div>
        <div className="mb-2">
          <StatusSelector
            value={form.status}
            onChange={val => handleChange("status", val)}
            disabled={saving}
          />
        </div>
        {/* Zusatzfelder wie excerpt, content, etc. können einfach ergänzt werden */}
        <div className="flex gap-2 mt-4">
          <button className="bg-sage-700 text-white px-4 py-2 rounded" disabled={saving} onClick={saveVersionAndUpdatePost}>
            {saving ? "Speichere..." : "Speichern & Version sichern"}
          </button>
          <button className="bg-sage-100 px-4 py-2 rounded" onClick={onClose} disabled={saving}>Abbrechen</button>
        </div>
        <VersionHistory type="blog" itemId={post.id} />
      </div>
    </div>
  );
};

export default EditBlogPostModal;
