import { supabase } from '../service/Supabase-Client';
import * as FileSystem from 'expo-file-system/legacy';

export const UploadImage = async (file) => {
  try {
    const fileName = `${Date.now()}_${file.fileName}`;
    path = `group-avatars/${fileName}`;

    // Upload the file to Supabase Storage
    const { error } = await supabase.storage
      .from("group-avatars") // Replace with your actual bucket name
      .upload(file, {
        cacheControl: "3600",
        upsert: false, // Set to true if you want to overwrite existing files
        contentType: file.mimeType || "image/jpeg",
      });

    if (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }

    // Retrieve the public URL of the uploaded file
    const { data } = supabase.storage
      .from("group-avatars")
      .getPublicUrl(path);

    return data.publicUrl;

  } catch (error) {
    console.error("Image could not be uploaded:", error);
    return null;
  }
}

export const uploadAttachments = async (files = []) => {
  const uploaded = [];
  for (const file of files) {
    if (!file?.uri) continue;

    try {
      // === 1. Extract file info ===
      const fileName = file.name || `file_${Date.now()}`;
      const fileUri = file.uri;
      const fileSize = file.size || (await FileSystem.getInfoAsync(fileUri)).size;

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
        .from('discussion-media')
        .upload(`discussions/${fileName}`, bytes, {
          contentType: mimeType,
          upsert: false,
        });

      if (error) {
        console.warn('Upload error:', error);
        continue;
      }

      // === 5. Get public URL ===
      const { data: urlData } = supabase.storage
        .from('discussion-media')
        .getPublicUrl(data.path);

      const publicUrl = urlData.publicUrl;

      // === 6. Determine display type ===
      const type = mimeType.startsWith('image/') ? 'image' :
        mimeType.startsWith('video/') ? 'video' :
          'document';

      // === 7. Push clean metadata ===
      uploaded.push({
        url: publicUrl,
        name: fileName,
        type, // 'image' | 'video' | 'document'
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