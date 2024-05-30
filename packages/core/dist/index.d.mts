import { D as DmnoDataTypeFactoryFn, C as ConfigValueResolver, c as InlineValueResolverDef, S as SerializedWorkspace, d as SerializedService, I as InjectedDmnoEnv } from './config-engine-DoN3SfFB.mjs';
export { A as ArrayDataTypeSettings, g as CacheMode, P as ClassOf, e as CoercionError, i as ConfigItemDefinition, n as ConfigPath, G as ConfigValue, H as ConfigValueOverride, y as DictionaryDataTypeSettings, z as DmnoBaseTypes, t as DmnoConfigItem, s as DmnoConfigItemBase, v as DmnoDataType, u as DmnoPickedConfigItem, $ as DmnoPlugin, W as DmnoPluginClass, Z as DmnoPluginInputItem, X as DmnoPluginInputMap, U as DmnoPluginInputSchema, q as DmnoService, k as DmnoServiceConfig, B as DmnoSimpleBaseTypeNames, p as DmnoWorkspace, j as DmnoWorkspaceConfig, E as ExtractSettingsSchema, Y as GetPluginInputTypes, Q as InjectPluginInputByType, a as InjectedDmnoEnvItem, F as NodeEnvType, N as NumberDataTypeSettings, O as OverrideSource, R as ResolutionError, r as ResolverContext, f as SchemaError, x as StringDataTypeSettings, T as TypeExtendsDefinition, h as TypeValidationResult, V as ValidationError, _ as _PluginInputTypesSymbol, a1 as beginServiceLoadPlugins, a0 as beginWorkspaceLoadPlugins, L as cacheFunctionResult, o as configPath, w as createDmnoDataType, J as createResolver, M as createdPickedValueResolver, l as defineDmnoService, m as defineDmnoWorkspace, a2 as finishServiceLoadPlugins, K as processInlineResolverDef } from './config-engine-DoN3SfFB.mjs';
import * as mitt from 'mitt';
export { injectDmnoGlobals } from './app-init/dmno-globals-injector.mjs';

/**
 * Placeholder for a few vendor specific data types...
 * these will be extracted into separate modules!
 */
declare const CommonDataTypes: {
    postgresConnectionString: DmnoDataTypeFactoryFn<unknown>;
};

declare const dmnoFormula: (formula: string) => ConfigValueResolver;

type SwitchByResolverOptions = Record<string, InlineValueResolverDef>;
declare const switchBy: (switchByKey: string, branches: SwitchByResolverOptions) => ConfigValueResolver;
declare const switchByNodeEnv: (branches: SwitchByResolverOptions) => ConfigValueResolver;
declare const switchByDmnoEnv: (branches: SwitchByResolverOptions) => ConfigValueResolver;

type ConfigLoaderRequestMap = {
    'load-full-schema': {
        payload: undefined | {
            resolve?: boolean;
        };
        response: SerializedWorkspace;
    };
    'get-resolved-config': {
        payload: {
            serviceName?: string;
            packageName?: string;
        };
        response: SerializedService;
    };
    'generate-types': {
        payload: {
            serviceName?: string;
        };
        response: {
            tsSrc: string;
        };
    };
};

declare class ConfigServerClient {
    eventBus: mitt.Emitter<Record<mitt.EventType, unknown>>;
    readonly serverId: string;
    private ipc;
    constructor();
    private isShuttingDown;
    shutdown(): void;
    private ownedDmnoConfigServerProcess?;
    private initOwnedConfigServer;
    private ipcReadyDeferred;
    private initIpcClient;
    private requestCounter;
    private requests;
    makeRequest<K extends keyof ConfigLoaderRequestMap>(key: K, ...args: ConfigLoaderRequestMap[K]['payload'] extends undefined ? [] : [ConfigLoaderRequestMap[K]['payload']]): Promise<ConfigLoaderRequestMap[K]['response']>;
    /** internal method called when receiving a request response */
    private handleRequestResponse;
    getServiceConfig(): Promise<SerializedService>;
    static checkServiceIsValid(service: SerializedService, log?: boolean): boolean;
}
declare function serializedServiceToInjectedConfig(service: SerializedService): InjectedDmnoEnv;

type DotEnvSchemaItem = {
    key: string;
    value: string;
    preComment?: string;
    postComment?: string;
};
declare function parseDotEnvContents(dotEnvStr: string): DotEnvSchemaItem[];
declare function loadDotEnvIntoObject(dotEnvStr: string): Record<string, string>;
declare function loadDotEnvFile(basePath: string, relativePath: string): Promise<{
    path: string;
    relativePath: string;
    fileName: string;
    isGitIgnored: boolean;
    isOverridesFile: boolean;
    isSampleFile: boolean;
    applyForEnv: string;
    rawContents: string;
    parsedContents: DotEnvSchemaItem[];
    envObj: Record<string, string>;
    items: Record<string, DotEnvSchemaItem>;
}>;
type LoadedDotEnvFile = Awaited<ReturnType<typeof loadDotEnvFile>>;
declare function loadServiceDotEnvFiles(servicePath: string, opts?: {
    onlyLoadDmnoFolder?: boolean;
    excludeDirs?: Array<string>;
}): Promise<Array<LoadedDotEnvFile>>;

export { CommonDataTypes, ConfigServerClient, ConfigValueResolver, DmnoDataTypeFactoryFn, type DotEnvSchemaItem, InjectedDmnoEnv, InlineValueResolverDef, type LoadedDotEnvFile, dmnoFormula, loadDotEnvIntoObject, loadServiceDotEnvFiles, parseDotEnvContents, serializedServiceToInjectedConfig, switchBy, switchByDmnoEnv, switchByNodeEnv };
