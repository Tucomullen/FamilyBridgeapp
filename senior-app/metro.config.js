const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for React Native web bundling issues
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
