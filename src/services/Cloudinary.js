import { resizeAndCompressImage } from './ImageProcessor';
import { CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_CLOUD_NAME } from '@env';

export const uploadImage = async image => {
  if (!image?.uri) {
    throw new Error('No image selected');
  }

  const cloudName = CLOUDINARY_CLOUD_NAME;
  const uploadPreset = CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName) {
    throw new Error('Cloudinary cloud name is not configured');
  }

  if (!uploadPreset) {
    throw new Error('Cloudinary upload preset is not configured');
  }

  try {
    const processedImage = await resizeAndCompressImage(image);
    const formData = new FormData();

    formData.append('file', {
      uri: processedImage.uri,
      type: processedImage.type,
      name: processedImage.fileName,
    });

    formData.append('upload_preset', uploadPreset);

    // --------------------------------
    // 3. Upload to Cloudinary
    // --------------------------------

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    // --------------------------------
    // 4. Parse response
    // --------------------------------

    const data = await response.json();

    if (!response.ok) {
      console.log('Cloudinary error:', data);

      throw new Error(data?.error?.message || 'Image upload failed');
    }

    // --------------------------------
    // 5. Return URL
    // --------------------------------

    if (!data?.secure_url) {
      throw new Error('Cloudinary did not return image URL');
    }
    return data.secure_url;
  } catch (error) {
    console.log('Image upload error:', error);

    throw error;
  }
};
