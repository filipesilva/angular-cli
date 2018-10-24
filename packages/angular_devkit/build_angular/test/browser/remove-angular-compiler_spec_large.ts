/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { DefaultTimeout, TestLogger, runTargetSpec } from '@angular-devkit/architect/testing';
import { join, normalize, virtualFs } from '@angular-devkit/core';
import { tap } from 'rxjs/operators';
import { browserTargetSpec, host } from '../utils';


describe('Browser Builder removeAngularCompiler', () => {
  const outputPath = normalize('dist');

  beforeEach(done => host.initialize().toPromise().then(done, done.fail));
  afterEach(done => host.restore().toPromise().then(done, done.fail));

  it('works', (done) => {
    const overrides = {
      optimization: true, aot: true, buildOptimizer: true, removeAngularCompiler: true,
    };

    runTargetSpec(host, browserTargetSpec, overrides, DefaultTimeout * 3).pipe(
      tap((buildEvent) => expect(buildEvent.success).toBe(true)),
      tap(() => {
        const fileName = join(outputPath, 'main.js');
        const content = virtualFs.fileBufferToString(host.scopedSync().read(fileName));
        expect(content).toContain('The Angular Compiler was removed by Angular CLI.');
      }),
    ).toPromise().then(done, done.fail);
  });

  it('retains compiler when set to false', (done) => {
    const overrides = {
      optimization: true, aot: true, buildOptimizer: true, removeAngularCompiler: false,
    };

    runTargetSpec(host, browserTargetSpec, overrides, DefaultTimeout * 3).pipe(
      tap((buildEvent) => expect(buildEvent.success).toBe(true)),
      tap(() => {
        const fileName = join(outputPath, 'main.js');
        const content = virtualFs.fileBufferToString(host.scopedSync().read(fileName));
        expect(content).not.toContain('The Angular Compiler was removed by Angular CLI.');
      }),
    ).toPromise().then(done, done.fail);
  });

  it('fails build if the compiler is imported outside of core', (done) => {
    const overrides = {
      optimization: true, aot: true, buildOptimizer: true, removeAngularCompiler: true,
    };

    host.appendToFile('src/main.ts', `import * as cpl from '@angular/compiler';console.log(cpl);`);
    const logger = new TestLogger('rebuild-type-errors');

    runTargetSpec(host, browserTargetSpec, overrides, DefaultTimeout * 3, logger).pipe(
      tap((buildEvent) => {
        expect(buildEvent.success).toBe(false);
        expect(logger.includes('Angular CLI removes the @angular/compiler package')).toBe(true);
        expect(logger.includes('main.ts')).toBe(true);

      }),
    ).toPromise().then(done, done.fail);
  });

  it('passes build if the compiler is imported outside of core and flag is false', (done) => {
    const overrides = {
      optimization: true, aot: true, buildOptimizer: true, removeAngularCompiler: false,
    };

    host.appendToFile('src/main.ts', `import * as cpl from '@angular/compiler';console.log(cpl);`);
    const logger = new TestLogger('rebuild-type-errors');

    runTargetSpec(host, browserTargetSpec, overrides, DefaultTimeout * 3, logger).pipe(
      tap((buildEvent) => {
        expect(buildEvent.success).toBe(true);
        expect(logger.includes('Angular CLI removes the @angular/compiler package')).toBe(false);
        expect(logger.includes('main.ts')).toBe(false);

      }),
    ).toPromise().then(done, done.fail);
  });
});
