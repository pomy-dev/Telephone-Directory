import { supabase } from '../service/Supabase-Client';

export const UploadFile = async (file) => {
  try {
    const fileName = `${Date.now()}_${file.fileName}`;
    path = `group-avatars/${fileName}`;

    // Upload the file to Supabase Storage
    const { error } = await supabase.storage
      .from("group-avatars") // Replace with your actual bucket name
      .upload(path, file, {
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