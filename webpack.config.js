const path = require("path");

module.exports = {
  entry: "./src/index.ts", // 入口文件
  output: {
    filename: "whisperMonitor.js", // 输出的文件名
    path: path.resolve(__dirname, "dist"), // 输出的路径
    library: "WhisperMonitor", // 将库挂载到全局变量上
    libraryTarget: "umd", // 输出为 UMD 格式，支持 CommonJS、AMD 和全局变量
    globalObject: "this", // 在浏览器和 Node 环境下都适用
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // 设置路径别名
    },
    extensions: [".ts", ".js"], // 支持 .ts 和 .js 文件的扩展名
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // 匹配 TypeScript 文件
        use: "ts-loader", // 使用 ts-loader 来编译 TypeScript
        exclude: /node_modules/,
      },
    ],
  },
  mode: "production", // 生产环境打包
};
