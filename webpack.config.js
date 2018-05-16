const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = env => {
  const config = {
    entry: {
        main: './src/index.tsx'
    },
    output: {
        filename: 'static/js/[name].bundle.js',
        chunkFilename: 'static/js/[name].chunk.js',
        path: path.resolve(__dirname, 'build'),
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
        template: 'public/index.html',
        favicon: 'public/favicon.ico'
      }),
      new MonacoWebpackPlugin()
    ],
    devServer: {
      contentBase: path.join(__dirname, "public"),
    },
    node: {
      fs: 'empty'
    }
  };

  return config;
};