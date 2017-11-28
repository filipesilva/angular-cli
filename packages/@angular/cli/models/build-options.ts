export interface BuildOptions {
  target?: string;
  environment?: string;
  outputPath?: string;
  aot?: boolean;
  sourcemaps?: boolean;
  evalSourcemaps?: boolean;
  vendorChunk?: boolean;
  commonChunk?: boolean;
  baseHref?: string;
  deployUrl?: string;
  verbose?: boolean;
  progress?: boolean;
  i18nFile?: string;
  i18nFormat?: string;
  i18nOutFile?: string;
  i18nOutFormat?: string;
  locale?: string;
  missingTranslation?: string;
  extractCss?: boolean;
  bundleDependencies?: 'none' | 'all';
  watch?: boolean;
  outputHashing?: string;
  poll?: number;
  app?: string;
  deleteOutputPath?: boolean;
  preserveSymlinks?: boolean;
  extractLicenses?: boolean;
  showCircularDependencies?: boolean;
  buildOptimizer?: boolean;
  namedChunks?: boolean;
  subresourceIntegrity?: boolean;
  forceTsCommonjs?: boolean;
  serviceWorker?: boolean;
  skipAppShell?: boolean;
  cache?: boolean;
}
