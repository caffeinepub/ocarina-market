import { MediaKind } from '../backend';

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const SUPPORTED_3D_EXTENSIONS = ['.obj', '.3mf'];

export function validateHeroMediaFile(file: File): { valid: boolean; error?: string } {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  // Check if it's a supported image
  if (SUPPORTED_IMAGE_TYPES.includes(fileType)) {
    return { valid: true };
  }

  // Check if it's a supported 3D model by extension
  const is3DModel = SUPPORTED_3D_EXTENSIONS.some(ext => fileName.endsWith(ext));
  if (is3DModel) {
    return { valid: true };
  }

  return { 
    valid: false, 
    error: 'Unsupported file type. Please upload an image (JPEG, PNG, GIF, WebP) or 3D model (.obj, .3mf)' 
  };
}

export function inferContentType(file: File): string {
  const fileName = file.name.toLowerCase();
  
  // If browser provides a content type, use it
  if (file.type && file.type !== '') {
    return file.type;
  }

  // Infer from extension for 3D models
  if (fileName.endsWith('.obj')) {
    return 'model/obj';
  }
  if (fileName.endsWith('.3mf')) {
    return 'model/3mf';
  }

  // Default fallback
  return 'application/octet-stream';
}

export function buildMediaKind(file: File): MediaKind {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  // Check if it's an image
  if (SUPPORTED_IMAGE_TYPES.includes(fileType)) {
    return { __kind__: 'image', image: null };
  }

  // Check if it's a 3D model
  if (fileName.endsWith('.obj')) {
    return { __kind__: 'model3d', model3d: { modelType: 'obj' } };
  }
  if (fileName.endsWith('.3mf')) {
    return { __kind__: 'model3d', model3d: { modelType: '3mf' } };
  }

  // Default to image
  return { __kind__: 'image', image: null };
}
