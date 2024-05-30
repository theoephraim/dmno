import { Command, Option } from 'commander';
export { Command, Option } from 'commander';
import { S as SerializedWorkspace, b as SerializedDmnoPlugin } from '../config-engine-DoN3SfFB.mjs';
export { default as kleur } from 'kleur';

type PluginCliDmnoCtx = {
    workspace: SerializedWorkspace;
    plugin: SerializedDmnoPlugin;
    selectedServiceName?: string;
};
declare function createDmnoPluginCli(opts: {
    commands: Array<Command>;
}): Command;
declare function createDmnoPluginCliCommand(commandSpec: {
    name: string;
    alias?: string;
    summary: string;
    description: string;
    examples?: Array<{
        command: string;
        description: string;
    }>;
    options?: Array<Option>;
    handler: (ctx: PluginCliDmnoCtx, opts: any, command: any) => Promise<void>;
}): Command;

export { createDmnoPluginCli, createDmnoPluginCliCommand };
