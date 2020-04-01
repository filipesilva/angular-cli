const ngToolsWebpack = require('@ngtools/webpack');
const path = require('path');


const workspaceRoot = path.resolve(__dirname, './');
const projectRoot = path.resolve(__dirname, './');

module.exports = {
  mode: 'development',
  resolve: {
    extensions: ['.ts', '.js'],
    // In Bazel tests with --nobazel_patch_module_resolver we need to preserve the symlink paths
    // and not resolve them to their real path.
    symlinks: false,
  },
  entry: {
    main: path.resolve(projectRoot, './src/main.ts'),
    polyfills: path.resolve(projectRoot, './src/polyfills.ts')
  },
  output: {
    path: path.resolve(workspaceRoot, './dist'),
    filename: `[name].js`,
  },
  plugins: [
    new ngToolsWebpack.AngularCompilerPlugin({
      tsConfigPath: path.resolve(projectRoot, './src/tsconfig.app.json')
    })
  ],
  module: {
    rules: [
      { test: /\.css$/, loader: 'raw-loader' },
      { test: /\.html$/, loader: 'raw-loader' },
      { test: /\.ts$/, loader: ngToolsWebpack.NgToolsLoader }
    ]
  },
  devServer: {
    historyApiFallback: true
  }
};
