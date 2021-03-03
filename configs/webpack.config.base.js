/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import webpack from 'webpack';
// import unlazy from 'unlazy-loader';
import { dependencies as externals } from '../app/package.json';

export default {
  externals: [...Object.keys(externals || {})],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.js$/,
        use: 'unlazy-loader'
      },
      {
        // regex for the files that are problematic
        test: /node_modules\/puppeteer-extra\/dist\/index\.esm\.js/,
        loader: 'string-replace-loader',
        options: {
          // match a require function call where the argument isn't a string
          // also capture the first character of the args so we can ignore it later
          search: 'require[(]([^\'"])',
          // replace the 'require(' with a '__non_webpack_require__(', meaning it will require the files at runtime
          // $1 grabs the first capture group from the regex, the one character we matched and don't want to lose
          replace: '__non_webpack_require__($1',
          flags: 'g'
        }
      },
      {
        test: /\.(?:mp3|wav|ogg)$/,
        use: 'file-loader',
      },
    ],
  },

  output: {
    path: path.join(__dirname, '..', 'app'),
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2',
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [path.join(__dirname, '..', 'app'), 'node_modules'],
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),

    new webpack.NamedModulesPlugin(),
  ],
};
