const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const fs = require('fs').promises;
const express = require('express');

const RULES_FILE = path.join(__dirname, 'data', 'rules.json');

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
      {
        // allows importing CSV files as text strings
        test: /\.csv$/,
        type: 'asset/source',
      },
    ],
  },
  plugins: [new HtmlWebpackPlugin({ template: './public/index.html' })],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    static: './public',
    open: true,
    hot: true,
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      // GET /api/rules - Read rules.json
      devServer.app.get('/api/rules', async (req, res) => {
        try {
          const data = await fs.readFile(RULES_FILE, 'utf8');
          const rules = JSON.parse(data);
          res.json(rules);
        } catch (error) {
          if (error.code === 'ENOENT') {
            res.json({}); // empty object when file doesn't exist
          } else {
            console.error('Error reading rules.json:', error);
            res.status(500).json({ error: 'Failed to read rules' });
          }
        }
      });

      // POST /api/rules - Write rules.json
      devServer.app.use('/api/rules', express.json());
      devServer.app.post('/api/rules', async (req, res) => {
        try {
          const rules = req.body;

          const dataDir = path.dirname(RULES_FILE);
          await fs.mkdir(dataDir, { recursive: true });

          await fs.writeFile(
            RULES_FILE,
            JSON.stringify(rules, null, 4),
            'utf8'
          );
          res.json({ success: true });
        } catch (error) {
          console.error('Error writing rules:', error);
          res.status(500).json({ error: 'Failed to write rules' });
        }
      });

      return middlewares;
    },
  },
});
