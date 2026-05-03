-- SEV-MED-004: Restrict avatars bucket to image MIME types and 2MB limit,
-- matching the existing completion-photos bucket restrictions.

UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'],
    file_size_limit = 2097152
WHERE id = 'avatars';
