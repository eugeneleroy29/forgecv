
-- Allow public read access to profile photos (bucket is already public,

-- but this policy is required for the storage.objects table itself)

CREATE POLICY "Public read access for profile photos"

ON storage.objects FOR SELECT

USING (bucket_id = 'profile-photos');

-- Allow authenticated users to upload only into a folder matching their own user id

CREATE POLICY "Users can upload their own profile photo"

ON storage.objects FOR INSERT

WITH CHECK (

  bucket_id = 'profile-photos'

  AND (storage.foldername(name))[1] = auth.uid()::text

);

-- Allow authenticated users to update only their own profile photo

CREATE POLICY "Users can update their own profile photo"

ON storage.objects FOR UPDATE

USING (

  bucket_id = 'profile-photos'

  AND (storage.foldername(name))[1] = auth.uid()::text

);

-- Allow authenticated users to delete only their own profile photo

CREATE POLICY "Users can delete their own profile photo"

ON storage.objects FOR DELETE

USING (

  bucket_id = 'profile-photos'

  AND (storage.foldername(name))[1] = auth.uid()::text

);

