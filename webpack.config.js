const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = env => {
  const config = {
    entry: {
        main: './src/index.tsx'
    },
    output: {
        filename: '[name].bundle.js',
        chunkFilename: '[name].chunk.js',
        path: path.resolve(__dirname, 'dist'),
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: 'source-map',

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ['.ts', '.tsx', '.js', '.json']
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            { 
              test: /\.tsx?$/,
              use: ['ts-loader'],
            },
             // All CSS files will be handled by 'css-loader' & `styles-loader`.
            {
              test: /\.css$/,
              use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
      // Generates an `index.html` file with the <script> injected.
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'public/index.html'
      }),
      new MonacoWebpackPlugin()
    ],
    //  Bundles everything in `node_modules` in the separate file
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all"
          }
        }
      }
    },
    // Configurations for `webpack-dev-server`
    devServer: {
      contentBase: path.join(__dirname, "public"),
    },
    node: {
      fs: 'empty'
    }
  };

  return config;
};
