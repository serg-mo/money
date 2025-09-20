const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

// TODO: I want to "npm run serve -f path/to/csv" so I don't have to upload the file on local
module.exports = (env, argv) => ({
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'docs'),
    publicPath:
      argv.mode === 'production' ? 'https://serg-mo.github.io/money/' : 'auto',
    filename: 'bundle.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    static: './public',
    open: true,
    hot: true,
  },
});
