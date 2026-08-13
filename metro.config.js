const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver = {
  ...config.resolver,
  alias: {
    '@': path.resolve(__dirname),
  },
  // Firebase v9+'s package.json "exports" maps don't resolve correctly under
  // Metro's package-exports resolution (breaks firebase/auth, firebase/firestore
  // etc. on the web target specifically) — falling back to "main"/"browser"
  // fields fixes it. Documented Firebase+Expo workaround.
  unstable_enablePackageExports: false,
};

module.exports = config;
