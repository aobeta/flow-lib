const path = require('path');
const webpack = require('webpack');

const serverConfig = {
  entry: {
      'scripts/index' : './src/scripts/index.ts',
      'user/index' : './src/user/index.ts',
      'transactions/server/index' : './src/transactions/server/index.ts',
      'transactions/client/index' : './src/transactions/client/index.ts',
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /(node_module|dist)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
          {
            loader: 'ts-loader',
          },
          {
            loader: '@stavalfi/babel-plugin-module-resolver-loader',
            options: {
              // all those options will go directly to babel-plugin-module-resolver plugin.
              // Read babel-plugin-module-resolver DOCS to see all options:
              // https://github.com/tleunen/babel-plugin-module-resolver/blob/master/DOCS.md
              root: ['./src'],
              extensions: ['.js', '.jsx', '.d.ts', '.ts', '.tsx'],
            },
          },
        ],
      },
      {
        test: /\.cdc$/i,
        use: [
          { loader : 'raw-loader' },
          { loader : path.resolve('./replaceImport.js') }
        ]
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path:     path.resolve(__dirname, 'dist'),
    library: {
      name: "[name]",
      type: "umd"
    },
  },
};

module.exports = [serverConfig]
