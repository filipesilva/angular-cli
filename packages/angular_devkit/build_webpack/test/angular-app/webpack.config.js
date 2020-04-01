const ngToolsWebpack = require('@ngtools/webpack');
const path = require('path');

// TODO(greg): just some logging to see how these things should be resolved.
// ngToolsWebpack.NgToolsLoader is an export that contains the result of __filename.
console.log('#', require.resolve('@ngtools/webpack'))
console.log('#', ngToolsWebpack.NgToolsLoader)

const workspaceRoot = path.resolve(__dirname, './');
const projectRoot = path.resolve(__dirname, './');

module.exports = {
  mode: 'development',
  resolve: {
    extensions: ['.ts', '.js'],
    // In Bazel tests with --nobazel_patch_module_resolver we need to preserve the symlink paths
    // and not resolve them to their real path.
    // TODO(greg): if I don't set this, the TS compilation files aren't resolved correctly.
    // When this option is set to true, it means "use realpath for resolutions".
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

      // TODO(greg): if I use ngToolsWebpack.NgToolsLoader (the __filename result), I get an error:
// ERROR in ../npm/node_modules/angular_cli/packages/angular_devkit/build_webpack/test/angular-app/src/main.ts
// Module build failed (from /home/filipesilva/.cache/bazel/_bazel_filipesilva/e327cb0949caea626cba080635966a9f/execroot/angular_cli/bazel-out/k8-fastbuild/bin/packages/ngtools/webpack/src/index.js):
// Error: Cannot find module '/home/filipesilva/.cache/bazel/_bazel_filipesilva/e327cb0949caea626cba080635966a9f/execroot/angular_cli/node_modules/@angular-devkit/core/src/index.js'. Please verify that the package.json has a valid "main" entry
      { test: /\.ts$/, loader: '@ngtools/webpack' }
      // { test: /\.ts$/, loader: ngToolsWebpack.NgToolsLoader }
    ]
  },
  devServer: {
    historyApiFallback: true
  }
};
