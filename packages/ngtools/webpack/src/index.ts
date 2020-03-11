/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export * from './angular_compiler_plugin';
export * from './interfaces';
export { ngcLoader as default } from './loader';

export const NgToolsLoader = __filename;

// TODO: figure out way of not exporting this, and not getting bazel error on build_angular:
// ERROR: /home/filipesilva/work/cli/packages/angular_devkit/build_angular/BUILD.bazel:55:1: Compiling TypeScri
// pt (devmode) //packages/angular_devkit/build_angular:build_angular failed (Exit 1)
// packages/angular_devkit/build_angular/src/angular-cli-files/plugins/webpack-rollup-loader.ts:17:44 - error T
// S2307: Cannot find module '@ngtools/webpack/src/virtual_file_system_decorator'.

// 17 import { VirtualFileSystemDecorator } from '@ngtools/webpack/src/virtual_file_system_decorator';
//                                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export { VirtualFileSystemDecorator } from './virtual_file_system_decorator';
