import dmnoAstroIntegration from '@dmno/astro-integration';
import { defineConfig } from 'astro/config';
import vue from "@astrojs/vue";
import node from "@astrojs/node";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  integrations: [
    dmnoAstroIntegration(),
    vue(),
    mdx(),
    {
      name: 'custom',
      hooks: {
        'astro:config:setup': async (opts) => {
          // detects leak
          opts.injectScript(
            // 'head-inline', // detects leak via middleware
            // 'before-hydration', // detects leak via vite plugin
            // 'page', // detects leak via vite plugin
            
            'page-ssr', // not leaked...
            `console.log(${JSON.stringify({
              secret: DMNO_CONFIG.SECRET_FOO,
              public: DMNO_CONFIG.PUBLIC_FOO
            })});`
            
          );
        },
      }
    },
  ],
  ...process.env.TEST_ASTRO_SSR && {
    output: "server",
    adapter: node({
      mode: "standalone"
    }),
  },
});

