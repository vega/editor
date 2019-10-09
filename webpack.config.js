const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const {CheckerPlugin} = require('awesome-typescript-loader');

module.exports = (env, argv) => {
  const config = {
    entry: {
      main: './src/index.tsx'
    },

    output: {
      filename: '[name].js',
      chunkFilename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
      pathinfo: false
    },

    optimization: {
      concatenateModules: false,
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 0,
        cacheGroups: {
          vega: {
            test: /vega/,
            name: 'vega',
            priority: 10,
            reuseExistingChunk: true
          },
          vegaLite: {
            test: /vega-lite/,
            name: 'vega-lite',
            priority: 20,
            reuseExistingChunk: true
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            name: 'vendor',
            reuseExistingChunk: true
          },
          default: {
            name: 'default',
            priority: -20,
            reuseExistingChunk: true
          }
        }
      }
    },

    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    },

    devtool: argv.mode === 'development' ? 'cheap-module-source-map' : 'source-map',

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.mjs', '.json']
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: ['awesome-typescript-loader']
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {plugins: [require('autoprefixer')]}
            }
          ]
        }
      ]
    },

    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'public/index.html'
      }),
      new MonacoWebpackPlugin({
        languages: ['json']
      }),
      new CheckerPlugin()
    ],

    devServer: {
      host: '0.0.0.0',
      stats: {
        colors: true
      },
      compress: true,
      overlay: {
        warnings: true,
        errors: true
      },
      progress: true,
      stats: 'errors-only',
      open: false,
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
