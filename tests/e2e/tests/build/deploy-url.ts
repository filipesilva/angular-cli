import { ng } from '../../utils/process';
import { copyProjectAsset } from '../../utils/assets';
import { expectFileToMatch, writeMultipleFiles } from '../../utils/fs';
import { updateJsonFile } from '../../utils/project';
import { getGlobalVariable } from '../../utils/env';


export default function () {
  // TODO(architect): reenable, validate, then delete this test. It is now in devkit/build-webpack.
  return;

  return Promise.resolve()
    .then(() => writeMultipleFiles({
      'src/styles.css': 'div { background: url("./assets/more.png"); }',
    }))
    // use image with file size >10KB to prevent inlining
    .then(() => copyProjectAsset('images/spectrum.png', './assets/more.png'))
    .then(() => ng('build', '--deploy-url=deployUrl/', '--extract-css'))
    .then(() => expectFileToMatch('dist/index.html', 'deployUrl/main.js'))
    // verify --deploy-url isn't applied to extracted css urls
    .then(() => expectFileToMatch('dist/styles.css',
      /url\(['"]?more\.[0-9a-f]{20}\.png['"]?\)/))
    .then(() => ng('build', '--deploy-url=http://example.com/some/path/', '--extract-css'))
    .then(() => expectFileToMatch('dist/index.html', 'http://example.com/some/path/main.js'))
    // verify option also works in config
    .then(() => updateJsonFile('.angular-cli.json', configJson => {
      const app = configJson['apps'][0];
      app['deployUrl'] = 'config-deployUrl/';
    }))
    .then(() => ng('build'))
    .then(() => expectFileToMatch('dist/index.html', 'config-deployUrl/main.js'))
    // verify --deploy-url is applied to non-extracted css urls
    .then(() => ng('build', '--deploy-url=deployUrl/', '--extract-css=false'))
    .then(() => expectFileToMatch('dist/styles.js',
      /\(['"]?deployUrl\/more\.[0-9a-f]{20}\.png['"]?\)/))
    .then(() => expectFileToMatch('dist/runtime.js',
      /__webpack_require__\.p = "deployUrl\/";/))
    // verify slash is appended to the end of --deploy-url if missing
    .then(() => ng('build', '--deploy-url=deployUrl', '--extract-css=false'))
    // skip this in ejected tests
    .then(() => getGlobalVariable('argv').eject
      ? Promise.resolve()
      : expectFileToMatch('dist/runtime.js', /__webpack_require__\.p = "deployUrl\/";/));
}
