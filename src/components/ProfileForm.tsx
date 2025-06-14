
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface ProfileFormProps {
  profile: {
    id: string;
    display_name: string;
    avatar_url?: string | null;
    is_premium?: boolean;
    custom_role?: string | null;
  };
  onUpdate: (profile: any) => void;
}

// Hilfsfunktion: Prüfe Admin-Status (für Badge)
async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .single();
  return !!data;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onUpdate }) => {
  const [form, setForm] = useState({
    display_name: profile.display_name ?? "",
    avatar_url: profile.avatar_url ?? "",
    is_premium: profile.is_premium ?? false,
    custom_role: profile.custom_role ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    // Prüfe, ob aktueller User Admin ist
    isAdmin(profile.id).then(setAdmin);
  }, [profile.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);

    // Validierung
    if (!form.display_name || form.display_name.trim().length < 2) {
      toast.error("Bitte gib einen Namen mit mindestens 2 Zeichen ein.");
      return;
    }

    setLoading(true);
    const { error, data } = await supabase
      .from("profiles")
      .update({
        display_name: form.display_name,
        avatar_url: form.avatar_url || null,
        is_premium: form.is_premium,
        custom_role: form.custom_role || null,
      })
      .eq("id", profile.id)
      .select()
      .maybeSingle();
    setLoading(false);

    if (error) {
      toast.error("Fehler beim Speichern: " + error.message);
    } else {
      toast.success("Profil erfolgreich aktualisiert!");
      onUpdate({ ...profile, ...form });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div>
        <div className="flex items-center mb-2 gap-2">
          <Label htmlFor="display_name">Dein Name</Label>
          {admin && (
            <span className="inline-block bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-xs ml-2 font-semibold">Admin</span>
          )}
        </div>
        <Input
          name="display_name"
          id="display_name"
          maxLength={60}
          value={form.display_name}
          onChange={handleChange}
          required
          className={showValidation && (!form.display_name || form.display_name.trim().length < 2) ? "border-red-500" : ""}
        />
        {showValidation && (!form.display_name || form.display_name.trim().length < 2) && (
          <div className="text-red-600 text-xs mt-1">Name muss mindestens 2 Zeichen lang sein.</div>
        )}
      </div>
      <div>
        <Label htmlFor="avatar_url">Avatar Bild-URL</Label>
        <Input
          name="avatar_url"
          id="avatar_url"
          placeholder="https://..."
          value={form.avatar_url}
          onChange={handleChange}
        />
        {form.avatar_url && form.avatar_url.startsWith("http") && (
          <img
            src={form.avatar_url}
            alt="Avatar-Vorschau"
            className="h-16 w-16 object-cover mt-2 rounded-full border border-sage-200"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
        )}
        {/* Später: Direktes Hochladen als Feature */}
      </div>
      <div>
        <Label htmlFor="custom_role">Deine selbstgewählte Rolle</Label>
        <Input
          name="custom_role"
          id="custom_role"
          placeholder='Z.B. "Gemüselover", "Kleingärtner" ...'
          value={form.custom_role}
          onChange={handleChange}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          name="is_premium"
          id="is_premium"
          checked={form.is_premium}
          onCheckedChange={(checked) => setForm((f) => ({ ...f, is_premium: checked }))}
        />
        <Label htmlFor="is_premium">Premium-Mitglied</Label>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Speichert..." : "Speichern"}
      </Button>
    </form>
  );
};

export default ProfileForm;
