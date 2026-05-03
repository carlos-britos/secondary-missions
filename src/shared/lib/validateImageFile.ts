const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']

export function validateImageFile(file: File): void {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error('Invalid file type. Allowed: jpg, jpeg, png, webp')
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }
}
