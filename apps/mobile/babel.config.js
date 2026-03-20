// 最新のJavaScript/TypeScript記法や、React Native固有のコードがブラウザやアプリが理解できる形式に変換（トランスパイル）
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
