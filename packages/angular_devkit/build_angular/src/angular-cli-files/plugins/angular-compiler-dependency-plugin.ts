/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { tags } from '@angular-devkit/core';
import { Compiler } from 'webpack';


interface NormalModulePartial {
  rawRequest?: string;
  userRequest: string;
  reasons: { module: NormalModulePartial }[];
}

export class AngularCompilerDependencyPlugin {

  constructor() { }

  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap('remove-hash-plugin', compilation => {
      compilation.hooks.optimizeDependenciesBasic.tap('AngularBailoutsPlugin', (modules) => {
        const coreRequest = '@angular/core';
        const compilerRequest = '@angular/compiler';
        let coreModule: NormalModulePartial | undefined = undefined;
        let compilerModule: NormalModulePartial | undefined = undefined;

        for (const m of modules as NormalModulePartial[]) {
          // We use rawRequest to detect core because the userRequest field a file path.
          // But since compiler is an external module and not subject to loaders, the userRequest
          // field will contain the module name and rawRequest will not be defined.
          if (!coreModule && (m.rawRequest === coreRequest)) { coreModule = m; }
          if (!compilerModule && m.userRequest === compilerRequest) { compilerModule = m; }
          if (coreModule && compilerModule) {
            const nonCoreReasons = compilerModule.reasons
              .filter(r => r && r.module !== coreModule)
              .map(r => r.module.userRequest)
              .reduce((acc, curr) => acc.add(curr), new Set());

            if (nonCoreReasons.size > 0) {
              /* tslint:disable:max-line-length */
              compilation.errors.push(tags.stripIndents`
                Angular CLI removes the @angular/compiler package by default, but in this project we detect it is needed.
                Please add "removeAngularCompiler": false to your build configuration to remove this error.

                The following modules are importing the @angular/compiler package:
                ${Array.from(nonCoreReasons).join('\n')}
                `);
              /* tslint:enable:max-line-length */
            }
            break;
          }
        }
      });
    });
  }
}
