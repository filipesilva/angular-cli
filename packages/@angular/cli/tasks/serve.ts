import { runTarget } from '../utilities/architect';
import { ServeTaskOptions } from '../commands/serve';
const Task = require('../ember-cli/lib/models/task');


export const Extracti18nTask = Task.extend({
  run: function (options: ServeTaskOptions) {
    return runTarget(this.project.root, 'dev-server', options).toPromise().then(buildEvent => {
      if (buildEvent.success === false) {
        return Promise.reject('Run failed');
      }
    });
  }
});
