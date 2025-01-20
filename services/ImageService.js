import * as FileSystem from "expo-file-system";
import { supabase } from "../lib/supabase";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

// Polyfill Buffer for React Native
import { Buffer } from "buffer";
import { supabaseUrl } from "../constants";

export const getUserImageSource = (imagepath) => {
  if (imagepath) {
    return getSupabaseFileUrl(imagepath);
  } else {
    return require("../assets/images/defuser.png"); // Ensure the default image path is valid
  }
};

export const getSupabaseFileUrl = (filePath) => {
  if (!filePath) return null;

  try {
    return {
      uri: `${supabaseUrl}/storage/v1/object/public/uploads/${filePath}`,
    };
  } catch (error) {
    console.error("Error generating file URL:", error);
    return null;
  }
};

// Add this function to pre-process images
export const processImage = async (imageUri, maxWidth = 800) => {
  try {
    const result = await manipulateAsync(
      imageUri,
      [{ resize: { width: maxWidth } }],
      { compress: 0.7, format: SaveFormat.JPEG }
    );
    return result.uri;
  } catch (error) {
    console.error("Error processing image:", error);
    return imageUri;
  }
};

export const uploadFile = async (folderName, fileUri, isImage = true) => {
  try {
    let processedUri = fileUri;

    if (isImage) {
      processedUri = await processImage(fileUri);
    }

    // Generate the file name and path
    const fileName = getFilePath(folderName, isImage);

    // Read the file as Base64
    const fileBase64 = await FileSystem.readAsStringAsync(processedUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert Base64 to binary (ArrayBuffer)
    const binaryData = Buffer.from(fileBase64, "base64");

    // Determine content type
    const contentType = isImage ? "image/jpeg" : "video/mp4";

    // Upload the file to Supabase
    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(fileName, binaryData, {
        cacheControl: "3600",
        upsert: false,
        contentType,
      });

    if (error) {
      console.error("File upload error:", error);
      return { success: false, msg: "Could not upload file" };
    }

    //console.log("Upload successful:", data);
    return { success: true, data: data.path };
  } catch (error) {
    console.error("Error in uploadFile:", error);
    return { success: false, msg: "Could not upload file" };
  }
};

export const getFilePath = (folderName, isImage) => {
  const extension = isImage ? ".png" : ".mp4";
  return `${folderName}/${Date.now()}${extension}`;
};

export const getLocalFilePath = (filePath) => {
  let fileName = filePath.split("/").pop();
  return `${FileSystem.documentDirectory}${fileName}`;
};
// export const downloadfile = async (uri) => {
//   try {
//     const { uri } = await FileSystem.downloadAsync(uri, getLocalFilePath(uri));
//     return uri;
//   } catch (error) {
//     return null;
//   }
// };
export const downloadfile = async (fileUri) => {
  try {
    const localUri = getLocalFilePath(fileUri);
    const result = await FileSystem.downloadAsync(fileUri, localUri);
    return result.uri; // Return the local URI after download
  } catch (error) {
    console.error("Error downloading file:", error);
    return null;
  }
};
