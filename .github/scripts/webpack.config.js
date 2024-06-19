import path from "path";
import { fileURLToPath } from "url";
import nodeExternals from "webpack-node-externals";

// Define __dirname for use in ES Module scope
const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default {
  target: "node",
  entry: "./main.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
  },
  resolve: {
    extensions: [".js", ".ts"],
    modules: [path.resolve(__dirname, "src"), "node_modules"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  externals: [nodeExternals()],
  externalsPresets: { node: true },
};
