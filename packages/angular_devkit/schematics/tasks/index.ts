/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// TODO: This folder should not be prefixed with `not-`, but its's needed to workaround a Bazel bug:
// https://github.com/bazelbuild/rules_nodejs/issues/313
export { NodePackageInstallTask } from './not-node-package/install-task';
export { NodePackageLinkTask } from './not-node-package/link-task';
export { RepositoryInitializerTask } from './repo-init/init-task';
export { RunSchematicTask } from './run-schematic/task';
export { TslintFixTask } from './tslint-fix/task';
