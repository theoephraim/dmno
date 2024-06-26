import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [ // Entry point(s)
    'src/index.ts', // main lib, users will import from here
    'src/app-init/dmno-globals-injector.ts', // function used to inject dmno globals
    'src/app-init/inject-dmno-globals.ts', // exports inject function and automatically calls it once
    'src/cli/cli-executable.ts', // cli that gets run via `dmno` command
    'src/cli/plugin-cli-lib.ts', // helpers used to create clis for dmno plugins
  ], 

  // imported as TS directly, so we have to tell tsup to compile it instead of leaving it external
  noExternal: [
    '@dmno/ts-lib', '@dmno/encryption-lib',
    
    // yarn was having issues with finding the strong-type package for some reason
    // so we'll just bundle them in as a short term solution
    'node-ipc', '@achrinza/node-ipc', '@achrinza/event-pubsub', '@achrinza/strong-type'
  ],

  dts: true, // Generate .d.ts files
  // minify: true, // Minify output
  sourcemap: true, // Generate sourcemaps
  treeshake: true, // Remove unused code
  
  clean: true, // Clean output directory before building
  outDir: "dist", // Output directory
  
  format: ['esm'], // Output format(s)
  
  splitting: true, // split output into chunks - MUST BE ON! or we get issues with multiple copies of classes and instanceof
  keepNames: true, // stops build from prefixing our class names with `_` in some cases
});
