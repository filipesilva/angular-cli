/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Architect } from '@angular-devkit/architect';
import { WorkspaceNodeModulesArchitectHost } from '@angular-devkit/architect/node';
import { TestingArchitectHost } from '@angular-devkit/architect/testing';
import { BuildResult } from '@angular-devkit/build-webpack';
import { join, normalize, schema, workspaces } from '@angular-devkit/core';
import { NodeJsSyncHost } from '@angular-devkit/core/node';
import 'jasmine';

// Default timeout for large specs is 2.5 minutes.
jasmine.DEFAULT_TIMEOUT_INTERVAL = 150000;

describe('Webpack Builder basic test', () => {
  let testArchitectHost: TestingArchitectHost;
  let architect: Architect;
  let vfHost: NodeJsSyncHost;

  async function createArchitect(workspaceRoot: string) {
    vfHost = new NodeJsSyncHost();

    const registry = new schema.CoreSchemaRegistry();
    registry.addPostTransform(schema.transforms.addUndefinedDefaults);

    const { workspace } = await workspaces.readWorkspace(
      workspaceRoot,
      workspaces.createWorkspaceHost(vfHost),
    );

    testArchitectHost = new TestingArchitectHost(workspaceRoot, workspaceRoot,
      // TODO: shouldn't need to be any, but getting this error:
      /*
test.ts:37:7 - error TS2345: Argument of type 'WorkspaceNodeModulesArchitectHost' is not assignable to parameter of type 'ArchitectHost<BuilderInfo>'.
  The types returned by 'loadBuilder(...)' are incompatible between these types.
    Type 'Promise<Builder<JsonObject>>' is not assignable to type 'Promise<Builder<JsonObject> | null>'.
      Type 'Builder<JsonObject>' is missing the following properties from type 'Builder<JsonObject>': [BuilderSymbol], [BuilderVersionSymbol]

37       new WorkspaceNodeModulesArchitectHost(workspace, workspaceRoot));

       */
      new WorkspaceNodeModulesArchitectHost(workspace, workspaceRoot) as any);
    architect = new Architect(testArchitectHost, registry);
  }

  describe('Angular app', () => {
    const workspaceRoot = __dirname;
    const outputPath = join(normalize(workspaceRoot), 'dist/');

    beforeEach(async () => {
      await createArchitect(workspaceRoot);
    });

    it('works', async () => {
      const run = await architect.scheduleTarget({ project: 'app', target: 'build-webpack' });
      const output = await run.result;

      expect(output.success).toBe(true);
      expect(await vfHost.exists(join(outputPath, 'main.js')).toPromise()).toBe(true);
      expect(await vfHost.exists(join(outputPath, 'polyfills.js')).toPromise()).toBe(true);
      await run.stop();
    });

    it('works and returns emitted files', async () => {
      const run = await architect.scheduleTarget({ project: 'app', target: 'build-webpack' });
      const output = await run.result as BuildResult;

      expect(output.success).toBe(true);
      expect(output.emittedFiles).toContain(
        { id: 'main', name: 'main', initial: true, file: 'main.js', extension: '.js' },
        { id: 'polyfills', name: 'polyfills', initial: true, file: 'polyfills.js', extension: '.js' },
      );

      await run.stop();
    });
  });
});
