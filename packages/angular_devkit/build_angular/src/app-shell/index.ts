/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
  targetFromTargetString,
} from '@angular-devkit/architect';
import { JsonObject, experimental, join, normalize, resolve, schema } from '@angular-devkit/core';
import { NodeJsSyncHost } from '@angular-devkit/core/node';
import * as fs from 'fs';
import * as path from 'path';
import { readTsconfig } from '../angular-cli-files/utilities/read-tsconfig';
import { augmentAppWithServiceWorker } from '../angular-cli-files/utilities/service-worker';
import { BrowserBuilderOutput } from '../browser';
import { Schema as BrowserBuilderSchema } from '../browser/schema';
import { ServerBuilderOutput } from '../server';
import { Schema as BuildWebpackAppShellSchema } from './schema';

async function _renderUniversal(
  options: BuildWebpackAppShellSchema,
  context: BuilderContext,
  browserResult: BrowserBuilderOutput,
  serverResult: ServerBuilderOutput,
): Promise<BrowserBuilderOutput> {
  const browserIndexOutputPath = path.join(browserResult.outputPath || '', 'index.html');
  const indexHtml = fs.readFileSync(browserIndexOutputPath, 'utf8');
  const serverBundlePath = await _getServerModuleBundlePath(options, context, serverResult);
  const root = context.workspaceRoot;

  // Get browser target options.
  const browserTarget = targetFromTargetString(options.browserTarget);
  const rawBrowserOptions = await context.getTargetOptions(browserTarget);
  const browserBuilderName = await context.getBuilderNameForTarget(browserTarget);
  const browserOptions = await context.validateOptions<JsonObject & BrowserBuilderSchema>(
    rawBrowserOptions,
    browserBuilderName,
  );

  // Determine if browser app was compiled using Ivy.
  const { options: compilerOptions } = readTsconfig(browserOptions.tsConfig, context.workspaceRoot);
  const ivy = compilerOptions.enableIvy;

  // Initialize zone.js
  const zonePackage = require.resolve('zone.js', { paths: [root] });
  await import(zonePackage);

  // Load platform server module renderer
  const platformServerPackage = require.resolve('@angular/platform-server', { paths: [root] });
  const renderOpts = {
    document: indexHtml,
    url: options.route,
  };

  // Render app to HTML using Ivy or VE
  const html = await import(platformServerPackage)
    // tslint:disable-next-line:no-implicit-dependencies
    .then((m: typeof import('@angular/platform-server')) =>
      ivy
        ? m.renderModule(require(serverBundlePath).AppServerModule, renderOpts)
        : m.renderModuleFactory(require(serverBundlePath).AppServerModuleNgFactory, renderOpts),
    );

  // Overwrite the client index file.
  const outputIndexPath = options.outputIndexPath
    ? path.join(root, options.outputIndexPath)
    : browserIndexOutputPath;

  fs.writeFileSync(outputIndexPath, html);

  if (browserOptions.serviceWorker) {
    const host = new NodeJsSyncHost();
    // Create workspace.
    const registry = new schema.CoreSchemaRegistry();
    registry.addPostTransform(schema.transforms.addUndefinedDefaults);

    const workspace = await experimental.workspace.Workspace.fromPath(
      host,
      normalize(context.workspaceRoot),
      registry,
    );
    const projectName = context.target ? context.target.project : workspace.getDefaultProjectName();

    if (!projectName) {
      throw new Error('Must either have a target from the context or a default project.');
    }
    const projectRoot = resolve(workspace.root, normalize(workspace.getProject(projectName).root));

    await augmentAppWithServiceWorker(
      host,
      normalize(root),
      projectRoot,
      join(normalize(root), browserOptions.outputPath),
      browserOptions.baseHref || '/',
      browserOptions.ngswConfigPath,
    );
  }

  return browserResult;
}

async function _getServerModuleBundlePath(
  options: BuildWebpackAppShellSchema,
  context: BuilderContext,
  serverResult: ServerBuilderOutput,
) {
  if (options.appModuleBundle) {
    return path.join(context.workspaceRoot, options.appModuleBundle);
  } else {
    const outputPath = serverResult.outputPath || '/';
    const files = fs.readdirSync(outputPath, 'utf8');
    const re = /^main\.(?:[a-zA-Z0-9]{20}\.)?(?:bundle\.)?js$/;
    const maybeMain = files.filter(x => re.test(x))[0];

    if (!maybeMain) {
      throw new Error('Could not find the main bundle.');
    } else {
      return path.join(outputPath, maybeMain);
    }
  }
}

async function _appShellBuilder(
  options: JsonObject & BuildWebpackAppShellSchema,
  context: BuilderContext,
): Promise<BuilderOutput> {
  const browserTarget = targetFromTargetString(options.browserTarget);
  const serverTarget = targetFromTargetString(options.serverTarget);

  // Never run the browser target in watch mode.
  // If service worker is needed, it will be added in _renderUniversal();
  const browserTargetRun = await context.scheduleTarget(browserTarget, {
    watch: false,
    serviceWorker: false,
  });
  const serverTargetRun = await context.scheduleTarget(serverTarget, {});

  try {
    const [browserResult, serverResult] = await Promise.all([
      (browserTargetRun.result as {}) as BrowserBuilderOutput,
      serverTargetRun.result,
    ]);

    if (browserResult.success === false || browserResult.outputPath === undefined) {
      return browserResult;
    } else if (serverResult.success === false) {
      return serverResult;
    }

    return await _renderUniversal(options, context, browserResult, serverResult);
  } catch (err) {
    return { success: false, error: err.message };
  } finally {
    // Just be good citizens and stop those jobs.
    await Promise.all([browserTargetRun.stop(), serverTargetRun.stop()]);
  }
}

export default createBuilder(_appShellBuilder);
