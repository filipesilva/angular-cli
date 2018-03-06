import {execAndWaitForOutputToMatch, killAllProcesses} from '../../utils/process';
import {getGlobalVariable} from '../../utils/env';


export default function() {
  // TODO(architect): reenable, validate, then delete this test. It is now in devkit/build-webpack.
  return;

  // Skip this in ejected tests.
  if (getGlobalVariable('argv').eject) {
    return Promise.resolve();
  }

  return Promise.resolve()
    // Check that ng serve has eval sourcemaps by default.
    .then(() => execAndWaitForOutputToMatch('ng', ['serve'], /: Compiled successfully/))
    .then((output) => {
      const stdout = output.stdout;
      if (/\.js\.map/.test(stdout)) {
        throw new Error('Expected eval sourcemap but file sourcemap was present instead.');
      }
    })
    .then(() => killAllProcesses(), (err: any) => {
      killAllProcesses();
      throw err;
    });
}
