import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "moda-engell",
      resource_type: "auto"
    });
    return result.secure_url;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

export const deleteImage = async (imageUrl) => {
  try {
    const publicId = imageUrl.split("/").slice(-1)[0].split(".")[0];
    await cloudinary.uploader.destroy(`moda-engell/${publicId}`);
  } catch (error) {
    console.error("Delete error:", error);
  }
};
