import { execSync } from 'child_process';
import fs from 'fs';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var dmnoEnv = execSync("npm exec -- dmno resolve -f json-injected").toString();
var INJECT_DMNO_ENV_SRC = `
globalThis.process = globalThis.process || { env: {} };
globalThis.process.env.DMNO_INJECTED_ENV = JSON.stringify(${dmnoEnv});
`;
async function onBuild(args) {
  console.log("onBuild hook!");
  const netlifyFolderPath = args.constants.IS_LOCAL ? args.utils.cache.getCacheDir().replace(/\/[^/]+$/, "") : "/opt/build/repo/.netlify";
  updateDmnoInjectFile(netlifyFolderPath);
  const allFunctions = await args.utils.functions.list();
  console.log(allFunctions);
  for (const fn of allFunctions) {
    const originalSrc = await fs.promises.readFile(fn.mainFile, "utf8");
    const updatedSrc = `import '../../inject-dmno-config.js';
` + originalSrc;
    await fs.promises.writeFile(fn.mainFile, updatedSrc, "utf8");
    console.log("updated function @ " + fn.mainFile, originalSrc.substr(0, 100));
  }
  const edgeFnsDir = `${netlifyFolderPath}/edge-functions`;
  const edgeFnFileNames = await fs.promises.readdir(edgeFnsDir, { recursive: true });
  for (const edgeFnFileName of edgeFnFileNames) {
    if (!(edgeFnFileName.endsWith(".mjs") || edgeFnFileName.endsWith(".cjs") || edgeFnFileName.endsWith(".js")))
      continue;
    const fullFilePath = `${edgeFnsDir}/${edgeFnFileName}`;
    const originalSrc = await fs.promises.readFile(fullFilePath, "utf8");
    const updatedSrc = `import '../../inject-dmno-config.js';
` + originalSrc;
    await fs.promises.writeFile(fullFilePath, updatedSrc, "utf8");
    console.log("updated EDGE function @ " + fullFilePath, originalSrc.substr(0, 100));
  }
}
__name(onBuild, "onBuild");
function updateDmnoInjectFile(netlifyFolderPath) {
  fs.writeFileSync(`${netlifyFolderPath}/inject-dmno-config.js`, INJECT_DMNO_ENV_SRC, "utf8");
}
__name(updateDmnoInjectFile, "updateDmnoInjectFile");
function onPreBuild() {
  console.log("onPreBuild!");
}
__name(onPreBuild, "onPreBuild");
function getNetlifyFolderPath(eventArgs) {
  return eventArgs.utils.cache.getCacheDir().replace(/\/[^/]+$/, "");
}
__name(getNetlifyFolderPath, "getNetlifyFolderPath");
function onPreDev(args) {
  const { netlifyConfig } = args;
  console.log("PRE DEV!", {
    "netlifyConfig.build.environment": {
      CONTEXT_FOO: netlifyConfig.build.environment.CONTEXT_FOO,
      BUILD_FOO: netlifyConfig.build.environment.BUILD_FOO,
      UI_FOO: netlifyConfig.build.environment.UI_FOO
    },
    "process.env": {
      CONTEXT_FOO: process.env.CONTEXT_FOO,
      BUILD_FOO: process.env.BUILD_FOO,
      UI_FOO: process.env.UI_FOO
    }
  });
  const netlifyFolderPath = getNetlifyFolderPath(args);
  updateDmnoInjectFile(netlifyFolderPath);
}
__name(onPreDev, "onPreDev");
async function onDev(args) {
}
__name(onDev, "onDev");

export { onBuild, onDev, onPreBuild, onPreDev };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.js.map