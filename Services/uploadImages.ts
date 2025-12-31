import { supabase } from "../Utils/supabase";
import * as FileSystem from "expo-file-system/legacy";

export const uploadBookImages = async (
  userId: string,
  bookId: string,
  imageUris: string[]
): Promise<string[]> => {
  const uploadedUrls: string[] = [];

  for (let i = 0; i < imageUris.length; i++) {
    const uri = imageUris[i];

    console.log("🔄 Uploading image:", uri);

    // 1️⃣ Read image as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 2️⃣ Convert base64 → Uint8Array
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let j = 0; j < binary.length; j++) {
      bytes[j] = binary.charCodeAt(j);
    }

    // 3️⃣ Unique file path
    const filePath = `${userId}/${bookId}/${Date.now()}_${i}.jpg`;

    // 4️⃣ Try ArrayBuffer upload
    let uploadError = null;

    const { error } = await supabase.storage
      .from("book-images")
      .upload(filePath, bytes.buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    uploadError = error;

    // 5️⃣ Fallback to Blob if needed
    if (uploadError) {
      console.log("⚠️ ArrayBuffer failed, retrying with Blob...");

      const blob = new Blob([bytes], { type: "image/jpeg" });

      const { error: blobError } = await supabase.storage
        .from("book-images")
        .upload(filePath, blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (blobError) {
        console.error("❌ Image upload failed:", blobError);
        throw blobError;
      }
    }

    // 6️⃣ Get public URL
    const { data } = supabase.storage
      .from("book-images")
      .getPublicUrl(filePath);

    uploadedUrls.push(data.publicUrl);

    console.log("✅ Uploaded:", data.publicUrl);
  }

  return uploadedUrls;
};
