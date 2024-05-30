#!/usr/bin/env node
import { createDebugTimer, DmnoWorkspace, beginWorkspaceLoadPlugins, beginServiceLoadPlugins, DmnoService, finishServiceLoadPlugins, ConfigLoadError, joinAndCompact, getItemSummary, singleton, detectPackageManager, DmnoBaseTypes, formattedValue, formatError, asyncEachLimit, loadServiceDotEnvFiles, checkIsFileGitIgnored } from '../chunk-FI7BWWVA.mjs';
import { createDeferredPromise, tryCatch, promiseDelay } from '../chunk-W4DES726.mjs';
import { __name } from '../chunk-TXZD2JN3.mjs';
import kleur12 from 'kleur';
import Debug from 'debug';
import { Command } from 'commander';
import _6 from 'lodash-es';
import { AsyncLocalStorage } from 'async_hooks';
import { createServer } from 'vite';
import { ViteNodeRunner } from 'vite-node/client';
import { ViteNodeServer } from 'vite-node/server';
import { installSourcemapsSupport } from 'vite-node/source-map';
import fs4 from 'fs';
import path from 'path';
import readYamlFile from 'read-yaml-file';
import { fdir } from 'fdir';
import { optimize } from 'svgo';
import { checkbox, confirm, input, select } from '@inquirer/prompts';
import { execa } from 'execa';
import which from 'which';
import gradient from 'gradient-string';
import mitt from 'mitt';
import { outdent } from 'outdent';
import logUpdate from 'log-update';
import { fork, execSync } from 'child_process';
import { parse } from 'jsonc-parser';
import buildEsmResolver from 'esm-resolve';
import validatePackageName from 'validate-npm-package-name';
import boxen from 'boxen';
import * as acorn from 'acorn';
import tsPlugin from 'acorn-typescript';
import { diffWords } from 'diff';
import fs5 from 'fs/promises';

process.on("uncaughtException", (err) => {
  console.log(kleur12.red(`UNCAUGHT EXCEPTION: ${err.message}`));
  console.log(kleur12.red(`UNCAUGHT EXCEPTION: ${err.stack}`));
  process.exit(1);
});
var DmnoCommand = class extends Command {
  static {
    __name(this, "DmnoCommand");
  }
  /** array of usage examples */
  examples = [];
  /** attach a usage example - feeds into auto-generated docs */
  example(command, description = "") {
    this.examples.push({ command, description });
    return this;
  }
};
function addDocsCommand(program9) {
  program9.command("get-cli-schema", { hidden: true }).action(() => {
    const commandsToDocument = program9.commands.filter((c) => !c._hidden);
    const commandsSchema = commandsToDocument.map((subCmd) => ({
      command: subCmd.name(),
      aliases: subCmd.aliases(),
      description: subCmd.description(),
      more: _6.omit(subCmd, "parent"),
      ...subCmd instanceof DmnoCommand && {
        examples: subCmd.examples
      }
    }));
    console.log(JSON.stringify(commandsSchema, null, 2));
    process.exit();
  });
}
__name(addDocsCommand, "addDocsCommand");

// src/cli/lib/help-customizations.ts
function humanReadableArgName(arg) {
  const nameOutput = arg.name() + (arg.variadic === true ? "..." : "");
  return arg.required ? `<${nameOutput}>` : `[${nameOutput}]`;
}
__name(humanReadableArgName, "humanReadableArgName");
function customizeHelp(program9) {
  program9.configureHelp({
    // see https://github.com/tj/commander.js/blob/master/lib/help.js#L136
    subcommandTerm(cmd) {
      const args = cmd.registeredArguments.map((arg) => humanReadableArgName(arg)).join(" ");
      const cmdUsage = cmd._name + (cmd._aliases[0] ? `|${cmd._aliases[0]}` : "") + (cmd.options.length ? " [options]" : "") + (args ? ` ${args}` : "");
      return cmdUsage.replace("<external command>", "-- ...");
    }
  });
}
__name(customizeHelp, "customizeHelp");
async function setupViteServer(workspaceRootPath, hotReloadHandler) {
  const customPlugin = {
    name: "dmno-config-loader-plugin",
    // THIS IS IMPORTANT - it forces our dmno code to be "externalized" rather than bundled
    // otherwise we end up not loading the same code here in this file as within the config files
    // meaning we have 2 copies of classes and `instanceof` stops working
    enforce: "pre",
    // Run before the builtin 'vite:resolve' of Vite
    async resolveId(source, importer, options) {
      if (source === "dmno") {
        return {
          // pointing at dist/index is hard-coded...
          // we could extract the main entry point from the resolution instead?
          id: "/node_modules/dmno/dist/index.mjs"
          // I believe this path is appended to our "root" which is our workpace root
        };
      }
    },
    transform(code, id, options) {
      return code.replaceAll(/DMNO_CONFIG\.([\w\d.]+)/g, "ctx.get('$1')");
    },
    async handleHotUpdate(ctx) {
      if (ctx.file.includes("/.dmno/.typegen/"))
        return;
      if (!ctx.file.includes("/.dmno/"))
        return;
      ctx.modules.forEach((m) => {
        if (m.id)
          viteRunner.moduleCache.deleteByModuleId(m.id);
      });
      await hotReloadHandler(ctx);
    }
  };
  const server = await createServer({
    root: workspaceRootPath,
    appType: "custom",
    clearScreen: false,
    logLevel: "warn",
    plugins: [
      customPlugin
    ],
    // if the folder we are running in has its own vite.config file, it will try to use it
    // passing false here tells it to skip that process
    configFile: false,
    build: {
      // target: 'esnext',
      // rollupOptions: {
      //   external: 'dmno',
      // },
      //     // external: [...builtinModules, ...builtinModules.map((m) => `node:${m}`)],
      //   },
      // ssr: true,
    }
  });
  await server.pluginContainer.buildStart({});
  const node = new ViteNodeServer(server, {
    // debug: {
    //   dumpModules: true,
    // },
  });
  installSourcemapsSupport({
    getSourceMap: (source) => node.getSourceMap(source)
  });
  const viteRunner = new ViteNodeRunner({
    debug: true,
    root: server.config.root,
    base: server.config.base,
    // when having the server and runner in a different context,
    // you will need to handle the communication between them
    // and pass to this function
    async fetchModule(id) {
      return node.fetchModule(id);
    },
    async resolveId(id, importer) {
      return node.resolveId(id, importer);
    }
  });
  return { viteRunner };
}
__name(setupViteServer, "setupViteServer");
var debug = Debug("dmno:find-services");
async function readJsonFile(path3) {
  return JSON.parse(await fs4.promises.readFile(path3, "utf8"));
}
__name(readJsonFile, "readJsonFile");
async function pathExists(p) {
  try {
    await fs4.promises.access(p);
    return true;
  } catch {
    return false;
  }
}
__name(pathExists, "pathExists");
async function findDmnoServices(includeUnitialized = true) {
  const startAt = /* @__PURE__ */ new Date();
  const { packageManager, rootWorkspacePath: rootServicePath } = await detectPackageManager();
  let packagePatterns;
  let isMonorepo = false;
  debug("looking for workspace globs");
  if (packageManager === "pnpm") {
    const pnpmWorkspaceYamlPath = `${rootServicePath}/pnpm-workspace.yaml`;
    if (await pathExists(pnpmWorkspaceYamlPath)) {
      const pnpmWorkspacesYaml = await readYamlFile(`${rootServicePath}/pnpm-workspace.yaml`);
      isMonorepo = true;
      packagePatterns = pnpmWorkspacesYaml.packages;
      debug('looked in pnpm-workspace.yaml for "packages" field');
    } else {
      debug("no pnpm-workspace.yaml found");
    }
  } else if (packageManager === "yarn" || packageManager === "npm" || packageManager === "bun") {
    const rootPackageJson = await readJsonFile(`${rootServicePath}/package.json`);
    if (rootPackageJson.workspaces) {
      isMonorepo = true;
      packagePatterns = rootPackageJson.workspaces;
    }
    debug('looked in package.json for "workspaces" field');
  } else if (packageManager === "moon") {
    const moonWorkspacesYaml = await readYamlFile(`${rootServicePath}/.moon/workspace.yml`);
    isMonorepo = true;
    packagePatterns = moonWorkspacesYaml.projects;
    debug('looked in .moon/workspace.yml for "projects" field');
  }
  let packagePaths = [rootServicePath];
  if (isMonorepo && packagePatterns?.length) {
    const fullPackagePatterns = packagePatterns.map((gi) => path.resolve(`${rootServicePath}/${gi}`));
    const packageGlobs = fullPackagePatterns.filter((s) => s.includes("*"));
    const packageDirs = fullPackagePatterns.filter((s) => !s.includes("*"));
    const expandedPathsFromGlobs = await // tried a few different libs here (tiny-glob being the other main contender) and this is WAY faster especially with some tuning :)
    new fdir().withBasePath().onlyDirs().glob(...packageGlobs).exclude((dirName, _dirPath) => {
      return dirName === "node_modules";
    }).crawl(rootServicePath).withPromise();
    packagePaths.push(...packageDirs);
    packagePaths.push(...expandedPathsFromGlobs);
    packagePaths = packagePaths.map((p) => p.replace(/\/$/, ""));
    packagePaths = _6.uniq(packagePaths);
  }
  const workspacePackages = _6.compact(await Promise.all(packagePaths.map(async (packagePath) => {
    const packageJson = await tryCatch(
      async () => await readJsonFile(`${packagePath}/package.json`),
      (err) => {
        if (err.code === "ENOENT") {
          return void 0;
        }
        throw err;
      }
    );
    if (!packageJson)
      return;
    const dmnoFolderExists = await pathExists(`${packagePath}/.dmno`);
    return {
      isRoot: packagePath === rootServicePath,
      path: packagePath,
      relativePath: packagePath.substring(rootServicePath.length + 1),
      name: packageJson?.name || packagePath.split("/").pop(),
      dmnoFolder: dmnoFolderExists
    };
  })));
  const packageFromPwd = workspacePackages.find((p) => p.path === process.env.PWD);
  const packageManagerCurrentPackageName = process.env.npm_package_name || process.env.PNPM_PACKAGE_NAME;
  const packageFromCurrentPackageName = workspacePackages.find((p) => p.name === packageManagerCurrentPackageName);
  debug(`completed scanning in ${+/* @__PURE__ */ new Date() - +startAt}ms`);
  return {
    isMonorepo,
    packageManager,
    workspacePackages: includeUnitialized ? workspacePackages : _6.filter(workspacePackages, (p) => p.dmnoFolder),
    autoSelectedPackage: packageFromPwd || packageFromCurrentPackageName
  };
}
__name(findDmnoServices, "findDmnoServices");
var AUTOGENERATED_FILE_BANNER = `
// \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1}
// \u{1F6D1} THIS IS AN AUTOGENERATED FILE - DO NOT EDIT DIRECTLY \u{1F6D1}
// \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1}

`;
async function generateServiceTypes(service, writeToFile = false) {
  if (!service.isValid)
    return;
  const dtsSrc = await generateTypescriptTypes(service);
  if (writeToFile) {
    const typeGenFolderPath = `${service.path}/.dmno/.typegen`;
    await fs4.promises.mkdir(typeGenFolderPath, { recursive: true });
    await fs4.promises.writeFile(`${typeGenFolderPath}/schema.ts`, dtsSrc, "utf-8");
    await fs4.promises.writeFile(`${typeGenFolderPath}/global.d.ts`, `${AUTOGENERATED_FILE_BANNER}
import { DmnoGeneratedConfigSchema } from './schema';

declare global {
  /** ${service.serviceName} config global obj */
  const DMNO_CONFIG: DmnoGeneratedConfigSchema;
}
`, "utf-8");
    await fs4.promises.writeFile(`${typeGenFolderPath}/global-public.d.ts`, `${AUTOGENERATED_FILE_BANNER}
import { DmnoGeneratedPublicConfigSchema } from './schema';

declare global {
  /** ${service.serviceName} config global obj - public (non-sensitive) items only */
  const DMNO_PUBLIC_CONFIG: DmnoGeneratedPublicConfigSchema;
}
`, "utf-8");
  }
}
__name(generateServiceTypes, "generateServiceTypes");
var ICON_SIZE = 20;
async function fetchIconSvg(iconifyName, color = "808080", iconCacheFolder = "/tmp/dmno-icon-cache") {
  fs4.mkdirSync(iconCacheFolder, { recursive: true });
  const iconPath = `${iconCacheFolder}/${iconifyName}-${ICON_SIZE}.svg`;
  let svgSrc;
  if (fs4.existsSync(iconPath)) {
    const svgFileBuffer = await fs4.promises.readFile(iconPath, "utf-8");
    svgSrc = svgFileBuffer.toString();
  } else {
    const iconSvg = await fetch(`https://api.iconify.design/${iconifyName.replace(":", "/")}.svg?height=${ICON_SIZE}`);
    svgSrc = await iconSvg.text();
    const optimizedSvgResult = optimize(svgSrc, {
      multipass: true
    });
    await fs4.promises.writeFile(iconPath, optimizedSvgResult.data, "utf-8");
  }
  const hexColor = color.startsWith("#") ? color : `#${color}`;
  const colorizedSvg = svgSrc.replaceAll("currentColor", hexColor);
  return colorizedSvg;
}
__name(fetchIconSvg, "fetchIconSvg");
async function generateTypescriptTypes(service) {
  const tsSrc = [
    AUTOGENERATED_FILE_BANNER,
    "export type DmnoGeneratedConfigSchema = {"
  ];
  const publicKeys = [];
  for (const itemKey in service.config) {
    const configItem = service.config[itemKey];
    if (!configItem.type.getDefItem("sensitive"))
      publicKeys.push(itemKey);
    tsSrc.push(...await getTsDefinitionForItem(configItem, 1));
  }
  tsSrc.push("}");
  tsSrc.push("\n");
  const publicKeysForPick = _6.map(publicKeys, JSON.stringify).join(" | ");
  tsSrc.push(`export type DmnoGeneratedPublicConfigSchema = Pick<DmnoGeneratedConfigSchema, ${publicKeysForPick || "never"}>`);
  return tsSrc.join("\n");
}
__name(generateTypescriptTypes, "generateTypescriptTypes");
async function getTsDefinitionForItem(item, indentLevel = 0) {
  const i = _6.times(indentLevel, () => "  ").join("");
  const itemSrc = [];
  const jsDocLines = [];
  const itemType = item.type;
  let iconMd = "";
  const iconCachePath = `${item.parentService?.workspace.rootService.path}/.dmno/.icon-cache`;
  if (itemType.getDefItem("ui")?.icon) {
    const iconSvg = await fetchIconSvg(itemType.getDefItem("ui")?.icon, itemType.getDefItem("ui")?.color, iconCachePath);
    if (iconSvg) {
      iconMd = `![icon](data:image/svg+xml;utf-8,${encodeURIComponent(iconSvg)}) `;
    }
  }
  const label = itemType.getDefItem("summary") || item.key;
  jsDocLines.push(`**${label}**${itemType.getDefItem("sensitive") ? " \u{1F510} _sensitive_" : ""}`);
  if (itemType.getDefItem("description")) {
    jsDocLines.push(itemType.getDefItem("description"));
  }
  if (itemType.getDefItem("typeDescription")) {
    jsDocLines.push(`_${itemType.getDefItem("typeDescription")}_`);
  }
  if (iconMd) {
    jsDocLines.push(iconMd);
  }
  if (itemType.getDefItem("externalDocs")) {
    const externalDocs = itemType.getDefItem("externalDocs");
    const docsLink = _6.compact([externalDocs.url, externalDocs.description]).join(" | ");
    jsDocLines.push(`\u{1F4DA} {@link ${docsLink}}`);
  }
  if (jsDocLines.length > 1) ;
  if (jsDocLines.length === 1) {
    itemSrc.push(`/** ${jsDocLines[0]} */`);
  } else if (jsDocLines.length > 1) {
    itemSrc.push(...[
      "/**",
      ..._6.flatMap(jsDocLines, (line) => [` * ${line}`, " *"]),
      " */"
    ]);
  }
  const baseType = itemType.primitiveTypeFactory;
  let itemTsType = "string";
  if (baseType === DmnoBaseTypes.string) {
    itemTsType = "string";
  } else if (baseType === DmnoBaseTypes.number) {
    itemTsType = "number";
  } else if (baseType === DmnoBaseTypes.boolean) {
    itemTsType = "boolean";
  } else if (baseType === DmnoBaseTypes.enum) {
    const rawEnumOptions = itemType.primitiveType.typeInstanceOptions;
    let enumOptions = [];
    if (_6.isArray(rawEnumOptions)) {
      if (_6.isObject(rawEnumOptions[0]) && "value" in rawEnumOptions[0]) {
        enumOptions = _6.map(rawEnumOptions, (o) => o.value);
      } else {
        enumOptions = rawEnumOptions;
      }
    } else if (_6.isObject(rawEnumOptions)) {
      enumOptions = _6.keys(rawEnumOptions);
    }
    itemTsType = _6.map(enumOptions, JSON.stringify).join(" | ");
  } else if (baseType === DmnoBaseTypes.object) {
    itemTsType = "{}";
  }
  itemSrc.push(`readonly ${item.key}${itemType.getDefItem("required") ? "" : "?"}: ${itemTsType};`);
  itemSrc.push("");
  return _6.map(itemSrc, (line) => `${i}${line}`);
}
__name(getTsDefinitionForItem, "getTsDefinitionForItem");

// src/config-loader/config-loader.ts
createDebugTimer("dmno:config-loader");
var debug2 = Debug("dmno");
var ConfigLoader = class {
  static {
    __name(this, "ConfigLoader");
  }
  startAt;
  readyAt;
  // private isReadyDeferred: DeferredPromise = createDeferredPromise();
  // get isReady() { return this.isReadyDeferred.promise; }
  isReady;
  constructor() {
    this.isReady = this.finishInit();
    this.startAt = /* @__PURE__ */ new Date();
  }
  cacheMode = true;
  setCacheMode(cacheMode) {
    if (this.dmnoWorkspace)
      this.dmnoWorkspace.setCacheMode(cacheMode);
    this.cacheMode = cacheMode;
  }
  viteRunner;
  workspaceInfo;
  get workspacePackagesData() {
    return this.workspaceInfo.workspacePackages;
  }
  get workspaceDmnoPackagesData() {
    return this.workspaceInfo.workspacePackages.filter((p) => !!p.dmnoFolder);
  }
  get workspaceRootPath() {
    return this.workspaceInfo.workspacePackages[0].path;
  }
  async finishInit() {
    this.workspaceInfo = await findDmnoServices();
    const dmnoServicePackages = this.workspaceInfo.workspacePackages.filter((p) => p.dmnoFolder);
    if (!dmnoServicePackages.length)
      return;
    const { viteRunner } = await setupViteServer(this.workspaceRootPath, (ctx) => this.viteHotReloadHandler(ctx));
    this.viteRunner = viteRunner;
  }
  onReload;
  async viteHotReloadHandler(ctx) {
    if (this.devMode) {
      await this.reload();
      if (this.onReload)
        await this.onReload();
    }
  }
  devMode = false;
  schemaLoaded = false;
  dmnoWorkspace;
  async getWorkspace() {
    if (this.dmnoWorkspace)
      return this.dmnoWorkspace;
    await this.reload();
    return this.dmnoWorkspace;
  }
  async reload() {
    await this.isReady;
    if (!this.viteRunner)
      throw new Error("vite server not ready yet");
    this.dmnoWorkspace = new DmnoWorkspace();
    this.dmnoWorkspace.setCacheMode(this.cacheMode);
    beginWorkspaceLoadPlugins(this.dmnoWorkspace);
    for (const w of this.workspacePackagesData) {
      if (!w.dmnoFolder)
        continue;
      const configFilePath = `${w.path}/.dmno/config.mts`;
      const serviceInitOpts = {
        isRoot: w.isRoot,
        packageName: w.name,
        path: w.path,
        workspace: this.dmnoWorkspace
      };
      let service;
      try {
        beginServiceLoadPlugins();
        this.viteRunner.moduleCache.deleteByModuleId(configFilePath);
        const importedConfig = await this.viteRunner.executeFile(configFilePath);
        if (w.isRoot && !importedConfig.default._isDmnoWorkspaceConfig) {
          throw new Error("Workspace root .dmno/config.mts must `export default defineDmnoWorkspace(...)`");
        }
        if (!w.isRoot && !importedConfig.default._isDmnoServiceConfig) {
          throw new Error("Non-root .dmno/config.mts must `export default defineDmnoService(...)`");
        }
        service = new DmnoService({
          ...serviceInitOpts,
          // NOTE - could actually be a DmnoServiceConfig or DmnoWorkspaceConfig
          rawConfig: importedConfig.default
        });
        finishServiceLoadPlugins(service);
      } catch (err) {
        debug2("found error when loading config");
        service = new DmnoService({
          ...serviceInitOpts,
          rawConfig: new ConfigLoadError(err)
        });
      }
      this.dmnoWorkspace.addService(service);
      debug2("init service", service);
    }
    this.dmnoWorkspace.initServicesDag();
    this.dmnoWorkspace.processConfig();
    await this.regenerateAllTypeFiles();
    await this.dmnoWorkspace.resolveConfig();
    this.schemaLoaded = true;
  }
  async regenerateAllTypeFiles() {
    if (!this.dmnoWorkspace)
      return;
    for (const service of this.dmnoWorkspace.allServices) {
      await generateServiceTypes(service, true);
    }
  }
};

// src/cli/lib/cli-ctx.ts
var ctxHelpers = {
  log(...strs) {
    if (!this.expectingOutput) {
      console.log(...strs);
    }
  },
  logOutput(...strs) {
    console.log(...strs);
  }
};
var cliRunContext = new AsyncLocalStorage();
function initCliRunCtx() {
  cliRunContext.enterWith({
    // not sure about this...
    // configLoader: new ConfigLoaderProcess(),
    configLoader: new ConfigLoader(),
    ...ctxHelpers
  });
}
__name(initCliRunCtx, "initCliRunCtx");
function getCliRunCtx() {
  const ctx = cliRunContext.getStore();
  if (!ctx)
    throw new Error("unable to find cli run context in ALS");
  return ctx;
}
__name(getCliRunCtx, "getCliRunCtx");
var CliExitError = class extends Error {
  constructor(message, more) {
    super(message);
    this.more = more;
  }
  static {
    __name(this, "CliExitError");
  }
  get forceExit() {
    return !!this.more?.forceExit;
  }
  getFormattedOutput() {
    let msg = `
\u{1F4A5} ${kleur12.red(this.message)} \u{1F4A5}
`;
    if (this.more?.details) {
      msg += joinAndCompact(_6.castArray(this.more?.details), "\n");
    }
    if (this.more?.suggestion) {
      msg += joinAndCompact(_6.castArray(this.more?.suggestion), "\n");
    }
    msg += "\n";
    return msg;
  }
};
var WATCHING_FILES_MESSAGE = [
  "",
  kleur12.gray("\u{1F440} watching your config files for changes... (CTRL+C to exit)")
].join("\n");
async function rerunCliAction(ctx, thisCommand) {
  console.log(kleur12.blue().italic("reloading due to config change"));
  ctx.workspace = await ctx.configLoader.getWorkspace();
  ctx.isWatchModeRestart = true;
  for (const preHook of thisCommand._lifeCycleHooks.preAction) {
    await preHook(thisCommand);
  }
  await thisCommand._actionHandler(thisCommand.processedArgs);
  for (const postHook of thisCommand._lifeCycleHooks.postAction) {
    await postHook(thisCommand.processedArgs);
  }
}
__name(rerunCliAction, "rerunCliAction");
function addWatchMode(program9) {
  program9.option("-w,--watch", "watch for config changes and re-run").hook("preAction", async (thisCommand, actionCommand) => {
    const ctx = getCliRunCtx();
    if (ctx.isWatchModeRestart)
      return;
    ctx.watchEnabled = thisCommand.opts().watch;
    if (!ctx.watchEnabled)
      return;
    ctx.configLoader.devMode = true;
    ctx.configLoader.onReload = async () => {
      try {
        await rerunCliAction(ctx, thisCommand);
      } catch (err) {
        if (err instanceof CliExitError) {
          console.error(err.getFormattedOutput());
          if (err.forceExit)
            process.exit(1);
        } else {
          throw err;
        }
      } finally {
        console.log(WATCHING_FILES_MESSAGE);
      }
    };
  }).hook("postAction", async (thisCommand, actionCommand) => {
    const ctx = getCliRunCtx();
    if (ctx.isWatchModeRestart)
      return;
    if (!thisCommand.opts().watch) {
      process.exit(0);
    } else {
      console.log(WATCHING_FILES_MESSAGE);
    }
  });
}
__name(addWatchMode, "addWatchMode");

// src/cli/lib/string-utils.ts
function stringInsert(index, str, insertStr) {
  if (index > 0)
    return str.substring(0, index) + insertStr + str.substring(index, str.length);
  else
    return insertStr + str;
}
__name(stringInsert, "stringInsert");
function getMaxLength(strings, extraBuffer = 4) {
  let max = 0;
  for (let i = 0; i < strings.length; i++) {
    if (strings[i].length > max)
      max = strings[i].length;
  }
  if (max)
    max += extraBuffer;
  return max;
}
__name(getMaxLength, "getMaxLength");

// src/cli/lib/selection-helpers.ts
function getServiceLabel(s, padNameEnd) {
  return joinAndCompact([
    `- ${s.serviceName.padEnd(padNameEnd)}`,
    kleur12.gray(s.packageName),
    s.configLoadError && kleur12.red("  schema load error")
  ], " ");
}
__name(getServiceLabel, "getServiceLabel");
function addServiceSelection(program9, opts) {
  return program9.option("-s, --service [service]", "which service to load").hook("preAction", async (thisCommand, actionCommand) => {
    const ctx = getCliRunCtx();
    const workspace = await ctx.configLoader.getWorkspace();
    ctx.workspace = workspace;
    const namesMaxLen = getMaxLength(_6.map(workspace.allServices, (s) => s.serviceName));
    if (ctx.isWatchModeRestart && ctx.selectedService) {
      ctx.selectedService = ctx.workspace.getService({ serviceName: ctx.selectedService.serviceName }) || ctx.workspace.getService({ packageName: ctx.selectedService.packageName });
      if (ctx.selectedService)
        return;
    }
    const explicitMenuOptIn = thisCommand.opts().service === true;
    if (explicitMenuOptIn) {
      thisCommand.opts().service = void 0;
    }
    const explicitSelection = thisCommand.opts().service;
    if (!explicitMenuOptIn && explicitSelection) {
      ctx.selectedService = _6.find(workspace.allServices, (s) => s.serviceName === explicitSelection);
      if (ctx.selectedService)
        return;
      throw new CliExitError(`Invalid service selection: ${kleur12.bold(explicitSelection)}`, {
        suggestion: [
          "Maybe you meant one of:",
          ..._6.map(workspace.allServices, (s) => getServiceLabel(s, namesMaxLen))
        ]
      });
    }
    if (!explicitMenuOptIn && !opts?.disableAutoSelect) {
      const packageName = process.env.npm_package_name || process.env.PNPM_PACKAGE_NAME;
      if (packageName) {
        const autoServiceFromPackageManager = _6.find(workspace.allServices, (service) => {
          return service.packageName === packageName;
        });
        if (autoServiceFromPackageManager) {
          ctx.selectedService = autoServiceFromPackageManager;
          ctx.autoSelectedService = true;
          return;
        }
      }
    }
    if (explicitMenuOptIn || !opts?.disableMenuSelect) {
      const servicesOrderedByDirDepth = _6.orderBy(workspace.allServices, (s) => s.path.split("/").length, ["desc"]);
      const cwd = process.cwd();
      const autoServiceFromCwd = _6.find(servicesOrderedByDirDepth, (service) => {
        return cwd.includes(service.path);
      });
      const menuSelection = await select({
        message: "Please select a service?",
        choices: _6.map(workspace.allServices, (service) => ({
          name: getServiceLabel(service, namesMaxLen),
          value: service.serviceName
        })),
        default: autoServiceFromCwd?.serviceName
      });
      ctx.selectedService = _6.find(workspace.allServices, (s) => s.serviceName === menuSelection);
      ctx.autoSelectedService = false;
      return;
    }
    if (!opts?.allowNoSelection) {
      throw new CliExitError("You must select a service", {
        suggestion: "Try rerunning using -s flag"
      });
    }
  });
}
__name(addServiceSelection, "addServiceSelection");
function getPluginLabel(p, padNameEnd) {
  return [
    `- ${p.instanceName}`.padEnd(padNameEnd),
    kleur12.gray(`${p.pluginType}`),
    kleur12.gray(`| ${p.initByService?.serviceName}`)
  ].join(" ");
}
__name(getPluginLabel, "getPluginLabel");
function addPluginSelection(program9) {
  return program9.option("-p, --plugin <plugin>", "which plugin instance to interact with").hook("preAction", async (thisCommand, actionCommand) => {
    const ctx = getCliRunCtx();
    const workspace = await ctx.configLoader.getWorkspace();
    await workspace.resolveConfig();
    const pluginsArray = _6.values(workspace.plugins);
    const namesMaxLen = getMaxLength(_6.map(pluginsArray, (p) => p.instanceName));
    const explicitSelection = thisCommand.opts().plugin;
    if (explicitSelection) {
      ctx.selectedPlugin = workspace.plugins[explicitSelection];
      if (ctx.selectedPlugin)
        return;
      throw new CliExitError(`Invalid plugin selection: ${kleur12.bold(explicitSelection)}`, {
        suggestion: [
          "Maybe you meant one of:",
          ..._6.map(pluginsArray, (p) => getPluginLabel(p, namesMaxLen))
        ]
      });
    }
    const sortedPluginsArray = _6.sortBy(pluginsArray, (p) => p.cliPath ? 0 : 1);
    const menuSelection = await select({
      message: "Which plugin instance?",
      choices: _6.map(sortedPluginsArray, (plugin) => ({
        name: getPluginLabel(plugin, namesMaxLen),
        // description: getPluginDescription(plugin),
        value: plugin.instanceName,
        disabled: !plugin.cliPath && "(no cli)"
      }))
      // default: autoSelectService?.serviceName,
    });
    thisCommand.opts().plugin = menuSelection;
    ctx.selectedPlugin = workspace.plugins[menuSelection];
  });
}
__name(addPluginSelection, "addPluginSelection");

// src/cli/lib/cache-helpers.ts
function addCacheFlags(program9) {
  return program9.option("--skip-cache", "skips config cache altogether, will not read or write").option("--clear-cache", "clears the cache before continuing, will write new values to cache").hook("preAction", async (thisCommand, actionCommand) => {
    if (thisCommand.opts().skipCache && thisCommand.opts().clearCache) {
      throw new CliExitError("Invalid cli flag combo", {
        details: "Cannot use --skip-cache + --clear-cache at the same time",
        forceExit: true
      });
    }
    const ctx = getCliRunCtx();
    ctx.configLoader.setCacheMode(
      thisCommand.opts().skipCache && "skip" || thisCommand.opts().clearCache && "clear" || true
    );
  });
}
__name(addCacheFlags, "addCacheFlags");
function checkForSchemaErrors(workspace) {
  if (_6.some(_6.values(workspace.allServices), (s) => s.configLoadError)) {
    console.log(`
\u{1F6A8} \u{1F6A8} \u{1F6A8}  ${kleur12.bold().underline("We were unable to load all of your config")}  \u{1F6A8} \u{1F6A8} \u{1F6A8}
`);
    console.log(kleur12.gray("The following services are failing to load:\n"));
    _6.each(workspace.allServices, (service) => {
      if (!service.configLoadError)
        return;
      console.log(kleur12.bold().red(`\u{1F4A5} Service ${kleur12.underline(service.serviceName)} failed to load \u{1F4A5}
`));
      console.log(kleur12.bold(service.configLoadError.message), "\n");
      console.log(service.configLoadError.cleanedStack?.join("\n"), "\n");
    });
    throw new CliExitError("Unable to load all config files");
  }
  if (_6.some(_6.values(workspace.plugins), (p) => !p.isValid)) {
    console.log(`
\u{1F6A8} \u{1F6A8} \u{1F6A8}  ${kleur12.bold().underline("Your plugins were unable to initialize correctly")}  \u{1F6A8} \u{1F6A8} \u{1F6A8}
`);
    _6.each(workspace.plugins, (plugin) => {
      _6.each(plugin.inputItems, (item) => {
        if (item.isValid)
          return;
        console.log(kleur12.red("Failing plugin input ------------------"));
        console.log([
          `${plugin.initByService?.serviceName || ""} ${kleur12.gray("(service)")}`,
          `${kleur12.gray("\u2514")}${plugin.instanceName} ${kleur12.gray("(plugin instance)")}`,
          ` ${kleur12.gray("\u2514")}${item.key} ${kleur12.gray("(input key)")}`
        ].join("\n"));
        console.log(`
${kleur12.underline("Input value")}: ${formattedValue(item.resolvedValue, false)}`);
        const errors = _6.compact([
          item.coercionError,
          ...item.validationErrors || [],
          item.schemaError
        ]);
        console.log(`
${kleur12.underline("Error(s)")}:`);
        console.log(errors?.map((err) => `- ${err.message}`).join("\n"));
      });
    });
    throw new CliExitError("Plugin initialization errors");
  }
  if (_6.some(_6.values(workspace.allServices), (s) => s.schemaErrors?.length)) {
    console.log(`
\u{1F6A8} \u{1F6A8} \u{1F6A8}  ${kleur12.bold().underline("Your config schema is invalid")}  \u{1F6A8} \u{1F6A8} \u{1F6A8}
`);
    console.log(kleur12.gray("The following services have issues:\n"));
    _6.each(workspace.allServices, (service) => {
      if (!service.schemaErrors?.length)
        return;
      console.log(service.serviceName);
      console.log(_6.map(service.schemaErrors, formatError).join("\n"));
    });
    throw new CliExitError("Config schema errors");
  }
}
__name(checkForSchemaErrors, "checkForSchemaErrors");
function checkForConfigErrors(service, opts) {
  const failingItems = _6.filter(service.config, (item) => !item.isValid);
  if (failingItems.length > 0) {
    console.log(`
\u{1F6A8} \u{1F6A8} \u{1F6A8}  ${kleur12.bold().underline(`Configuration of service "${kleur12.magenta(service.serviceName)}" is currently invalid `)}  \u{1F6A8} \u{1F6A8} \u{1F6A8}
`);
    console.log("Invalid items:\n");
    _6.each(failingItems, (item) => {
      console.log(getItemSummary(item.toJSON()));
      console.log();
    });
    if (opts?.showAll) {
      console.log();
      console.log(joinAndCompact([
        "Valid items:",
        kleur12.italic().gray("(remove `--show-all` flag to hide)")
      ]));
      console.log();
      const validItems = _6.filter(service.config, (i) => !!i.isValid);
      _6.each(validItems, (item) => {
        console.log(getItemSummary(item.toJSON()));
      });
    }
    throw new CliExitError("Schema is invalid");
  }
}
__name(checkForConfigErrors, "checkForConfigErrors");

// src/cli/commands/resolve.command.ts
var program = new DmnoCommand("resolve").summary("Loads config schema and resolves config values").description("Loads the resolved config for a service").option("-f,--format <format>", "format to output resolved config (ex. json)").option("--public", "only loads public (non-sensitive) values").option("--show-all", "shows all items, even when config is failing").example("dmno resolve", "Loads the resolved config for the root service").example("dmno resolve --service service1", "Loads the resolved config for service1").example("dmno resolve --service service1 --format json", "Loads the resolved config for service1 in JSON format");
addWatchMode(program);
addServiceSelection(program);
addCacheFlags(program);
program.action(async (opts, thisCommand) => {
  const ctx = getCliRunCtx();
  if (opts.format)
    ctx.expectingOutput = true;
  if (!ctx.selectedService)
    return;
  ctx.log(`
Resolving config for service ${kleur12.magenta(ctx.selectedService.serviceName)}
`);
  const workspace = ctx.workspace;
  const service = ctx.selectedService;
  checkForSchemaErrors(workspace);
  await service.resolveConfig();
  checkForConfigErrors(service, { showAll: opts?.showAll });
  if (opts.format === "json") {
    let exposedConfig = service.config;
    if (opts.public) {
      exposedConfig = _6.pickBy(exposedConfig, (c) => !c.type.getDefItem("sensitive"));
    }
    const valuesOnly = _6.mapValues(exposedConfig, (val) => val.resolvedValue);
    console.log(JSON.stringify(valuesOnly));
  } else if (opts.format === "json-full") {
    console.dir(service.toJSON(), { depth: null });
  } else if (opts.format === "json-injected") {
    console.log(JSON.stringify(service.getInjectedEnvJSON()));
  } else {
    _6.each(service.config, (item) => {
      console.log(getItemSummary(item.toJSON()));
    });
  }
});
var ResolveCommand = program;
var program2 = new DmnoCommand("run").summary("Injects loaded config into an external command").description("Runs a command with the resolved config for a service").usage("[options] -- [command to pass config to]").argument("external command").example("dmno run --service service1 -- printenv $SOME_ITEM", "Runs the echo command with the resolved config for service1").example("dmno run \u2014-service service1 -- somecommand --some-option=(printenv SOME_VAR)", "Runs the somecommand with the resolved config using SOME_VAR via printenv");
addWatchMode(program2);
addServiceSelection(program2);
addCacheFlags(program2);
var commandProcess;
var childCommandKilledFromRestart = false;
program2.action(async (_command, opts, more) => {
  more.args;
  const commandToRunStr = more.args.join(" ");
  const rawCommand = more.args[0];
  const commandArgsOnly = more.args.slice(1);
  const pathAwareCommand = which.sync(rawCommand, { nothrow: true });
  const ctx = getCliRunCtx();
  if (commandProcess && commandProcess.exitCode === null) {
    childCommandKilledFromRestart = true;
    commandProcess.kill(2);
  }
  if (!ctx.selectedService)
    return;
  const workspace = ctx.workspace;
  const service = ctx.selectedService;
  checkForSchemaErrors(workspace);
  await service.resolveConfig();
  checkForConfigErrors(service);
  const serviceEnv = service.getEnv();
  commandProcess = execa(pathAwareCommand || rawCommand, commandArgsOnly, {
    stdio: "inherit",
    env: {
      ...process.env,
      ...serviceEnv,
      DMNO_INJECTED_ENV: JSON.stringify(service.getInjectedEnvJSON())
    }
  });
  let exitCode;
  try {
    const commandResult = await commandProcess;
    exitCode = commandResult.exitCode;
  } catch (error) {
    if (error.signal === "SIGINT" && childCommandKilledFromRestart) {
      childCommandKilledFromRestart = false;
      return;
    }
    if (error.signal === "SIGINT" || error.signal === "SIGKILL") {
      process.exit(1);
    } else {
      console.log(error.message);
      console.log(`command [${commandToRunStr}] failed`);
      console.log("try running the same command without dmno");
      console.log("if you get a different result, dmno may be the problem...");
    }
    exitCode = error.exitCode || 1;
  }
  if (ctx.watchEnabled) {
    if (!childCommandKilledFromRestart) {
      if (exitCode === 0) {
        console.log("\n\u2705 command completed successfully");
      } else {
        console.log(`
\u{1F4A5} command failed - exit code = ${exitCode}`);
      }
    }
  }
  if (!ctx.isWatchModeRestart) {
    process.on("exit", (code, signal) => {
      commandProcess?.kill(9);
    });
    ["SIGTERM", "SIGINT"].forEach((signal) => {
      process.on(signal, () => {
        commandProcess?.kill(9);
        process.exit(1);
      });
    });
  }
});
var RunCommand = program2;
var debug3 = Debug("dmno");
var debugTimer2 = createDebugTimer("dmno:config-server");
var ConfigServer = class {
  constructor(configLoader) {
    this.configLoader = configLoader;
    this.registerRequestHandlers();
    this.initIpcServer();
    this.configLoader.onReload = this.onConfigReload.bind(this);
  }
  static {
    __name(this, "ConfigServer");
  }
  uuid = process.env.DMNO_CONFIG_SERVER_UUID || crypto.randomUUID();
  get workspace() {
    return this.configLoader.dmnoWorkspace;
  }
  requestHandlers = {};
  registerRequestHandler(requestType, handler) {
    if (this.requestHandlers[requestType]) {
      throw new Error(`Duplicate IPC request handler detected for requestType "${requestType}"`);
    }
    this.requestHandlers[requestType] = handler;
  }
  // eslint-disable-next-line class-methods-use-this
  shutdown() {
    singleton.disconnect("dmno");
  }
  ipcReadyDeferred = createDeferredPromise();
  get ipcReady() {
    return this.ipcReadyDeferred.promise;
  }
  initIpcServer() {
    singleton.config.id = "dmno";
    singleton.config.retry = 1500;
    singleton.config.silent = true;
    singleton.serve(`/tmp/${this.uuid}.dmno.sock`);
    singleton.server.on("start", () => {
      debugTimer2("IPC server started");
    });
    singleton.server.on("connect", (msg) => {
      debugTimer2("ipc server connect event");
    });
    singleton.server.on("error", (err) => {
      debug3("IPC error: ", err);
    });
    singleton.server.on("socket.disconnected", (socket, destroyedSocketID) => {
      singleton.log(`client ${destroyedSocketID} has disconnected!`);
    });
    singleton.server.on("request", async (message, socket) => {
      debug3("received request from IPC client", message);
      const handler = this.requestHandlers[message.requestType];
      if (!handler) {
        throw new Error(`No handler for request type: ${message.requestType}`);
      }
      await this.configLoader.isReady;
      await this.ipcReady;
      const result = await handler(message.payload);
      singleton.server.emit(socket, "request-response", {
        requestId: message.requestId,
        response: result
      });
    });
    singleton.server.on("ready", (response) => {
      debugTimer2("IPC server received ready signal");
      this.ipcReadyDeferred.resolve();
    });
    debugTimer2("ipc server start!");
    singleton.server.start();
    process.on("SIGTERM", () => {
    });
    process.on("SIGINT", () => {
    });
    process.on("exit", (code) => {
      singleton.server.stop();
    });
  }
  eventBus = mitt();
  onEvent(eventType, handler) {
    this.eventBus.on(eventType, handler);
  }
  // eslint-disable-next-line class-methods-use-this
  broadcastIpcEvent(type, payload) {
    singleton.server.broadcast("event", { type, payload });
  }
  onReload;
  onConfigReload() {
    this.broadcastIpcEvent("reload", {});
    if (this.onReload)
      this.onReload();
  }
  // request handlers //////////////////////////////////////////
  registerRequestHandlers() {
    this.registerRequestHandler("load-full-schema", async (payload) => {
      await this.workspace.resolveConfig();
      return this.workspace.toJSON();
    });
    this.registerRequestHandler("get-resolved-config", async (payload) => {
      if (payload.packageName) {
        const packageManager = this.configLoader.workspaceInfo.packageManager;
        const selectedPackageInfo = this.configLoader.workspacePackagesData.find((p) => p.name === payload.packageName);
        if (selectedPackageInfo) {
          if (!selectedPackageInfo.dmnoFolder) {
            console.log(`
\u{1F6A8} Package ${selectedPackageInfo.name} has not yet been initialized as a DMNO service`);
            console.log();
            console.log("Please run the following command to get it set up:");
            console.log(kleur12.cyan(` cd ${selectedPackageInfo.path} && ${packageManager} exec dmno init`));
            console.log();
            process.exit(1);
          }
        } else {
          throw new Error(`Package ${payload.packageName} does not exist in your workspace`);
        }
      }
      await this.workspace.resolveConfig();
      const service = this.workspace.getService(payload);
      if (!service) {
        throw new Error(`Unable to select service - ${payload.serviceName || payload.packageName}`);
      }
      return service.toJSON();
    });
  }
};
var TERMINAL_COLS = Math.floor(process.stdout.columns * 0.9);
var LOADER_WIDTH = Math.min(TERMINAL_COLS, 100);
var gradientColorizer = gradient("cyan", "pink");
async function fallingDmnosAnimation(loadingText = "", loadedText = "", totalTime = 1500) {
  if (loadingText)
    loadingText += " ";
  if (loadedText)
    loadedText += " ";
  const frameDelay = Math.floor(totalTime / LOADER_WIDTH / 2);
  const deferred = createDeferredPromise();
  let currentCol = 0;
  let isFalling = false;
  const interval = setInterval(() => {
    currentCol++;
    let str = "";
    if (!isFalling) {
      for (let i = 0; i < currentCol; i++) {
        if (i === 0)
          str += "\u{1F446}";
        else
          str += "\u2590";
      }
    } else {
      for (let i = 0; i < LOADER_WIDTH; i++) {
        if (i === 0)
          str += "\u{1F449}";
        else if (i < currentCol)
          str += "\u2582";
        else if (i === currentCol)
          str += "\u259E";
        else
          str += "\u2590";
      }
    }
    logUpdate(gradientColorizer(str + " ".repeat(LOADER_WIDTH + 1 - str.length)));
    if (currentCol === LOADER_WIDTH) {
      if (!isFalling) {
        currentCol = 0;
        isFalling = true;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          let str2 = loadedText;
          str2 += "\u2582".repeat(LOADER_WIDTH + 1 - str2.length);
          logUpdate(gradientColorizer(str2));
          console.log("\n");
          deferred.resolve();
        }, Math.floor(totalTime * 0.1));
      }
    }
  }, frameDelay);
  return deferred.promise;
}
__name(fallingDmnosAnimation, "fallingDmnosAnimation");
gradient("#00FF0A", "#00C2FF").multiline(outdent`
  ┌─╮╭─┬─╮╭─┬┐╭─╮ ┌─╮╭─┐┌┬┐
  │╷││╷│╷││╷│││╷│ ││││ ┤│││
  │╵│││╵││││╵││╵│ ││││ ┤│╵│
  └─╯└┴─┴┘└┴─╯╰─╯○└─╯╰─┘╰─╯
`);
var DMNO_DEV_BANNER = gradient("#00FF0A", "#00C2FF").multiline(outdent`
  ┌─╮╭─┬─╮╭─┬┐╭─╮ ┌─╮╭─┐┌┬┐ ╭───────────╮ 
  │╷││╷│╷││╷│││╷│ ││││ ┤│││ │ ● ● │ ●   │ 
  │╵│││╵││││╵││╵│ ││││ ┤│╵│ │ ● ● │   ● │ 
  └─╯└┴─┴┘└┴─╯╰─╯○└─╯╰─┘╰─╯ ╰───────────╯ 
`);
var EMPTY_DOMINO = outdent`
  ╭───────────╮
  │     │     │
  │     │     │
  ╰───────────╯
`;
outdent`
  ╭───────────╮
  │   ○ │ ┌─╮ │
  │ ○   │ └─╯ │
  ╰───────────╯
`;
var EMPTY_DOMINO_LINES = gradient("#00FF0A", "#00C2FF").multiline(EMPTY_DOMINO).split("\n");
var dominoWithDArray = structuredClone(EMPTY_DOMINO_LINES);
dominoWithDArray[1] = spliceString(dominoWithDArray[1], 193, 50, kleur12.white("\u250C\u2500\u256E"));
dominoWithDArray[2] = spliceString(dominoWithDArray[2], 193, 50, kleur12.white("\u2514\u2500\u256F"));
dominoWithDArray[1] = spliceString(dominoWithDArray[1], 55, 50, kleur12.white("  \u25CB"));
dominoWithDArray[2] = spliceString(dominoWithDArray[2], 55, 50, kleur12.white("\u25CB  "));
dominoWithDArray.join("\n");
function spliceString(string, index, count, insert) {
  const array = _6.toArray(string);
  array.splice(index, count, insert);
  return array.join("");
}
__name(spliceString, "spliceString");
function getDmnoMascot(message = "") {
  return `
  \u256D\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256E  
  \u2502        \u2577        \u2502 \u250F  ${message ? "\u{1F4AC}" : ""}${message}
\u250F\u2501\u2525   \u2B24    \u2502   \u2B24    \u251D\u2501\u251B
\u253B \u2502        \u256F\u2583\u2596      \u2502  
  \u2570\u2500\u2500\u2500\u2500\u2500\u2565\u2500\u2500\u2500\u2500\u2500\u2565\u2500\u2500\u2500\u2500\u2500\u256F  
        \u255C     \u2559        `;
}
__name(getDmnoMascot, "getDmnoMascot");

// src/cli/commands/dev.command.ts
var TERMINAL_COLS2 = Math.floor(process.stdout.columns * 0.75);
var program3 = new DmnoCommand("dev").summary("dev / watch mode").description(`
Runs the service in dev mode, and watches for changes and updates as needed.
  `).option("--silent", "do not log anything, useful when using in conjunction with a ConfigServerClient which will do its own logging").example("dmno dev", "Runs the service in dev mode");
addServiceSelection(program3, { allowNoSelection: true });
addCacheFlags(program3);
program3.action(async (opts, more) => {
  const ctx = getCliRunCtx();
  const configServer = new ConfigServer(ctx.configLoader);
  ctx.configLoader.devMode = true;
  if (!opts.silent) {
    console.log(DMNO_DEV_BANNER);
    await fallingDmnosAnimation();
  }
  let firstLoad = true;
  async function logResult() {
    if (opts.silent)
      return;
    if (!firstLoad) {
      console.log(gradient("cyan", "pink")(`
\u2500\u2500 Config reloaded ${"\u2500".repeat(TERMINAL_COLS2 - 20)}`));
    }
    firstLoad = false;
    console.log("");
    const workspace = await ctx.configLoader.getWorkspace();
    if (opts.service) {
      const service = workspace.getService(opts.service);
      _6.each(service.config, (item) => {
        console.log(getItemSummary(item.toJSON()));
      });
    } else {
      console.log("config loaded!");
    }
    console.log(
      kleur12.gray("\n\u{1F440} watching your config files for changes... hit CTRL+C to exit")
    );
  }
  __name(logResult, "logResult");
  await ctx.configLoader.reload();
  await logResult();
  configServer.onReload = () => logResult();
});
var DevCommand = program3;
var debug4 = Debug("dmno:plugin-cli");
var program4 = new DmnoCommand("plugin").summary("Interacts with dmno plugins").description("Runs CLI commands related to a specific plugin instance").example("dmno plugin -p my-plugin", "Runs the CLI for the my-plugin plugin").example("dmno plugin -p my-plugin -s my-service", "Runs the CLI for the my-plugin plugin with the my-service service");
addServiceSelection(program4, {});
addPluginSelection(program4);
var isTerminating = false;
program4.action(async (opts, more) => {
  const ctx = getCliRunCtx();
  if (!ctx.selectedPlugin) {
    throw new CliExitError("No plugin instance selected");
  }
  let cliPath = ctx.selectedPlugin.cliPath;
  if (!cliPath)
    throw new Error("no cli for this plugin!");
  if (!cliPath.endsWith(".mjs"))
    cliPath += ".mjs";
  const pluginCliProcess = fork(cliPath, more.args, { stdio: "inherit" });
  debug4("PARENT PROCESS = ", process.pid);
  debug4("CHILD PROCESS = ", pluginCliProcess.pid);
  process.on("exit", (code) => {
    debug4(`About to exit with code: ${code}`);
    pluginCliProcess.kill(9);
  });
  process.on("SIGTERM", () => {
    isTerminating = true;
    pluginCliProcess.kill(9);
    process.exit(1);
  });
  pluginCliProcess.on("close", (code, signal) => {
    if (!isTerminating)
      process.exit(code || 1);
  });
  pluginCliProcess.on("disconnect", () => {
    debug4("child cli disconnect");
  });
  pluginCliProcess.on("error", (err) => {
    debug4("child cli process error", err);
  });
  pluginCliProcess.on("exit", (code, signal) => {
    debug4("child cli process exit", code, signal);
    if (!isTerminating)
      process.exit(code || 1);
  });
  const workspace = await tryCatch(async () => {
    return await ctx.configLoader.getWorkspace();
  }, (err) => {
    console.log(kleur12.red().bold("Loading config failed"));
    console.log(err.message);
    process.exit(1);
  });
  await workspace.resolveConfig();
  const resolvedPlugin = workspace.plugins[opts.plugin];
  pluginCliProcess.send(["init", {
    workspace: workspace.toJSON(),
    plugin: resolvedPlugin.toJSON(),
    selectedServiceName: opts.service
  }]);
});
var PluginCommand = program4;
async function findOrCreateConfigFile(baseDir, glob, createSettings) {
  const expandedPathsFromGlobs = await new fdir().withRelativePaths().glob(glob).crawl(baseDir).withPromise();
  if (!expandedPathsFromGlobs.length) {
    if (createSettings) {
      const newFilePath = `${baseDir}/${createSettings.fileName}`;
      return { createWithContents: createSettings.contents, path: newFilePath };
    } else {
      throw new Error(`failed to find matching config file in ${baseDir} with glob "${glob}"`);
    }
  } else if (expandedPathsFromGlobs.length > 1) {
    throw new Error(`found multiple matching config files in ${baseDir} with glob "${glob}"`);
  }
  return { path: `${baseDir}/${expandedPathsFromGlobs[0]}` };
}
__name(findOrCreateConfigFile, "findOrCreateConfigFile");
async function updateConfigFile(originalSrc, opts) {
  const mods = [];
  const parser = acorn.Parser.extend(tsPlugin());
  const ast = parser.parse(originalSrc, { sourceType: "module", ecmaVersion: "latest", locations: true });
  const importNodes = ast.body.filter((n) => n.type === "ImportDeclaration");
  const q = importNodes?.[0]?.source.raw?.endsWith('"') ? '"' : "'";
  const semi = !importNodes.length || originalSrc.substr(importNodes[0].end - 1, 1) === ";" ? ";" : "";
  for (const singleImport of opts.imports || []) {
    const { moduleName, importDefaultAs, importVars } = singleImport;
    const existingImportNode = importNodes.find((n) => n.source.value === moduleName);
    if (existingImportNode) ; else {
      const importStr = "import " + (importDefaultAs || "") + (importDefaultAs && importVars?.length ? ", " : "") + (importVars?.length ? `{ ${importVars?.join(", ")} }` : "") + (importDefaultAs || importVars?.length ? " from " : "") + `${q}${moduleName}${q}${semi}`;
      mods.push({
        insertAt: importNodes[0]?.start || 0,
        text: `${importStr}
`
      });
    }
  }
  for (const singleUpdate of opts.updates || []) {
    if (singleUpdate.symbol === "EXPORT") {
      let nodeToUpdate;
      let pathNodeToUpdate;
      for (const n of ast.body) {
        if (n.type === "ExportDefaultDeclaration") {
          nodeToUpdate = n.declaration;
        } else if (n.type === "ExpressionStatement" && n.expression.type === "AssignmentExpression" && n.expression.operator === "=" && originalSrc.substring(n.expression.left.start, n.expression.left.end) === "module.exports") {
          nodeToUpdate = n.expression.right;
        }
        if (nodeToUpdate)
          break;
      }
      if (!nodeToUpdate)
        throw new Error("Unable to find `export default` or `module.exports = `");
      if (singleUpdate.path) {
        if (nodeToUpdate.type === "CallExpression" && nodeToUpdate.arguments.length) {
          nodeToUpdate = nodeToUpdate.arguments[0];
        }
        if (nodeToUpdate.type !== "ObjectExpression") {
          throw new Error("Expected to find an object node to use apply the path selector");
        }
        pathNodeToUpdate = nodeToUpdate.properties.find((n) => n.type === "Property" && n.key.name === singleUpdate.path[0]);
        if (pathNodeToUpdate && pathNodeToUpdate.type !== "Property") {
          throw new Error("Node is not a property");
        }
      }
      if (!nodeToUpdate) {
        throw new Error("unable to find AST node to update");
      }
      if ("arrayContains" in singleUpdate.action) {
        if (!pathNodeToUpdate) {
          if (nodeToUpdate.type === "ObjectExpression") {
            const trailingSpace = originalSrc.charAt(nodeToUpdate.end - 2) === " ";
            mods.push({
              insertAt: nodeToUpdate.end - (trailingSpace ? 2 : 1),
              text: [
                nodeToUpdate.properties.length ? ", " : " ",
                `${singleUpdate.path}: [${singleUpdate.action.arrayContains}]`,
                !trailingSpace ? " " : ""
              ].join("")
            });
            break;
          } else {
            throw new Error(`Unable to insert new array at path ${singleUpdate.path}`);
          }
        }
        if (pathNodeToUpdate.type !== "Property") {
          throw new Error("node to update is not an object property");
        } else if (pathNodeToUpdate.value.type !== "ArrayExpression") {
          throw new Error("node property value is not an array");
        }
        const arrayItems = pathNodeToUpdate.value.elements;
        let itemFound = false;
        for (const arrayItem of pathNodeToUpdate.value.elements) {
          if (!arrayItem)
            continue;
          const itemStr = originalSrc.substring(arrayItem.start, arrayItem.end);
          if (itemStr.startsWith(singleUpdate.action.arrayContains)) {
            itemFound = true;
            break;
          }
        }
        if (itemFound) {
          break;
        } else {
          const isMultiLine = originalSrc.substring(pathNodeToUpdate.value.start, pathNodeToUpdate.value.end).includes("\n");
          mods.push({
            insertAt: pathNodeToUpdate.value.start + 1,
            text: (
              // TODO: handle empty array
              // TODO: better handling of indents / line breaks too, single line arrays
              (isMultiLine ? "\n    " : "") + singleUpdate.action.arrayContains + (arrayItems.length ? ", " : "")
            )
          });
        }
      } else if ("wrapWithFn" in singleUpdate.action) {
        if (originalSrc.substring(nodeToUpdate.start, nodeToUpdate.end).includes(singleUpdate.action.wrapWithFn)) {
          break;
        }
        mods.push(
          {
            insertAt: nodeToUpdate.start,
            text: `${singleUpdate.action.wrapWithFn}(`
          },
          {
            insertAt: nodeToUpdate.end,
            text: ")"
          }
        );
      }
    }
  }
  let updatedSrc = originalSrc;
  let insertedChars = 0;
  for (const singleMod of mods) {
    updatedSrc = stringInsert(insertedChars + singleMod.insertAt, updatedSrc, singleMod.text);
    insertedChars += singleMod.text.length;
  }
  return updatedSrc;
}
__name(updateConfigFile, "updateConfigFile");
function getDiffColoredText(input3, output) {
  const diffResult = diffWords(input3, output);
  if (!diffResult.some((chunk) => chunk.added || chunk.removed)) {
    return output;
  }
  const diffText = diffResult.map((chunk) => {
    if (!chunk.added && !chunk.removed)
      return chunk.value;
    return chunk.value.split("\n").map(kleur12[chunk.added ? "green" : "red"]).join("\n");
  }).join("");
  return diffText;
}
__name(getDiffColoredText, "getDiffColoredText");
async function inferDmnoSchema(dotEnvFiles, envVarsFromCode, publicPrefixes) {
  const dmnoSchema = {};
  for (const dotEnvFile of dotEnvFiles) {
    for (const itemKey in dotEnvFile.items) {
      const dotEnvItem = dotEnvFile.items[itemKey];
      const itemHasPublicPrefix = _6.some(publicPrefixes, (prefix) => itemKey.startsWith(prefix));
      dmnoSchema[itemKey] ||= {
        // we default everything is sensitive, and can then undo it later
        ...!itemHasPublicPrefix && { sensitive: true }
      };
      let coercedItemVal;
      if (!dmnoSchema[itemKey].extends && dotEnvItem.value !== void 0 && dotEnvItem.value !== "") {
        const inferredType = inferTypeFromEnvStringVal(dotEnvItem.value);
        if (inferredType.type !== "string")
          dmnoSchema[itemKey].extends = inferredType.type;
        if (inferredType.coercedValue !== void 0) {
          coercedItemVal = inferredType.coercedValue;
        }
        if (["boolean"].includes(inferredType.type)) {
          delete dmnoSchema[itemKey].sensitive;
        }
        if (inferredType.comment) {
          dmnoSchema[itemKey].comment = inferredType.comment;
        }
      }
      if ((dotEnvItem.preComment || dotEnvItem.postComment) && !dotEnvFile.applyForEnv) {
        dmnoSchema[itemKey].description ||= dotEnvItem.preComment || dotEnvItem.postComment;
      }
      if (dotEnvItem.value && dotEnvFile.isSampleFile && !dotEnvFile.applyForEnv) {
        dmnoSchema[itemKey].exampleValue = dotEnvItem.value;
      }
      if (dotEnvItem.value !== void 0 && !dotEnvFile.isSampleFile && !dotEnvFile.isGitIgnored && !dotEnvFile.isOverridesFile) {
        delete dmnoSchema[itemKey].sensitive;
        if (!dotEnvFile.applyForEnv) {
          dmnoSchema[itemKey].value = coercedItemVal ?? dotEnvItem.value;
        } else {
          dmnoSchema[itemKey].valuesForEnv ||= {};
          dmnoSchema[itemKey].valuesForEnv[dotEnvFile.applyForEnv] = coercedItemVal ?? dotEnvItem.value;
        }
      }
    }
  }
  for (const varKey in envVarsFromCode) {
    const itemHasPublicPrefix = _6.some(publicPrefixes, (prefix) => varKey.startsWith(prefix));
    dmnoSchema[varKey] ||= {
      ...!itemHasPublicPrefix && { sensitive: true }
    };
  }
  return dmnoSchema;
}
__name(inferDmnoSchema, "inferDmnoSchema");
function generateDmnoSchemaCode(schemaScaffold) {
  const itemsAsCode = [];
  for (const itemKey in schemaScaffold) {
    if (_6.isEmpty(schemaScaffold[itemKey])) {
      itemsAsCode.push(`${itemKey}: {},`);
      continue;
    }
    const scaffoldItem = _6.cloneDeep(schemaScaffold[itemKey]);
    let itemCode = `${itemKey}: {
`;
    for (const propKey in scaffoldItem) {
      if (propKey === "value" && scaffoldItem.valuesForEnv)
        continue;
      if (propKey === "valuesForEnv")
        continue;
      const propVal = scaffoldItem[propKey];
      if (propKey === "comment") {
        itemCode += `  // ${propVal}
`;
      } else if (propKey === "extends") {
        itemCode += `  ${propKey}: DmnoBaseTypes.${propVal},
`;
      } else {
        itemCode += `  ${propKey}: ${JSON.stringify(propVal)},
`;
      }
    }
    if (scaffoldItem.valuesForEnv) {
      const switchEntries = [];
      if (scaffoldItem.value !== void 0) {
        switchEntries.push(`_default: ${JSON.stringify(scaffoldItem.value)}`);
      }
      for (const envKey in scaffoldItem.valuesForEnv) {
        switchEntries.push(`${envKey}: ${JSON.stringify(scaffoldItem.valuesForEnv[envKey])}`);
      }
      itemCode += "  value: switchByNodeEnv({\n";
      itemCode += switchEntries.map((switchEntryLine) => `    ${switchEntryLine},
`).join("");
      itemCode += "  })\n";
    }
    itemCode += "},";
    itemsAsCode.push(itemCode);
  }
  return itemsAsCode.join("\n");
}
__name(generateDmnoSchemaCode, "generateDmnoSchemaCode");
function generateDmnoConfigInitialCode(isRoot, serviceName, configSchemaScaffold) {
  const defineFn = isRoot ? "defineDmnoWorkspace" : "defineDmnoService";
  const schemaConfigAsCode = generateDmnoSchemaCode(configSchemaScaffold);
  const usesSwitchByNodeEnv = schemaConfigAsCode.includes("value: switchByNodeEnv({");
  const dmnoImports = [
    "DmnoBaseTypes",
    defineFn,
    usesSwitchByNodeEnv && "switchByNodeEnv"
  ];
  return [
    `import { ${joinAndCompact(dmnoImports, ", ")} } from 'dmno';`,
    "",
    `export default ${defineFn}({`,
    serviceName ? `  name: '${serviceName}',` : "  // no name specified - inherit from package.json",
    isRoot ? void 0 : "  pick: [],",
    "  schema: {",
    ...schemaConfigAsCode.split("\n").map((line) => `    ${line}`),
    "  },",
    "});",
    ""
  ].join("\n");
}
__name(generateDmnoConfigInitialCode, "generateDmnoConfigInitialCode");
var TRUE_VALS = ["true", "t", "1"];
var FALSE_VALS = ["false", "f", "0"];
var NUMERIC_REGEX = /^-?\d*(\.\d+)?$/;
var EMAIL_REGEX = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
var URL_REGEX = /(?:^|\s)((https?:\/\/)?(?:localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?(\/\S*)?)/;
function inferTypeFromEnvStringVal(val) {
  if (TRUE_VALS.includes(val.toLowerCase())) {
    return {
      type: "boolean",
      coercedValue: true,
      ...val === "1" && { comment: "TODO: review this - value was `1`, so could be number instead of boolean?" }
    };
  }
  if (FALSE_VALS.includes(val.toLowerCase())) {
    return {
      type: "boolean",
      coercedValue: false,
      ...val === "0" && { comment: "TODO: review this - value was `0`, so could be number instead of boolean?" }
    };
  }
  if (NUMERIC_REGEX.test(val))
    return { type: "number", coercedValue: parseFloat(val) };
  if (URL_REGEX.test(val))
    return { type: "url" };
  if (EMAIL_REGEX.test(val))
    return { type: "email" };
  return { type: "string" };
}
__name(inferTypeFromEnvStringVal, "inferTypeFromEnvStringVal");
var ENV_VAR_REGEX = /(process\.env|import\.meta\.env)\.([A-Za-z_][A-Za-z0-9_$]*)/g;
async function findEnvVarsInCode(dirPath, opts) {
  const fileExtensions = [
    "ts",
    "mts",
    "cts",
    "tsx",
    "js",
    "mjs",
    "cjs",
    "jsx",
    "mdx",
    "astro",
    "vue",
    "svelte"
  ];
  const filesToSearch = await new fdir().withBasePath().glob(`**/*.{${fileExtensions.join(",")}}`).exclude((excludeDirName, excludeDirPath) => {
    if (excludeDirName === "node_modules")
      return true;
    if (excludeDirName === ".dmno")
      return true;
    if (opts?.excludeDirs?.includes(excludeDirPath.replace(/\/$/, "")))
      return true;
    return false;
  }).crawl(dirPath).withPromise();
  const envVars = {};
  await asyncEachLimit(filesToSearch, async (filePath) => {
    try {
      const fileStat = await fs4.promises.stat(filePath);
      if (fileStat.size > 500 * 1e3)
        return;
      const contents = await fs4.promises.readFile(filePath, "utf-8");
      const matches = contents.matchAll(ENV_VAR_REGEX);
      if (!matches)
        return;
      Array.from(matches).forEach((match) => {
        const [_matchedString, globalName, varName] = match;
        envVars[varName] ||= {};
        envVars[varName][globalName] = true;
      });
    } catch (err) {
    }
  }, 10);
  return envVars;
}
__name(findEnvVarsInCode, "findEnvVarsInCode");

// src/cli/lib/init-helpers.ts
var STEP_DELAY = 300;
var DMNO_FOLDER_TSCONFIG = outdent`
  {
    "compilerOptions": {
      "strict": true
    },
    "include": [
      "./**/*.mts",
      "./.typegen/global.d.ts"
    ]
  }
`;
var ENV_LOCAL = outdent`
  # 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑
  # DO NOT COMMIT TO VERSION CONTROL
  # This file contains local config overrides, some of which are likely sensitive
  # 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑 🛑

  MY_SECRET_ITEM=supersecretkey123

`;
function setupStepMessage(message, opts) {
  const icon = {
    noop: "\u2705",
    failure: "\u{1F6AB}",
    skip: "\u23ED\uFE0F ",
    _default: "\u2728"
  }[opts?.type || "_default"];
  let docsLink = opts?.docs || "";
  if (docsLink && docsLink.startsWith("/"))
    docsLink = `https://dmno.dev/docs${docsLink}`;
  return joinAndCompact([
    `${icon} ${opts?.type === "failure" ? kleur12.bgRed(message) : message}`,
    opts?.path && ["   \u{1F4C2} ", kleur12.italic().gray(opts.path)].join(""),
    opts?.package && [
      "   \u{1F4E6} ",
      kleur12.italic().magenta(opts.package),
      opts.packageVersion ? kleur12.gray(` @ "${opts.packageVersion}"`) : ""
    ].join(""),
    opts?.tip && `   \u{1F6A7} ${opts.tip}`,
    docsLink && `   \u{1F4DA}${kleur12.italic(` see docs @ ${docsLink}`)}`,
    " "
  ], "\n");
}
__name(setupStepMessage, "setupStepMessage");
function installPackage(packagePath, packageManager, packageName, isMonoRepoRoot) {
  execSync(`cd ${packagePath} && ${packageManager} add ${packageName} ${isMonoRepoRoot && packageManager === "pnpm" ? "-w" : ""}`);
}
__name(installPackage, "installPackage");
var KNOWN_INTEGRATIONS_MAP = {
  astro: {
    package: "@dmno/astro-integration",
    docs: "/integrations/astro"
  },
  next: {
    package: "@dmno/nextjs-integration",
    docs: "/integrations/nextjs"
  },
  vite: {
    package: "@dmno/vite-integration",
    docs: "/integrations/vite"
  },
  express: {
    package: "dmno",
    docs: "/integrations/node"
  },
  koa: {
    package: "dmno",
    docs: "/integrations/node"
  }
};
async function initDmnoForService(workspaceInfo, servicePath, silent) {
  workspaceInfo.workspacePackages[0].path;
  const nonRootPaths = workspaceInfo.workspacePackages.slice(1).map((s) => s.path);
  const { packageManager } = workspaceInfo;
  const service = workspaceInfo.workspacePackages.find((s) => s.path === servicePath);
  if (!service)
    throw new Error("service not found");
  const projectLabel = workspaceInfo.isMonorepo ? `workspace ${service.isRoot ? "root" : "package"}` : "your project";
  console.log(boxen(
    [
      `Initializing dmno in ${projectLabel} - ${kleur12.magenta(service.name)}`,
      kleur12.italic().gray(service.path)
    ].join("\n"),
    {
      padding: 1,
      borderStyle: "round",
      borderColor: "greenBright"
    }
  ));
  console.log();
  const overwriteMode = !!process.env.DMNO_INIT_OVERWRITE;
  let packageJsonDeps = {};
  async function reloadPackageJson() {
    const packageJsonPath = `${service.path}/package.json`;
    const packageJson = await tryCatch(async () => {
      const rawPackageJson = await fs4.promises.readFile(packageJsonPath);
      return JSON.parse(rawPackageJson.toString());
    }, (err) => {
      console.log(`Unable to parse ${kleur12.green(packageJsonPath)}`);
      throw err;
    });
    packageJsonDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
  }
  __name(reloadPackageJson, "reloadPackageJson");
  await reloadPackageJson();
  const isDmnoInstalled = !!packageJsonDeps.dmno;
  const dmnoVersionRange = packageJsonDeps.dmno;
  if (!overwriteMode && isDmnoInstalled) {
    console.log(setupStepMessage("dmno already installed", { type: "noop", package: "dmno", packageVersion: dmnoVersionRange }));
  } else {
    try {
      installPackage(service.path, packageManager, "dmno", workspaceInfo.isMonorepo && service.isRoot);
      await reloadPackageJson();
      console.log(setupStepMessage("dmno installed", { package: "dmno", packageVersion: packageJsonDeps.dmno }));
    } catch (err) {
      console.log("\u{1F4A5} dmno install failed");
      throw err;
    }
  }
  const installedIntegrationPublicPrefixes = [];
  for (const knownIntegrationDep in KNOWN_INTEGRATIONS_MAP) {
    if (packageJsonDeps[knownIntegrationDep]) {
      const suggestedDmnoIntegration = KNOWN_INTEGRATIONS_MAP[knownIntegrationDep];
      if (suggestedDmnoIntegration.package === "dmno") {
        console.log(setupStepMessage(`DMNO + ${knownIntegrationDep} - natively supported integration`, {
          type: "noop",
          docs: suggestedDmnoIntegration.docs
        }));
      } else if (packageJsonDeps[suggestedDmnoIntegration.package]) {
        console.log(setupStepMessage(`DMNO + ${knownIntegrationDep} - integration already installed`, {
          type: "noop",
          package: suggestedDmnoIntegration.package,
          packageVersion: packageJsonDeps[suggestedDmnoIntegration.package],
          docs: suggestedDmnoIntegration.docs
        }));
      } else {
        console.log(`It looks like this package uses ${kleur12.green(knownIntegrationDep)}!`);
        const confirmIntegrationInstall = await confirm({
          message: `Would you like to install the ${kleur12.green(suggestedDmnoIntegration.package)} package?`
        });
        if (!confirmIntegrationInstall) {
          console.log("No worries - you can always install it later!");
        } else {
          installPackage(service.path, workspaceInfo.packageManager, suggestedDmnoIntegration.package, false);
          await reloadPackageJson();
          console.log(setupStepMessage(`DMNO + ${knownIntegrationDep} integration installed!`, { package: suggestedDmnoIntegration.package, packageVersion: packageJsonDeps[suggestedDmnoIntegration.package] }));
        }
      }
      if (suggestedDmnoIntegration.package !== "dmno" && packageJsonDeps[suggestedDmnoIntegration.package]) {
        try {
          const esmResolver = buildEsmResolver(service.path, {
            isDir: true,
            constraints: "node",
            resolveToAbsolute: true
          });
          const integrationMetaFile = esmResolver(`${suggestedDmnoIntegration.package}/meta`);
          if (!integrationMetaFile) {
            throw new Error("Unable to find integration meta info file");
          }
          const integrationMetaRaw = await fs4.promises.readFile(integrationMetaFile, "utf8");
          const integrationMeta = parse(integrationMetaRaw);
          if (integrationMeta.publicPrefix) {
            installedIntegrationPublicPrefixes.push(integrationMeta.publicPrefix);
          }
          const configCodeMods = integrationMeta.installationCodemods?.[0];
          const { createWithContents, path: configFileFullPath } = await findOrCreateConfigFile(
            service.path,
            configCodeMods.glob,
            configCodeMods.createFileIfNotFound
          );
          const configFileName = configFileFullPath.split("/").pop();
          if (configFileFullPath) {
            const originalConfigFileSrc = createWithContents ?? await fs4.promises.readFile(configFileFullPath, "utf-8");
            const updatedConfigFileSrc = await updateConfigFile(originalConfigFileSrc, configCodeMods);
            if (originalConfigFileSrc === updatedConfigFileSrc) {
              console.log(setupStepMessage(`${configFileName} already sets up ${suggestedDmnoIntegration.package}`, { type: "noop", path: configFileFullPath }));
            } else {
              const diffText = getDiffColoredText(createWithContents ? "" : originalConfigFileSrc, updatedConfigFileSrc);
              if (createWithContents) {
                console.log(kleur12.italic().bgBlue(` DMNO will create a new ${knownIntegrationDep} config file for you `));
              } else {
                console.log(kleur12.italic().bgBlue(" DMNO will make the following changes to your config file "));
              }
              console.log(kleur12.italic().gray(`> Filename: ${configFileName}
`));
              console.log(diffText.trim());
              console.log(kleur12.italic().bgBlue(" -------------------------------------------------------- "));
              const confirmedConfigChanges = await confirm({
                message: "Continue?"
              });
              if (confirmedConfigChanges) {
                await fs4.promises.writeFile(configFileFullPath, updatedConfigFileSrc);
                console.log(setupStepMessage(`${configFileName} updated to set up ${suggestedDmnoIntegration.package}`, { path: configFileFullPath }));
              } else {
                console.log(setupStepMessage(`Skipped ${configFileName} updates to set up ${suggestedDmnoIntegration.package}`, { type: "skip", path: configFileFullPath }));
              }
            }
          }
        } catch (err) {
          console.log(err);
        }
      }
    }
  }
  await promiseDelay(STEP_DELAY);
  if (service.dmnoFolder) {
    console.log(setupStepMessage(".dmno folder already exists!", { type: "noop" }));
  } else {
    await fs4.promises.mkdir(`${service.path}/.dmno`);
    console.log(setupStepMessage(".dmno folder created!"));
  }
  const dotEnvFiles = await loadServiceDotEnvFiles(service.path, {
    excludeDirs: service.isRoot ? nonRootPaths : []
  });
  let configFileGenerated = false;
  const configMtsPath = `${service.path}/.dmno/config.mts`;
  if (!overwriteMode && await pathExists(configMtsPath)) {
    await promiseDelay(STEP_DELAY);
    console.log(setupStepMessage(".dmno/config.mts already exists!", { type: "noop", path: configMtsPath }));
  } else {
    const recommendedName = service.isRoot ? "root" : service.name.replace(/^@[^/]+\//, "");
    let serviceName = silent ? recommendedName : void 0;
    while (serviceName === void 0) {
      serviceName = await input({
        message: 'What do you want to name this service? (enter "?" for help)',
        default: recommendedName,
        validate(value) {
          if (!value)
            return true;
          if (value === "?")
            return true;
          const validationResult = validatePackageName(value);
          if (validationResult.validForNewPackages)
            return true;
          return validationResult.errors?.[0] || "invalid name";
        }
      });
      serviceName = serviceName.trim();
      if (serviceName === "?") {
        console.log(boxen([
          'Every "service" in dmno, including the root, has a name which we refer to as the "service name".',
          "",
          `If you don't specify one, we'll use the name from your package.json file. But, package names often have a prefix/scope (e.g., "@mycoolorg/some-service") and you may need to type this name in a few places - like selecting a service via the dmno CLI - you want to keep it simple.`,
          "",
          "You can use our suggestion, write your own name, or delete the default to inherit the name from package.json.",
          "",
          kleur12.italic(`you can always change this later by editing ${kleur12.blue(".dmno/config.mts")}`)
        ].join("\n"), {
          padding: 1,
          margin: 1,
          borderStyle: "double",
          title: "Help - service name"
        }));
        serviceName = void 0;
      }
    }
    const envVarsFromCode = await findEnvVarsInCode(service.path, {
      excludeDirs: service.isRoot ? nonRootPaths : []
    });
    const inferredSchema = await inferDmnoSchema(dotEnvFiles, envVarsFromCode, installedIntegrationPublicPrefixes);
    const schemaMtsCode = generateDmnoConfigInitialCode(service.isRoot, serviceName, inferredSchema);
    configFileGenerated = true;
    await fs4.promises.writeFile(
      configMtsPath,
      schemaMtsCode
    );
    console.log(setupStepMessage(".dmno/config.mts created!", {
      path: configMtsPath,
      tip: "Please review and update this file!"
    }));
  }
  const committedDotEnvFiles = dotEnvFiles.filter((d) => !d.isGitIgnored);
  if (committedDotEnvFiles.length) {
    await promiseDelay(STEP_DELAY);
    if (configFileGenerated) {
      for (const dotEnvFile of committedDotEnvFiles) {
        console.log(`
You no longer need your ${kleur12.blue(dotEnvFile.fileName)} file - as we've incorporated it into your new ${kleur12.blue(".dmno/config.mts")} file.`);
        const confirmDelete = await confirm({
          message: `Can we delete ${kleur12.blue(dotEnvFile.relativePath)}?`
        });
        if (confirmDelete) {
          await fs4.promises.unlink(dotEnvFile.path);
          console.log(setupStepMessage(`deleted dotenv file - ${dotEnvFile.fileName}`, { path: dotEnvFile.path }));
        } else {
          console.log(setupStepMessage(`did NOT delete ${kleur12.blue(dotEnvFile.fileName)}`, {
            type: "skip",
            tip: "Please delete this file and migrate any useful into your config.mts file",
            path: dotEnvFile.path
          }));
        }
      }
    } else {
      console.log(`
We recommend you delete any .env files (including samples) that you have checked into git, and instead incorporate them into your ${kleur12.blue(".dmno/config.mts")} file. Please delete these files:`);
      console.log(committedDotEnvFiles.map((f) => `  - ${kleur12.blue(f.relativePath)}`).join("\n"));
      console.log();
    }
  }
  const ignoredDotEnvFiles = dotEnvFiles.filter((d) => d.isGitIgnored && !d.path.includes("/.dmno/"));
  if (ignoredDotEnvFiles.length) {
    await promiseDelay(STEP_DELAY);
    console.log("\nTo avoid potential issues and confusion, we recommend you move any .env file(s) into your .dmno folder and load them via dmno.");
    for (const dotEnvFile of ignoredDotEnvFiles) {
      const confirmMove = await confirm({
        message: `Can we move ${kleur12.blue(dotEnvFile.relativePath)}?`
      });
      const newPath = `${service.path}/.dmno/${dotEnvFile.fileName}`;
      if (confirmMove) {
        await fs4.promises.rename(dotEnvFile.path, newPath);
        if (dotEnvFile.fileName !== ".env.local" && dotEnvFile.isGitIgnored && !await checkIsFileGitIgnored(newPath)) {
          await fs4.promises.appendFile(`${service.path}/.gitignore`, `
./.dmno/${dotEnvFile.fileName}`);
        }
        console.log(setupStepMessage(`moved ${kleur12.blue(dotEnvFile.relativePath)} to .dmno folder`, { path: newPath }));
      } else {
        console.log(setupStepMessage(`did NOT move ${kleur12.blue(dotEnvFile.fileName)}`, {
          type: "skip",
          tip: "Please move this file into the .dmno folder",
          path: dotEnvFile.path
        }));
      }
    }
  }
  await promiseDelay(STEP_DELAY);
  const envLocalPath = `${service.path}/.dmno/.env.local`;
  if (!overwriteMode && await pathExists(envLocalPath)) {
    console.log(setupStepMessage(".dmno/.env.local already exists!", { type: "noop", path: envLocalPath }));
  } else {
    await fs4.promises.writeFile(envLocalPath, ENV_LOCAL);
    console.log(setupStepMessage(".dmno/.env.local created!", { path: envLocalPath }));
  }
  await promiseDelay(STEP_DELAY);
  const tsConfigPath = `${service.path}/.dmno/tsconfig.json`;
  if (!overwriteMode && await pathExists(tsConfigPath)) {
    console.log(setupStepMessage(".dmno/tsconfig.json already exists!", { type: "noop", path: tsConfigPath }));
  } else {
    await fs4.promises.writeFile(tsConfigPath, DMNO_FOLDER_TSCONFIG);
    console.log(setupStepMessage(".dmno/tsconfig.json created!", { path: tsConfigPath }));
  }
  if (service.isRoot) {
    await promiseDelay(STEP_DELAY);
    const gitIgnorePath = `${servicePath}/.gitignore`;
    let gitIgnore = "";
    let createdGitIgnore = false;
    try {
      gitIgnore = await fs4.promises.readFile(gitIgnorePath, "utf8");
    } catch (err) {
      await fs4.promises.writeFile(gitIgnorePath, "");
      createdGitIgnore = true;
    }
    if (gitIgnore.includes("**/.dmno/cache.json")) {
      console.log(setupStepMessage(".gitignore already includes dmno files", { type: "noop", path: gitIgnorePath }));
    } else {
      gitIgnore += outdent`
        # dmno files ###
        # local cache for resolved values
        **/.dmno/cache.json
        # encryption key used for cache
        **/.dmno/cache-key.json
        # generated type files
        **/.dmno/.typegen
        # iconify cache used in generated types
        **/.dmno/.icon-cache
        # local config overrides
        **/.dmno/.env.local
      `;
      await fs4.promises.writeFile(gitIgnorePath, gitIgnore);
      console.log(setupStepMessage(`.gitignore ${createdGitIgnore ? "created" : "updated"} with dmno files!`, { path: gitIgnorePath }));
    }
  }
  let srcDirPath = `${service.path}/src`;
  if (!fs4.existsSync(srcDirPath))
    srcDirPath = service.path;
  const dmnoEnvFilePath = `${srcDirPath}/dmno-env.d.ts`;
  if (fs4.existsSync(dmnoEnvFilePath)) {
    console.log(setupStepMessage("injecting dmno types - dmno-env.d.ts already exists", {
      type: "noop",
      path: dmnoEnvFilePath,
      docs: "/guides/typescript"
    }));
  } else {
    let globalDtsRelativePath = path.relative(srcDirPath, `${service.path}/.dmno/.typegen/global.d.ts`);
    if (globalDtsRelativePath.startsWith(".dmno"))
      globalDtsRelativePath = `./${globalDtsRelativePath}`;
    await fs4.promises.writeFile(dmnoEnvFilePath, outdent`
      // inject DMNO_CONFIG global
      /// <reference types="${globalDtsRelativePath}" />
      // inject DMNO_PUBLIC_CONFIG global
      /// <reference types="${globalDtsRelativePath.replace("global.d.ts", "global-public.d.ts")}" />

    `);
    console.log(setupStepMessage("injecting dmno types - created dmno-env.d.ts file", {
      path: dmnoEnvFilePath,
      docs: "/guides/typescript"
    }));
  }
}
__name(initDmnoForService, "initDmnoForService");

// src/lib/constants.ts
var GITHUB_REPO_URL = "https://github.com/dmno-dev/dmno";
var DISCORD_INVITE_URL = "https://chat.dmno.dev";

// src/cli/commands/init.command.ts
var program5 = new DmnoCommand("init").summary("Sets up dmno").description("Sets up dmno in your repo, and can help add to new packages within your monorepo - safe to run multiple times").option("--silent", "automatically select defaults and do not prompt for any input").example("dmno init", "Set up dmno and uses interactive menus to make selections");
program5.action(async (opts, thisCommand) => {
  console.log(DMNO_DEV_BANNER);
  const [workspaceInfo] = await Promise.all([
    findDmnoServices(true),
    fallingDmnosAnimation()
  ]);
  const rootPath = workspaceInfo.workspacePackages[0].path;
  console.log();
  console.log(kleur12.gray(`- Package manager: ${workspaceInfo.packageManager}`));
  console.log(kleur12.gray(`- Workspace root path: ${rootPath}`));
  console.log(kleur12.gray(`- Monorepo mode: ${workspaceInfo.isMonorepo ? "ENABLED" : "DISABLED"}`));
  if (workspaceInfo.isMonorepo) {
    console.log(kleur12.gray(`- Total Packages Count: ${workspaceInfo.workspacePackages.length}`));
  }
  console.log();
  const rootPackage = workspaceInfo.workspacePackages[0];
  if (!workspaceInfo.autoSelectedPackage) {
    throw new Error("unable to detect which package you are in... whats happening?");
  }
  const rootDmnoFolderExists = await pathExists(`${rootPackage.path}/.dmno`);
  const showOnboarding = workspaceInfo.autoSelectedPackage.isRoot && !rootDmnoFolderExists && !opts.silent;
  if (!workspaceInfo.autoSelectedPackage.isRoot) {
    if (!rootDmnoFolderExists) {
      throw new CliExitError("Workspace root .dmno folder does not exist yet", {
        suggestion: "Please first run `dmno init` in the root of your monorepo"
      });
    }
    await initDmnoForService(workspaceInfo, workspaceInfo.autoSelectedPackage.path);
  } else {
    if (showOnboarding) {
      console.log("\u{1F44B} Hello and welcome to dmno!");
    }
    await initDmnoForService(workspaceInfo, rootPackage.path, opts.silent);
    if (workspaceInfo.isMonorepo && !opts.silent) {
      if (workspaceInfo.workspacePackages.length === 1) {
        console.log("No packages found in your monorepo.");
        console.log("After you create them, you can rerun this command `dmno init`");
      } else {
        console.log();
        const installPackagePaths = await checkbox({
          message: "Which service(s) would you like to initialize as dmno services?\n",
          choices: workspaceInfo.workspacePackages.slice(1).map((packageInfo) => {
            return {
              value: packageInfo.path,
              name: `${packageInfo.name} - ${kleur12.italic().gray(packageInfo.relativePath)}`
            };
          })
        });
        for (const packagePath of installPackagePaths) {
          await initDmnoForService(workspaceInfo, packagePath);
        }
      }
    }
  }
  if (showOnboarding) {
    console.log(getDmnoMascot(kleur12.bold().yellow("Thank you SO much!")));
    console.log(`
This software is ${kleur12.green("free")}, and we hope you ${kleur12.italic().bold().red("LOVE")} it \u{1F60D}
`);
    console.log(joinAndCompact([
      "\u2B50 If you have a sec, please star us on github",
      kleur12.gray("   \u2514 ") + kleur12.cyan(GITHUB_REPO_URL),
      " ",
      "\u{1F47E} And chat with us on discord!",
      kleur12.gray("   \u2514 ") + kleur12.cyan(DISCORD_INVITE_URL)
    ], "\n"));
    console.log(joinAndCompact([
      " ",
      `This is early software that is changing fast and will be shaped by amazing users ${kleur12.italic("just like you")}.`,
      "With your consent, we'd love to add you to our email list so we can keep you in the loop.",
      kleur12.italic().gray("We promise we won't share your email and we'll only send you really awesome stuff.")
    ], "\n"));
    const emailOptIn = await confirm({
      message: "Can we add you to our email list?"
    });
    if (emailOptIn) {
      console.log("\u{1F496} Great!");
      const email = await input({
        message: "What is your work email?"
      });
      console.log("\u{1F64F} Thanks so much!\n");
      const userStudyOptIn = await confirm({
        message: "Would you be up for doing a user study and providing some feedback?"
      });
      if (userStudyOptIn) {
        console.log("\u{1F308} Amazing - we'll be in touch soon!");
      } else {
        console.log("No worries at all.");
        console.log(`If you ever do want to chat hit us up on discord @ ${DISCORD_INVITE_URL}`);
      }
      const response = await tryCatch(async () => {
        return await fetch("https://signup-api.dmno.dev/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            emailOptIn,
            userStudyOptIn,
            source: "cli"
            // TODO: more info about the current version of cli, system, etc?
          })
        });
      }, (_err) => {
      });
      if (response && !response.ok) {
        console.log((await response.json()).message);
      }
    } else {
      console.log("No worries! You can always sign up later at https://dmno.dev");
    }
    console.log(kleur12.gray("\nDont worry, you wont see this onboarding stuff again."));
  }
  console.log(joinAndCompact([
    " ",
    "For details about how to start defining your config schema:",
    kleur12.bold().magenta("https://dmno.dev/docs/guides/schema"),
    " ",
    "For drop-in integrations to use DMNO with your favorite tools:",
    kleur12.bold().magenta("https://dmno.dev/docs/integrations/overview"),
    " ",
    "For plugins to securely manage your secrets:",
    kleur12.bold().magenta("https://dmno.dev/docs/plugins/overview"),
    " "
  ], "\n"));
  process.exit(0);
});
var InitCommand = program5;
var program6 = new DmnoCommand("clear-cache").summary("cache utils").description(outdent`
    Tools to clear / reset the cache

    Also note many commands have \`--skip-cache\` and \`--clear-cache\` flags
  `).example("dmno clear-cache", "Clear the entire cache");
program6.action(async (opts, more) => {
  const ctx = getCliRunCtx();
  const workspace = await ctx.configLoader.getWorkspace();
  if (!await pathExists(workspace.cacheFilePath)) {
    console.log("\u{1F47B} Workspace cache file already gone!\n");
    process.exit(0);
  }
  await fs5.rm(workspace.cacheFilePath);
  console.log("\u{1F9F2}\u{1F4BE} Workspace cache file erased");
  console.log(kleur12.italic().gray(workspace.cacheFilePath));
  console.log();
  process.exit(0);
});
var ClearCacheCommand = program6;
var program7 = new DmnoCommand("printenv").summary("Print a single config value").description("Resolves the config and then prints a single value").argument("<itemPath>").example("dmno printenv SOME_KEY", "resolves config and prints the value of the single item");
addWatchMode(program7);
addServiceSelection(program7);
addCacheFlags(program7);
program7.action(async (itemPath, opts, thisCommand) => {
  const ctx = getCliRunCtx();
  ctx.expectingOutput = true;
  if (!ctx.selectedService)
    return;
  const workspace = ctx.workspace;
  const service = ctx.selectedService;
  checkForSchemaErrors(workspace);
  await service.resolveConfig();
  checkForConfigErrors(service);
  if (!service.config[itemPath]) {
    throw new CliExitError(`Config item ${itemPath} not found in config schema`, {
      details: [
        "Perhaps you meant one of:",
        ..._6.map(service.config, (val, key) => `${kleur12.gray("-")} ${key}`)
      ]
    });
  }
  ctx.logOutput(service.config[itemPath].resolvedValue);
});
var PrintEnvCommand = program7;

// src/cli/cli-executable.ts
var startBoot = (/* @__PURE__ */ new Date()).getTime();
var debug5 = Debug("dmno:cli");
var program8 = new DmnoCommand("dmno").description("dmnno cli - https://dmno.dev").version("0.0.1");
program8.addCommand(ResolveCommand);
program8.addCommand(RunCommand);
program8.addCommand(DevCommand);
program8.addCommand(InitCommand);
program8.addCommand(ClearCacheCommand);
program8.addCommand(PluginCommand);
program8.addCommand(PrintEnvCommand);
addDocsCommand(program8);
customizeHelp(program8);
initCliRunCtx();
debug5(`finish loading - begin parse ${+/* @__PURE__ */ new Date() - startBoot}ms`);
try {
  await program8.parseAsync();
} catch (err) {
  if (err instanceof CliExitError) {
    console.error(err.getFormattedOutput());
    const ctx = getCliRunCtx();
    if (ctx.watchEnabled && !err.forceExit) {
      console.log(WATCHING_FILES_MESSAGE);
    } else {
      process.exit(1);
    }
  } else {
    throw err;
  }
}
//# sourceMappingURL=out.js.map
//# sourceMappingURL=cli-executable.mjs.map