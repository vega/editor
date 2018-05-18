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
      publicPath: '/'
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
          use: ['ts-loader']
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
      new MonacoWebpackPlugin({
        languages: ['json']
      })
    ],
    // Configurations for `webpack-dev-server`
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
      inline: true,
      open: true,
      contentBase: path.join(__dirname, 'public'),
      watchContentBase: true,
      watchOptions: {
        ignored: /node_modules/
      }
    },
    node: {
      fs: 'empty'
    }
  };

  return config;
};
