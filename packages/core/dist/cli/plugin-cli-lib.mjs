import { createDeferredPromise } from '../chunk-W4DES726.mjs';
import { __name } from '../chunk-TXZD2JN3.mjs';
import { readFileSync } from 'fs';
import { Command } from 'commander';
export { Command, Option } from 'commander';
import Debug from 'debug';
export { default as kleur } from 'kleur';

var debug = Debug("dmno:plugin-cli");
function createDmnoPluginCli(opts) {
  let workspace;
  let plugin;
  let selectedServiceName;
  process.on("message", (message) => {
    debug("received message from parent cli", message);
    const [messageType, payload] = message;
    if (messageType === "init") {
      workspace = payload.workspace;
      plugin = payload.plugin;
      selectedServiceName = payload.selectedServiceName;
      isReady.resolve();
    }
  });
  process.on("exit", () => {
    debug("child cli is exiting");
  });
  process.on("SIGTERM", () => {
    debug("child process SIGTERM");
    process.exit(1);
  });
  process.on("SIGINT", () => {
    debug("child process SIGINT");
    process.exit(1);
  });
  const isReady = createDeferredPromise();
  const errStack = new Error().stack.split("\n");
  const packagePath = errStack[2].replace(/.* at file:\/\//, "").replace(/\/dist\/.*$/, "");
  const packageJsonPath = `${packagePath}/package.json`;
  const packageJsonStr = readFileSync(packageJsonPath, "utf-8");
  const packageJson = JSON.parse(packageJsonStr);
  const packageName = packageJson.name;
  const program = new Command("dmno plugin -p [pluginName] --").description(`${packageName} cli`).hook("preSubcommand", async (thisCommand, actionCommand) => {
    await isReady.promise;
    actionCommand.dmnoPluginCliCtx = {
      workspace,
      plugin,
      selectedServiceName
    };
  });
  opts.commands.forEach((c) => program.addCommand(c));
  return program;
}
__name(createDmnoPluginCli, "createDmnoPluginCli");
function createDmnoPluginCliCommand(commandSpec) {
  const commandProgram = new Command(commandSpec.name).summary(commandSpec.summary).description(commandSpec.description);
  if (commandSpec.alias?.length) {
    commandProgram.alias(commandSpec.alias);
  }
  if (commandSpec?.options?.length) {
    commandSpec.options.forEach((o) => commandProgram.addOption(o));
  }
  commandProgram.action(async (opts, thisCommand) => {
    const pluginCtx = thisCommand.dmnoPluginCliCtx;
    await commandSpec.handler(pluginCtx, opts, thisCommand);
  });
  return commandProgram;
}
__name(createDmnoPluginCliCommand, "createDmnoPluginCliCommand");

export { createDmnoPluginCli, createDmnoPluginCliCommand };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=plugin-cli-lib.mjs.map