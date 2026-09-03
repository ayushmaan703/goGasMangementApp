import ImageResizer from 'react-native-image-resizer';

export const resizeAndCompressImage = async image => {
  if (!image?.uri) {
    throw new Error('Invalid image');
  }

  try {
    const result = await ImageResizer.createResizedImage(
      image.uri,
      1200, // max width
      1200, // max height
      'JPEG', // output format
      80, // quality
      0, // rotation
      undefined, // output path
      false, // keep metadata
      {
        mode: 'contain',
      },
    );
console.log(result);

    return {
      uri: result.uri,
      fileName: `go-gas-${Date.now()}.jpg`,
      type: 'image/jpeg',
    };
  } catch (error) {
    console.error('Image resize error:', error);
    throw new Error('Unable to process image');
  }
};
