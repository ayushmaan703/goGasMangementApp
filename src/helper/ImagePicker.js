import { launchImageLibrary } from 'react-native-image-picker';

export const pickImage = async () => {
  try {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.8,
    });

    console.log('IMAGE PICKER RESULT:', result);

    if (result.didCancel) {
      return null;
    }

    if (result.errorCode) {
      console.log(
        'Image picker native error:',
        result.errorCode,
        result.errorMessage,
      );

      throw new Error(
        result.errorMessage || `Image picker error: ${result.errorCode}`,
      );
    }

    const image = result.assets?.[0];

    if (!image?.uri) {
      throw new Error('No image was selected');
    }

    return image;
  } catch (error) {
    console.log('Image picker error:', error);

    throw error;
  }
};
