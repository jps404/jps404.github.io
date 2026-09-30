import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://jps404.github.io',
  output: 'static',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'always', format: 'directory' },
  compressHTML: true,
});
