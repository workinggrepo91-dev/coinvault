import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

/**
 * Configure Cloudinary with environment variables
 */
function getCloudinaryInstance() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    return cloudinary;
  }

  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
      cloudinary_url: process.env.CLOUDINARY_URL,
      secure: true,
    });
    return cloudinary;
  }

  return null;
}

/**
 * Checks if Cloudinary credentials are set up in the environment.
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    (process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET) ||
    process.env.CLOUDINARY_URL
  );
}

/**
 * Uploads a file buffer directly to Cloudinary.
 * If credentials are not configured, provides a safe fallback.
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder = "coinvault/uploads",
  options: {
    resource_type?: "image" | "raw" | "auto";
    mimeType?: string;
    transformation?: any[];
  } = {}
): Promise<{ url: string; publicId?: string; isCloudinary: boolean }> {
  const cld = getCloudinaryInstance();

  // If Cloudinary credentials are not yet set in .env, fallback to data URI
  if (!cld) {
    console.warn(
      `⚠️ [Cloudinary]: Credentials not set in .env. Using fallback data URI for ${folder}. Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to store in Cloudinary.`
    );
    const mime = options.mimeType || "image/jpeg";
    const dataUri = `data:${mime};base64,${fileBuffer.toString("base64")}`;
    return {
      url: dataUri,
      isCloudinary: false,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cld.uploader.upload_stream(
      {
        folder,
        resource_type: options.resource_type || "auto",
        quality: "auto",
        fetch_format: "auto",
        transformation: options.transformation,
      },
      (error: any, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          console.error("Cloudinary upload stream failed:", error);
          reject(new Error(error?.message || "Failed to upload image to Cloudinary"));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            isCloudinary: true,
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}
