import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.jedsolomon.com',
  output: 'static',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'always', format: 'directory' },
  compressHTML: true,
});
