import {ng} from '../../../utils/process';
import {updateJsonFile} from '../../../utils/project';
import {expectToFail} from '../../../utils/utils';

export default function() {
  // TODO(architect): reenable, validate, then delete this test. It is now in devkit/build-webpack.
  return;

  return Promise.resolve()
    .then(() => updateJsonFile('.angular-cli.json', configJson => {
      const app = configJson['apps'][0];
      app['outDir'] = './';
    }))
    .then(() => expectToFail(() => ng('build')))
    .then(() => expectToFail(() => ng('serve')))
    .then(() => expectToFail(() => ng('eject')));
}



