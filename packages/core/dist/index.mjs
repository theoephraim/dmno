export { injectDmnoGlobals } from './chunk-RXNCD2W6.mjs';
import { createDmnoDataType, ValidationError, createDebugTimer, singleton, detectPackageManagerSync, formatError, getItemSummary, createResolver, processInlineResolverDef } from './chunk-FI7BWWVA.mjs';
export { CoercionError, ConfigPath, ConfigValueResolver, DmnoBaseTypes, DmnoConfigItem, DmnoConfigItemBase, DmnoDataType, DmnoPickedConfigItem, DmnoPlugin, DmnoPluginInputItem, DmnoService, DmnoWorkspace, InjectPluginInputByType, NodeEnvType, OverrideSource, ResolutionError, ResolverContext, SchemaError, ValidationError, _PluginInputTypesSymbol, beginServiceLoadPlugins, beginWorkspaceLoadPlugins, cacheFunctionResult, configPath, createDmnoDataType, createResolver, createdPickedValueResolver, defineDmnoService, defineDmnoWorkspace, finishServiceLoadPlugins, loadDotEnvIntoObject, loadServiceDotEnvFiles, parseDotEnvContents, processInlineResolverDef } from './chunk-FI7BWWVA.mjs';
import { createDeferredPromise } from './chunk-W4DES726.mjs';
import { __name } from './chunk-TXZD2JN3.mjs';
import _ from 'lodash-es';
import { spawn } from 'child_process';
import mitt from 'mitt';
import Debug from 'debug';

// src/config-engine/common-types.ts
var PG_REGEX = /(postgres(?:ql)?):\/\/(?:([^@\s]+)@)?([^/\s]+)(?:\/(\w+))?(?:\?(.+))?/;
var postgresConnectionString = createDmnoDataType({
  extends: "string",
  sensitive: true,
  typeDescription: "Postgres connection url",
  externalDocs: {
    description: "explanation from prisma docs",
    url: "https://www.prisma.io/dataguide/postgresql/short-guides/connection-uris#a-quick-overview"
  },
  ui: {
    icon: "akar-icons:postgresql-fill",
    color: "336791"
    // postgres brand color :)
  },
  validate(val, ctx) {
    if (!PG_REGEX.test(val))
      return new ValidationError("Invalid postgres connection url");
  }
});
var CommonDataTypes = {
  postgresConnectionString
};

// src/config-engine/resolvers/formula-resolver.ts
var dmnoFormula = /* @__PURE__ */ __name((formula) => createResolver({
  icon: "gravity-ui:curly-brackets-function",
  label: `formula: ${formula}`,
  async resolve(ctx) {
    return `${formula} = result`;
  }
}), "dmnoFormula");
var switchBy = /* @__PURE__ */ __name((switchByKey, branches) => {
  return createResolver({
    icon: "gravity-ui:branches-right",
    label: `switch by ${switchByKey}`,
    resolveBranches: _.map(branches, (itemDef, itemKey) => ({
      // TODO: do we want to use a special symbol? or pass default as different arg?
      isDefault: itemKey === "_default" || itemKey === "_",
      condition: (ctx) => ctx.get(switchByKey) === itemKey,
      id: itemKey,
      label: `${switchByKey} === "${itemKey}"`,
      resolver: processInlineResolverDef(itemDef)
    }))
  });
}, "switchBy");
var switchByNodeEnv = /* @__PURE__ */ __name((branches) => switchBy("NODE_ENV", branches), "switchByNodeEnv");
var switchByDmnoEnv = /* @__PURE__ */ __name((branches) => switchBy("DMNO_ENV", branches), "switchByDmnoEnv");
var debug = Debug("dmno");
var debugTimer = createDebugTimer("dmno:loader-client");
function getCurrentPackageName() {
  if (process.env.npm_package_name !== void 0)
    return process.env.npm_package_name;
  if (process.env.PNPM_PACKAGE_NAME !== void 0)
    return process.env.PNPM_PACKAGE_NAME;
}
__name(getCurrentPackageName, "getCurrentPackageName");
var ConfigServerClient = class {
  static {
    __name(this, "ConfigServerClient");
  }
  eventBus = mitt();
  serverId;
  ipc;
  constructor() {
    this.ipc = singleton;
    if (process.env.DMNO_CONFIG_SERVER_UUID) {
      this.serverId = process.env.DMNO_CONFIG_SERVER_UUID;
    } else {
      this.serverId = crypto.randomUUID();
      this.initOwnedConfigServer();
    }
    this.initIpcClient();
  }
  isShuttingDown = false;
  shutdown() {
    if (this.isShuttingDown)
      return;
    this.isShuttingDown = true;
    this.ipc.disconnect("dmno");
    if (this.ownedDmnoConfigServerProcess) {
      this.ownedDmnoConfigServerProcess.kill(2);
    }
  }
  ownedDmnoConfigServerProcess;
  initOwnedConfigServer() {
    const { packageManager } = detectPackageManagerSync();
    this.ownedDmnoConfigServerProcess = spawn(packageManager, "exec -- dmno dev --silent".split(" "), {
      stdio: "inherit",
      env: {
        ...process.env,
        DMNO_CONFIG_SERVER_UUID: this.serverId
        // PATH: process.env.PATH,
      }
    });
    process.on("SIGTERM", () => {
      this.shutdown();
    });
    process.on("exit", () => {
      this.shutdown();
    });
    this.ownedDmnoConfigServerProcess.on("close", (code, signal) => {
    });
    this.ownedDmnoConfigServerProcess.on("disconnect", () => {
    });
    this.ownedDmnoConfigServerProcess.on("error", (err) => {
    });
    this.ownedDmnoConfigServerProcess.on("exit", (code, signal) => {
      if (!this.isShuttingDown)
        process.exit(code || 1);
    });
  }
  ipcReadyDeferred = createDeferredPromise();
  initIpcClient() {
    this.ipc.config.id = "dmno";
    this.ipc.config.retry = 1500;
    this.ipc.config.silent = true;
    debugTimer("begin ipc client connection");
    this.ipc.connectTo("dmno", `/tmp/${this.serverId}.dmno.sock`, () => {
      debugTimer("ipc client connectTo callback");
      this.ipc.of.dmno.on("connect", () => {
        debugTimer("ipc client connect event + emit ready");
        this.ipc.log("## connected to dmno ##", this.ipc.config.retry);
        this.ipc.of.dmno.emit("ready");
        this.ipcReadyDeferred.resolve();
      });
      this.ipc.of.dmno.on("disconnect", () => {
        this.ipc.log("disconnected from dmno");
      });
      this.ipc.of.dmno.on("event", (eventMessage) => {
        this.eventBus.emit(eventMessage.type, eventMessage.payload);
      });
      this.ipc.of.dmno.on("request-response", this.handleRequestResponse.bind(this));
    });
  }
  // Tools for request/response communication with the loader proces
  // by default IPC just lets us send messages. This tooling allows us to make "requests"
  // and then receive a response - with type-safety throughout the process
  requestCounter = 1;
  requests = {};
  // TS magic here lets us auto-complete the available request types
  // and have a typed payload and response :)
  async makeRequest(key, ...args) {
    await this.ipcReadyDeferred.promise;
    debug("making IPC request", key);
    const payload = args?.[0];
    const requestId = this.requestCounter++;
    this.requests[requestId] = {
      startedAt: /* @__PURE__ */ new Date(),
      deferredPromise: createDeferredPromise()
    };
    singleton.of.dmno.emit("request", {
      requestId,
      requestType: key,
      payload
    });
    return this.requests[requestId].deferredPromise.promise;
  }
  /** internal method called when receiving a request response */
  handleRequestResponse(responseMessage) {
    debug("handle req response", responseMessage);
    const req = this.requests[responseMessage.requestId];
    if (!req) {
      throw new Error(`IPC request not found: ${responseMessage.requestId}`);
    }
    if (responseMessage.error) {
      const e = new Error(responseMessage.error.message);
      e.stack = responseMessage.error.stack;
      req.deferredPromise.reject(e);
    } else {
      req.deferredPromise.resolve(responseMessage.response);
    }
    const reqTimeMs = +/* @__PURE__ */ new Date() - +req.startedAt;
    debug(`request took ${reqTimeMs}ms`);
    delete this.requests[responseMessage.requestId];
  }
  async getServiceConfig() {
    const packageName = getCurrentPackageName();
    if (packageName === "") {
      throw new Error('To use dmno, you must set a package "name" in your package.json file');
    }
    const serviceConfig = await this.makeRequest("get-resolved-config", { packageName });
    return serviceConfig;
  }
  static checkServiceIsValid(service, log = true) {
    if (service.configLoadError) {
      console.log("\u{1F6A8} \u{1F6A8} \u{1F6A8}  unable to load config schema  \u{1F6A8} \u{1F6A8} \u{1F6A8}");
      console.log(formatError(service.configLoadError));
      return false;
    }
    if (service.schemaErrors?.length) {
      console.log("\u{1F6A8} \u{1F6A8} \u{1F6A8}  config schema is invalid  \u{1F6A8} \u{1F6A8} \u{1F6A8}");
      console.log(service.schemaErrors.forEach((err) => {
        console.log(formatError(err));
      }));
      return false;
    }
    const failingItems = Object.values(service.config).filter((c) => !c.isValid);
    if (failingItems.length) {
      console.log("\u{1F6A8} \u{1F6A8} \u{1F6A8}  config is invalid  \u{1F6A8} \u{1F6A8} \u{1F6A8}");
      failingItems.forEach((item) => {
        console.log(getItemSummary(item));
        console.log();
      });
      return false;
    }
    return true;
  }
};
function serializedServiceToInjectedConfig(service) {
  const injectedEnv = {};
  for (const itemKey in service.config) {
    const configItem = service.config[itemKey];
    injectedEnv[itemKey] = {
      sensitive: !!configItem.dataType.sensitive,
      dynamic: !!configItem.isDynamic,
      value: configItem.resolvedValue
    };
  }
  return injectedEnv;
}
__name(serializedServiceToInjectedConfig, "serializedServiceToInjectedConfig");

export { CommonDataTypes, ConfigServerClient, dmnoFormula, serializedServiceToInjectedConfig, switchBy, switchByDmnoEnv, switchByNodeEnv };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.mjs.map