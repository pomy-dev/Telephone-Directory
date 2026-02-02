import { supabase } from './Supabase-Client';
import * as FileSystem from 'expo-file-system';

export const UploadImage = async (file) => {
  try {
    if (!file) return;
    const fileName = `photo_${Date.now()}`

    const base64 = await FileSystem.readAsStringAsync(file, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const mimeType = 'image/jpeg';

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('flyer_items')
      .upload(`items/${fileName}`, bytes, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) console.warn('Upload error:', error);

    const { data: urlData } = supabase.storage
      .from('flyer_items')
      .getPublicUrl(data?.path);

    return urlData.publicUrl;

  } catch (error) {
    console.error("Image could not be uploaded:", error);
    return null;
  }
}

export const uploadVehicles = async (path, files = []) => {
  console.log('Path: ', path, '\nImages: ', files)
  if (files?.length === 0) return;

  const uploaded = [];
  for (const file of files) {
    try {
      // === 1. Extract file info ===
      const fileName = `vehicle_${Date.now()}`;

      // === 1. Read file as Base64 ===
      const base64 = await FileSystem.readAsStringAsync(file, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // === 2. Convert Base64 → Uint8Array (binary) ===
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // === 3. Detect MIME type & extension ===
      let mimeType = 'image/jpeg';

      // === 4. Upload to Supabase Storage ===
      const { data, error } = await supabase.storage
        .from(path)
        .upload(`vehicles/${fileName}`, bytes, {
          contentType: mimeType,
          upsert: false,
        });

      if (error) {
        console.warn('Upload error:', error);
        continue;
      }

      // === 5. Get public URL ===
      const { data: urlData } = supabase.storage
        .from(path)
        .getPublicUrl(data?.path);

      const publicUrl = urlData.publicUrl;

      // === 6. Determine display type ===
      const type = mimeType.startsWith('image/') ? 'image' :
        mimeType.startsWith('video/') ? 'video' :
          'document';

      // === 7. Push clean metadata ===
      uploaded.push({
        url: publicUrl,
        name: fileName,
        type,
        size: bytes.byteLength,
        mimeType,
        path: data?.path,
      });

    } catch (err) {
      console.warn('Upload failed:', err);
    }
  }

  return uploaded;
};

export const uploadAttachments = async (path, subpath, files = []) => {
  console.log('Path: ', path, '\nSubpath: ', subpath, '\nImages: ', files)
  const uploaded = [];
  for (const file of files) {
    if (!file?.uri) continue;

    try {
      // === 1. Extract file info ===
      const fileName = file.name || `file_${Date.now()}`;
      const fileSize = file.size

      // === 1. Read file as Base64 ===
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // === 2. Convert Base64 → Uint8Array (binary) ===
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // === 3. Detect MIME type & extension ===
      let mimeType = file.mimeType;

      // Fallback: infer from file extension
      if (!mimeType) {
        const ext = fileName.split('.').pop()?.toLowerCase();
        const mimeMap = {
          jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp',
          mp4: 'video/mp4', mov: 'video/quicktime', avi: 'video/x-msvideo',
          pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          txt: 'text/plain', csv: 'text/csv',
        };
        mimeType = mimeMap[ext] || 'application/octet-stream';
      }

      const fileExt = mimeType.startsWith('image/') ? mimeType.split('/')[1] :
        mimeType.startsWith('video/') ? mimeType.split('/')[1] :
          fileName.split('.').pop() || 'bin';

      const safeFileName = `disc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      // === 4. Upload to Supabase Storage ===
      const { data, error } = await supabase.storage
        .from(path)
        .upload(`${subpath}/${fileName}`, bytes, {
          contentType: mimeType,
          upsert: false,
        });

      if (error) {
        console.warn('Upload error:', error);
        continue;
      }

      // === 5. Get public URL ===
      const { data: urlData } = supabase.storage
        .from(path)
        .getPublicUrl(data?.path);

      const publicUrl = urlData.publicUrl;

      // === 6. Determine display type ===
      const type = mimeType.startsWith('image/') ? 'image' :
        mimeType.startsWith('video/') ? 'video' :
          'document';

      // === 7. Push clean metadata ===
      uploaded.push({
        url: publicUrl,
        name: fileName,
        type,
        size: fileSize || bytes.byteLength,
        mimeType,
        path: data.path,
      });

    } catch (err) {
      console.warn('Upload failed:', err);
    }
  }

  return uploaded;
};