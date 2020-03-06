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
import { join, normalize, schema, workspaces } from '@angular-devkit/core';
import { NodeJsSyncHost } from '@angular-devkit/core/node';
import * as path from 'path';
import { BuildResult } from './index';


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
      new WorkspaceNodeModulesArchitectHost(workspace, workspaceRoot));
    architect = new Architect(testArchitectHost, registry);
  }

  describe('basic app', () => {
    const ngJsonPath = path.join(path.dirname(__filename), '../../test/basic-app/angular.json');
    const workspaceRoot = path.dirname(require.resolve(ngJsonPath));
    const outputPath = join(normalize(workspaceRoot), 'dist');

    beforeEach(async () => {
      await createArchitect(workspaceRoot);
    });

    it('works', async () => {
      const run = await architect.scheduleTarget({ project: 'app', target: 'build' });
      const output = await run.result;

      expect(output.success).toBe(true);
      expect(await vfHost.exists(join(outputPath, 'bundle.js')).toPromise()).toBe(true);
      await run.stop();
    });

    it('works and returns emitted files', async () => {
      const run = await architect.scheduleTarget({ project: 'app', target: 'build' });
      const output = await run.result as BuildResult;

      expect(output.success).toBe(true);
      expect(output.emittedFiles).toContain({
        id: 'main',
        name: 'main',
        initial: true,
        file: 'bundle.js',
        extension: '.js',
      });

      await run.stop();
    });
  });
});
