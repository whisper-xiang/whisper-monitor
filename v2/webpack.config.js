const path = require("path");

module.exports = {
  entry: "./src/index.ts", // 入口文件
  output: {
    filename: "bundle.js", // 输出的文件名
    path: path.resolve(__dirname, "dist"), // 输出的路径
    // 设置模块类型为 ES模块，确保可以使用 `import` 引入
    libraryTarget: "module", // 输出为 ES 模块格式
    environment: {
      module: true, // 支持 ES 模块
    },
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
  experiments: {
    outputModule: true, // 开启模块输出实验，支持 ES 模块输出
  },
};
