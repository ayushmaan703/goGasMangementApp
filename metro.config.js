const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');
/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push(
  'jpg',
  'jpeg',
  'png',
  'gif',
  // Add other image extensions if needed
);

// module.exports = mergeConfig(getDefaultConfig(__dirname), config);
module.exports = wrapWithReanimatedMetroConfig(config);
module.exports = config;
