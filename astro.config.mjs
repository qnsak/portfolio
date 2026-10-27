import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  output: 'static',
  site: 'https://qnsak.github.io',
  base: '/portfolio',
  integrations: [react()],
});
