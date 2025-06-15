
import React, { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  bucket: "recipe-images" | "blog-images";
  disabled?: boolean;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ value, onChange, bucket, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    setError(null);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`; // flat in bucket

    const { data, error: upErr } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (upErr) {
      setError(upErr.message);
      setUploading(false);
      return;
    }
    // URL holen
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    if (!urlData?.publicUrl) {
      setError("Konnte öffentliche Bild-URL nicht laden.");
      setUploading(false);
      return;
    }
    onChange(urlData.publicUrl);
    setUploading(false);
  }

  return (
    <div className="flex flex-col gap-2">
      {value && (
        <img src={value} alt="Bildvorschau" className="rounded max-w-xs mb-2 max-h-48 object-contain border" />
      )}
      <label className="font-semibold text-sm">Bild hochladen/ersetzen:</label>
      <input
        type="file"
        accept="image/*"
        disabled={disabled || uploading}
        ref={inputRef}
        onChange={handleFileChange}
        className="block"
      />
      {uploading && <div className="text-sage-700 text-xs">Hochladen läuft...</div>}
      {error && <div className="text-red-600 text-xs">{error}</div>}
    </div>
  );
};

export default ImageUploadField;
