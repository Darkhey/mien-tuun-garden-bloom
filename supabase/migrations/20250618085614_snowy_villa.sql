-- Create the recipe-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recipe-images',
  'recipe-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Enable RLS on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy: Allow public read access to images
CREATE POLICY "Allow public read access to images" 
ON storage.objects 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- Policy: Allow authenticated users to update their own objects
CREATE POLICY "Allow users to update their own objects"
ON storage.objects
FOR UPDATE
TO authenticated
USING (auth.uid() = owner)
WITH CHECK (auth.uid() = owner);

-- Policy: Allow authenticated users to delete their own objects
CREATE POLICY "Allow users to delete their own objects"
ON storage.objects
FOR DELETE
TO authenticated
USING (auth.uid() = owner);