// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable dynamic import parsing support for Hermes
config.transformer.asyncRequireModulePath = require.resolve(
   'metro-runtime/src/modules/empty-module'
    
);

module.exports = config;
