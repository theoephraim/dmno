import { __name } from './chunk-TXZD2JN3.mjs';

// src/app-init/dmno-globals-injector.ts
var processExists = !!globalThis.process;
var originalProcessEnv = {};
try {
  originalProcessEnv = structuredClone(globalThis.process.env);
} catch (err) {
  console.log("error cloning process.env", err);
}
function injectDmnoGlobals(opts) {
  const publicDynamicKeys = [];
  const sensitiveKeys = [];
  if (!opts && globalThis.DMNO_CONFIG) {
    return {};
  }
  let injectedDmnoEnv = opts?.injectedConfig;
  if (!injectedDmnoEnv && globalThis._DMNO_INJECTED_ENV) {
    injectedDmnoEnv = globalThis._DMNO_INJECTED_ENV;
  } else if (!injectedDmnoEnv && globalThis.process.env.DMNO_INJECTED_ENV) {
    injectedDmnoEnv = JSON.parse(globalThis.process.env.DMNO_INJECTED_ENV);
  }
  if (!injectedDmnoEnv) {
    console.log(globalThis._DMNO_INJECTED_ENV);
    console.log(globalThis.process.env.DMNO_INJECTED_ENV);
    throw new Error("Unable to find `process.env.DMNO_INJECTED_ENV` - run this command via `dmno run` - see https://dmno.dev/docs/reference/cli/run for more info");
  }
  if (processExists) {
    globalThis.process.env = { ...originalProcessEnv };
  }
  const rawConfigObj = {};
  const rawPublicConfigObj = {};
  const staticReplacements = {};
  for (const itemKey in injectedDmnoEnv) {
    const injectedItem = injectedDmnoEnv[itemKey];
    const val = injectedItem.value;
    if (processExists) {
      if (val === void 0 || val === null) {
        globalThis.process.env[itemKey] = "";
      } else {
        globalThis.process.env[itemKey] = val.toString();
      }
    }
    if (!injectedItem.sensitive) {
      rawPublicConfigObj[itemKey] = "*";
      rawConfigObj[itemKey] = "*";
    } else {
      sensitiveKeys.push(itemKey);
      rawConfigObj[itemKey] = "*";
      if (val) {
        ({
          value: injectedItem.value.toString(),
          masked: "****"
          // TODO:
        });
      }
    }
    if (!injectedItem.sensitive && injectedItem.dynamic) {
      publicDynamicKeys.push(itemKey);
    }
    if (injectedItem.sensitive) {
      if (!injectedItem.dynamic) {
        staticReplacements[`DMNO_CONFIG.${itemKey}`] = JSON.stringify(injectedItem.value);
      }
    } else {
      if (!injectedItem.dynamic) {
        staticReplacements[`DMNO_PUBLIC_CONFIG.${itemKey}`] = JSON.stringify(injectedItem.value);
        staticReplacements[`DMNO_CONFIG.${itemKey}`] = JSON.stringify(injectedItem.value);
      }
    }
  }
  globalThis.DMNO_CONFIG = new Proxy(rawConfigObj, {
    get(o, key) {
      const keyStr = key.toString();
      if (opts?.trackingObject)
        opts.trackingObject[keyStr] = true;
      if (key in injectedDmnoEnv) {
        if (opts?.onItemAccess)
          opts.onItemAccess(injectedDmnoEnv[keyStr]);
        return injectedDmnoEnv[keyStr].value;
      }
      throw new Error(`\u274C ${keyStr} is not a config item (1)`);
    }
  });
  globalThis.DMNO_PUBLIC_CONFIG = new Proxy(rawPublicConfigObj, {
    get(o, key) {
      const keyStr = key.toString();
      if (opts?.trackingObject)
        opts.trackingObject[keyStr] = true;
      if (injectedDmnoEnv[keyStr]?.sensitive) {
        throw new Error(`\u274C ${keyStr} is not a public config item! Use \`DMNO_CONFIG.${keyStr}\` instead`);
      }
      if (key in injectedDmnoEnv) {
        if (opts?.onItemAccess)
          opts.onItemAccess(injectedDmnoEnv[keyStr]);
        return injectedDmnoEnv[keyStr].value;
      }
      throw new Error(`\u274C ${keyStr} is not a config item (2)`);
    }
  });
  globalThis._DMNO_PUBLIC_DYNAMIC_KEYS = publicDynamicKeys;
  globalThis._DMNO_SENSITIVE_KEYS = sensitiveKeys;
  return { injectedDmnoEnv, staticReplacements };
}
__name(injectDmnoGlobals, "injectDmnoGlobals");

export { injectDmnoGlobals };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=chunk-RXNCD2W6.mjs.map