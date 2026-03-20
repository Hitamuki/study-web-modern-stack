// モノレポ特有のモジュール解決のために必要な設定
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// モノレポ対応
config.watchFolders = [
  path.resolve(__dirname, "../../"),
];

// pnpm対応（超重要）
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "../../node_modules"),
  path.resolve(__dirname, "node_modules"),
];

module.exports = config;
