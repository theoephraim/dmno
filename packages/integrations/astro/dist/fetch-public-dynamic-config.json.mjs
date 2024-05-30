import { __name } from './chunk-G5GHKT7C.mjs';

// src/fetch-public-dynamic-config.json.ts
var publicDynamicKeys = globalThis._DMNO_PUBLIC_DYNAMIC_KEYS;
var GET = /* @__PURE__ */ __name(async ({ params, request }) => {
  const publicDynamicEnvObj = {};
  for (const itemKey of publicDynamicKeys) {
    publicDynamicEnvObj[itemKey] = globalThis.DMNO_PUBLIC_CONFIG[itemKey];
  }
  return new Response(JSON.stringify(publicDynamicEnvObj));
}, "GET");

export { GET };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=fetch-public-dynamic-config.json.mjs.map