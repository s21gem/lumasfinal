import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
  filePath: string,
  folder: string = "lumas-portfolio",
  resourceType: "image" | "video" | "auto" = "auto",
  uploadType?: string
): Promise<{ url: string; publicId: string }> => {
  const uploadOptions: any = {
    folder,
    resource_type: resourceType,
  };

  if (resourceType === "video") {
    uploadOptions.chunk_size = 6000000;
    // Don't apply any transformations during the initial upload for large videos
  } else {
    let transformation: any[] = [{ quality: "auto", fetch_format: "auto" }];
    
    if (uploadType === "logo") {
      // Auto crop ratio system for logo: Trim transparent borders and limit height
      transformation.unshift({ effect: "trim" }, { height: 160, crop: "limit" });
    } else if (uploadType === "favicon") {
      // Auto crop ratio system for favicon: Square crop
      transformation.unshift({ width: 64, height: 64, crop: "fill", gravity: "center" });
    }
    
    uploadOptions.transformation = transformation;
  }

  let result: any;
  if (resourceType === "video") {
    result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_large(filePath, uploadOptions, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  } else {
    result = await cloudinary.uploader.upload(filePath, uploadOptions);
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "video" = "image"
): Promise<void> => {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
};

export default cloudinary;
