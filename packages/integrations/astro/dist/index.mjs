import './chunk-G5GHKT7C.mjs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { injectDmnoGlobals } from 'dmno/injector';

var enableDynamicPublicClientLoading = false;
var astroCommand = "build";
var __dirname = dirname(fileURLToPath(import.meta.url));
throw new Error("UH OH!");
var dmnoConfigValid = true;
var publicDynamicItemKeys = [];
var sensitiveItemKeys = [];
var sensitiveValueLookup = {};
var viteDefineReplacements = {};
async function reloadDmnoConfig() {
  if (astroCommand === "dev") ; else {
    const { staticReplacements } = injectDmnoGlobals();
    viteDefineReplacements = staticReplacements || {};
  }
  publicDynamicItemKeys = globalThis._DMNO_PUBLIC_DYNAMIC_KEYS;
  sensitiveItemKeys = globalThis._DMNO_SENSITIVE_KEYS;
  sensitiveValueLookup = {};
  for (const itemKey of sensitiveItemKeys) {
    const val = globalThis.DMNO_CONFIG[itemKey];
    if (val)
      sensitiveValueLookup[itemKey] = val.toString();
  }
}
var dmnoHasTriggeredReload = false;
function dmnoAstroIntegration(dmnoIntegrationOpts) {
  return {
    name: "dmno-astro-integration",
    hooks: {
      "astro:config:setup": async (opts) => {
        if (dmnoHasTriggeredReload) {
          await reloadDmnoConfig();
          dmnoHasTriggeredReload = false;
        }
        const {
          isRestart,
          logger,
          addDevToolbarApp,
          updateConfig,
          injectScript,
          addMiddleware,
          injectRoute
        } = opts;
        astroCommand = opts.command;
        if (opts.command === "build" && !dmnoConfigValid) {
          throw new Error("DMNO config is not valid");
        }
        if (opts.config.output === "static") {
          enableDynamicPublicClientLoading = false;
        } else {
          enableDynamicPublicClientLoading = publicDynamicItemKeys.length > 0;
        }
        updateConfig({
          vite: {
            plugins: [{
              name: "astro-vite-plugin",
              async config(config, env) {
                config.define = {
                  ...config.define,
                  ...viteDefineReplacements
                };
              },
              // async configureServer(server) {
              //   // console.log('astro vite plugin configure server');
              //   if (!isRestart) {
              //     dmnoConfigClient.eventBus.on('reload', () => {
              //       opts.logger.info('💫 dmno config updated - restarting astro server');
              //       // eslint-disable-next-line @typescript-eslint/no-floating-promises
              //       server.restart();
              //       dmnoHasTriggeredReload = true;
              //     });
              //   }
              // },
              // leak detection in _built_ files
              transform(src, id) {
                if (id === "astro:scripts/page-ssr.js")
                  return src;
                for (const itemKey in sensitiveValueLookup) {
                  if (src.includes(sensitiveValueLookup[itemKey])) {
                    throw new Error(`\u{1F6A8} DETECTED LEAKED CONFIG ITEM "${itemKey}" in file - ${id}`);
                  }
                }
                return src;
              }
            }]
          }
        });
        injectScript("page", [
          // client side DMNO_PUBLIC_CONFIG proxy object
          // TODO: ideally we can throw a better error if we know its a dynamic item and we aren't loading dynamic stuff
          `
            window._DMNO_PUBLIC_STATIC_CONFIG = window.DMNO_PUBLIC_CONFIG || {};
            window.DMNO_PUBLIC_CONFIG = new Proxy({}, {
              get(o, key) {
                if (key in window._DMNO_PUBLIC_STATIC_CONFIG) {
                  return window._DMNO_PUBLIC_STATIC_CONFIG[key];
                }
          `,
          // if dynamic public config is enabled, we'll fetch it on-demand
          // this is fine because we only hit this block if the rewrite failed
          // (or wasnt found in the static vars during dev)
          enableDynamicPublicClientLoading ? `
                if (!window._DMNO_PUBLIC_DYNAMIC_CONFIG) {
                  const request = new XMLHttpRequest();
                  request.open("GET", "/public-dynamic-config.json", false); // false means sync/blocking!
                  request.send(null);

                  if (request.status !== 200) {
                    throw new Error('Failed to load public dynamic DMNO config');
                  }
                  window._DMNO_PUBLIC_DYNAMIC_CONFIG = JSON.parse(request.responseText);
                  
                  console.log('loaded public dynamic config', window._DMNO_PUBLIC_DYNAMIC_CONFIG);
                }
                
                if (key in window._DMNO_PUBLIC_DYNAMIC_CONFIG) {
                  return window._DMNO_PUBLIC_DYNAMIC_CONFIG[key];
                }
          ` : `
                if (${JSON.stringify(publicDynamicItemKeys)}.includes(key)) {
                  throw new Error(\`\u274C Unable to access dynamic config item \\\`\${key}\\\` in Astro "static" output mode\`);
                }
          `,
          // in dev mode, we'll give a more detailed error message, letting the user know if they tried to access a sensitive or non-existant item
          astroCommand === "dev" ? `
                if (${JSON.stringify(sensitiveItemKeys)}.includes(key)) {
                  throw new Error(\`\u274C \\\`DMNO_PUBLIC_CONFIG.\${key}\\\` not found - it is sensitive and must be accessed via DMNO_CONFIG on the server only\`);
                } else {
                  throw new Error(\`\u274C \\\`DMNO_PUBLIC_CONFIG.\${key}\\\` not found - it does not exist in your config schema\`);  
                }
          ` : ` 
                throw new Error(\`\u274C \\\`DMNO_PUBLIC_CONFIG.\${key}\\\` not found - it may be sensitive or it may not exist at all\`);
          `,
          `
              }
            });
          `,
          // DMNO_CONFIG proxy object just to give a helpful error message
          // TODO: we could make this a warning instead? because it does get replaced during the build and doesn't actually harm anything
          `
            window.DMNO_CONFIG = new Proxy({}, {
              get(o, key) {
                throw new Error(\`\u274C You cannot access DMNO_CONFIG on the client, try DMNO_PUBLIC_CONFIG.\${key} instead \`);
              }
            });
          `
        ].join("\n"));
        if (enableDynamicPublicClientLoading) {
          injectRoute({
            pattern: "public-dynamic-config.json",
            // Use relative path syntax for a local route.
            entrypoint: `${__dirname}/fetch-public-dynamic-config.json.mjs`
          });
        }
        addMiddleware({
          entrypoint: `${__dirname}/astro-middleware.mjs`,
          order: "post"
          // not positive on this?
        });
        addDevToolbarApp(`${__dirname}/dev-toolbar-app.mjs`);
      },
      "astro:build:done": async (opts) => {
        if (!opts.pages.length)
          return;
      }
    }
  };
}
var src_default = dmnoAstroIntegration;

export { src_default as default };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.mjs.map