import { __name } from './chunk-G5GHKT7C.mjs';
import 'dmno/inject';

var sensitiveItemKeys = globalThis._DMNO_SENSITIVE_KEYS;
var sensitiveValueLookup = {};
for (const itemKey of sensitiveItemKeys) {
  const val = globalThis.DMNO_CONFIG[itemKey];
  if (val)
    sensitiveValueLookup[itemKey] = val.toString();
}
var onRequest = /* @__PURE__ */ __name(async (context, next) => {
  const response = await next();
  const bodyText = await response.clone().text();
  for (const itemKey in sensitiveValueLookup) {
    if (bodyText.includes(sensitiveValueLookup[itemKey])) {
      throw new Error(`\u{1F6A8} DETECTED LEAKED CONFIG ITEM! ${itemKey}`);
    }
  }
}, "onRequest");

export { onRequest };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=astro-middleware.mjs.map