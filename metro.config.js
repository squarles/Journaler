// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// expo-sqlite's web backend loads a wasm binary; Metro needs to treat
// `.wasm` as an asset rather than trying to parse it as a JS module.
config.resolver.assetExts.push("wasm");

module.exports = config;
