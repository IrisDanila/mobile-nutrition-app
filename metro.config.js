const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  // Ensure .cjs modules are resolved (some firebase internals may use them)
  if (!config.resolver.sourceExts.includes('cjs')) {
    config.resolver.sourceExts.push('cjs');
  }
  // Workaround for package exports edge case triggering auth component registration issue
  config.resolver.unstable_enablePackageExports = false;
  return config;
})();
