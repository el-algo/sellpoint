const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite's web support loads a WebAssembly build of SQLite,
// which Metro needs to treat as a bundled asset.
config.resolver.assetExts.push('wasm');

// expo-sqlite's web worker relies on SharedArrayBuffer, which browsers
// only expose on cross-origin-isolated pages.
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    return middleware(req, res, next);
  };
};

module.exports = config;
