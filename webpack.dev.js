// This file contains the development configuration for Webpack.
// Webpack is used to bundle our source code, in order to optimize which
// scripts are loaded and all required files to run the application are
// neatly put into the build directory.
// Based on https://taraksharma.com/setting-up-electron-typescript-react-webpack/

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

let mainConfig = {
  mode: 'development',
  entry: './src/main/main.ts',
  devtool: 'source-map',
  target: ['electron-main', 'es2020'],
  output: {
    filename: 'main.bundle.js',
    path: __dirname + '/build',
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  resolve: {
    extensions: ['.js', '.json', '.ts'],
  },
  module: {
    rules: [
      {
        // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
        test: /\.(ts)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
        },
      },
      {
        test: /\.(jpg|png|gif|ico|icns)$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
        },
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
        },
      },
    ],
  },
};

let rendererConfig = {
  mode: 'development',
  entry: './src/renderer/renderer.tsx',
  devtool: 'source-map',
  target: ['electron-renderer', 'es2020'],
  output: {
    filename: 'renderer.bundle.js',
    path: __dirname + '/build',
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  experiments: {
    asyncWebAssembly: true,
  },
  externals: {
    // don't let webpack mess with wasm, load it at runtime
    wasm: 'wasm',
  },
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx', '.svg', '.wasm'],
    alias: {
      components: path.resolve(__dirname, 'components/'),
      resources: path.resolve(__dirname, 'resources/'),
      src: path.resolve(__dirname, 'src/'),
      wasm: path.resolve(__dirname, 'wasm/'),
    },
  },
  module: {
    rules: [
      {
        test: /\.worker\.ts$/,
        loader: 'worker-loader',
        options: {
          filename: '[name].js',
        },
      },
      {
        // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        test: /\.(scss|css)$/,
        exclude: /\.module\.scss$/,
        use: ['style-loader', 'css-loader?sourceMap', 'sass-loader?sourceMap'],
      },
      {
        test: /\.module.(scss|css)$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              modules: {
                // Use real class name, hash only added when needed
                localIdentName: '[local]_[hash:base64:5]',
              },
            },
          },
          'sass-loader?sourceMap',
        ],
      },
      {
        test: /\.(jpg|png|gif|ico|icns)$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
        },
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
        },
      },
      {
        test: /\.wasm$/,
        loader: 'file-loader',
        type: 'javascript/auto',
        options: {
          name: '[path][name].[ext]',
        },
      },
      {
        test: /\.node$/,
        use: 'node-loader',
      },
      {
        test: /\.svg$/,
        oneOf: [
          {
            issuer: /\.scss$/,
            loader: 'file-loader',
          },
          {
            issuer: /.tsx?$/,
            loader: '@svgr/webpack',
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/renderer/index.html'),
    }),
    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, './wasm/masonry'),
    }),
    new CopyPlugin({
      patterns: [{ from: 'wasm/masonry/pkg', to: 'wasm/masonry/pkg' }],
    }),
  ],
};

module.exports = [mainConfig, rendererConfig];
