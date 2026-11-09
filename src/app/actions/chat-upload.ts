"use server";

import { auth } from "@/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function uploadChatAttachment(formData: FormData): Promise<{
  success?: boolean;
  url?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized. Please log in." };
    }

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { error: "No file provided." };
    }

    // Maximum file size: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return { error: "File exceeds maximum size limit of 10MB." };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isImage = file.type.startsWith("image/");
    const uploadResult = await uploadToCloudinary(
      buffer,
      "coinvault/chat_attachments",
      {
        resource_type: isImage ? "image" : "auto",
        mimeType: file.type,
      }
    );

    return {
      success: true,
      url: uploadResult.url,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    };
  } catch (err: any) {
    console.error("Failed to upload chat attachment:", err);
    return { error: err.message || "Failed to upload file attachment." };
  }
}

