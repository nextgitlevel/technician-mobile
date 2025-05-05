module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for expo-router
      'expo-router/babel',
      // Enable path aliases using @ syntax
      [
        'module-resolver',
        {
          root: ['.'],
          extensions: [
            '.ios.js',
            '.android.js',
            '.js',
            '.ts',
            '.tsx',
            '.json',
          ],
          alias: {
            '@': './',
          },
        },
      ],
    ],
  };
};