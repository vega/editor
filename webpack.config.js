const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const { CheckerPlugin } = require("awesome-typescript-loader");
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin");

module.exports = (env, argv) => {
  const config = {
    entry: {
      main: "./src/index.tsx"
    },

    output: {
      filename: "[name].bundle.js",
      chunkFilename: "[name].chunk.js",
      path: path.resolve(__dirname, "dist"),
      pathinfo: false
    },

    devtool:
      argv.mode === "development" ? "cheap-module-source-map" : "source-map",

    resolve: {
      extensions: [".ts", ".tsx", ".js", ".json"]
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: ["awesome-typescript-loader"]
        },
        {
          test: /\.css$/,
          use: [
            "style-loader",
            "css-loader",
            {
              loader: "postcss-loader",
              options: { plugins: [require("autoprefixer")] }
            }
          ]
        }
      ]
    },

    plugins: [
      new HtmlWebpackPlugin({
        filename: "index.html",
        template: "public/index.html"
      }),
      new MonacoWebpackPlugin({
        languages: ["json"]
      }),
      new CheckerPlugin(),
      new HardSourceWebpackPlugin()
    ],

    devServer: {
      stats: {
        colors: true
      },
      compress: true,
      overlay: {
        warnings: true,
        errors: true
      },
      progress: true,
      stats: "errors-only",
      open: true,
      contentBase: path.join(__dirname, "public"),
      watchContentBase: true,
      watchOptions: {
        ignored: /node_modules/
      }
    },

    node: {
      fs: "empty"
    }
  };

  return config;
};
