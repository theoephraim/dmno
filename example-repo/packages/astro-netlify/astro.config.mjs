import dmnoAstroIntegration from '@dmno/astro-integration';
import { defineConfig } from 'astro/config';
import netlify from "@astrojs/netlify";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [dmnoAstroIntegration()],
  output: "server",
  
  adapter: netlify({
    edgeMiddleware: true,
  }),

  // adapter: node({
  //   mode: "standalone"
  // })
});