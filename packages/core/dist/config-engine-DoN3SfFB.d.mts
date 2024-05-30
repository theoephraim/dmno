declare class DmnoError extends Error {
    originalError?: Error;
    get isUnexpected(): boolean;
    icon: string;
    constructor(err: string | Error);
    toJSON(): {
        icon: string;
        type: string;
        name: string;
        message: string;
        isUnexpected: boolean;
    };
}
declare class ConfigLoadError extends DmnoError {
    readonly cleanedStack: Array<string>;
    constructor(err: Error);
    toJSON(): {
        cleanedStack: string[];
        icon: string;
        type: string;
        name: string;
        message: string;
        isUnexpected: boolean;
    };
}
declare class SchemaError extends DmnoError {
    icon: string;
}
declare class ValidationError extends DmnoError {
    icon: string;
}
declare class CoercionError extends DmnoError {
    icon: string;
}
declare class ResolutionError extends DmnoError {
    icon: string;
}

type SerializedWorkspace = {
    services: Record<string, SerializedService>;
    plugins: Record<string, SerializedDmnoPlugin>;
};
type SerializedService = Pick<DmnoService, 'packageName' | 'serviceName' | 'path'> & {
    isValid: boolean;
    isResolved: boolean;
    configLoadError?: SerializedDmnoError;
    schemaErrors?: Array<SerializedDmnoError>;
    ownedPluginNames: Array<string>;
    injectedPluginNames: Array<string>;
    config: Record<string, SerializedConfigItem>;
};
type SerializedDmnoPlugin = Pick<DmnoPlugin, 'pluginType' | 'instanceName' | 'isValid'> & {
    cliPath?: string;
    initializedInService: string;
    injectedIntoServices: Array<string>;
    inputs: Record<string, SerializedDmnoPluginInput>;
    usedByConfigItemResolverPaths?: Array<string>;
};
type SerializedDmnoPluginInput = Pick<DmnoPluginInputItem, 'key' | 'isValid' | 'resolvedValue' | 'isResolved' | 'resolutionMethod'> & {
    isValid: boolean;
    mappedToItemPath?: string;
    coercionError?: SerializedDmnoError;
    validationErrors?: Array<SerializedDmnoError>;
    schemaError?: SerializedDmnoError;
};
type SerializedConfigItem = Pick<DmnoConfigItemBase, 'key' | 'isValid' | 'resolvedRawValue' | 'resolvedValue' | 'isResolved' | 'isDynamic'> & {
    dataType: SerializedDmnoDataType;
    children: Record<string, SerializedConfigItem>;
    coercionError?: SerializedDmnoError;
    validationErrors?: Array<SerializedDmnoError>;
    resolutionError?: SerializedDmnoError;
    resolver?: SerializedResolver;
    overrides?: Array<ConfigValueOverride>;
};
type SerializedResolver = Pick<ConfigValueResolver, 'isResolved'> & {
    icon?: string;
    label?: string;
    resolvedValue?: any;
    createdByPluginInstanceName?: string;
    branches?: Array<SerializedResolverBranch>;
    resolutionError?: SerializedDmnoError;
};
type SerializedResolverBranch = {
    label: string;
    isDefault: boolean;
    isActive: boolean | undefined;
    resolver: SerializedResolver;
};
type SerializedDmnoDataType = Pick<ConfigItemDefinition, 'summary' | 'description' | 'typeDescription' | 'externalDocs' | 'ui' | 'required' | 'sensitive' | 'expose' | 'useAt' | 'dynamic'>;
/** shape of how we will serialize our errors when sending over the wire */
type SerializedDmnoError = {
    icon: string;
    type: string;
    name: string;
    message: string;
    isUnexpected: boolean;
    cleanedStack?: Array<string>;
};

type ClassOf<T> = new (...args: Array<any>) => T;
type MarkKeysRequired<R extends Record<any, any>, RequiredKeys extends keyof R> = Partial<R> & Required<Pick<R, RequiredKeys>>;
type SchemaWithRequiredProp = {
    [k: string]: any;
    required?: boolean;
};
type RequiredKeys<S extends Readonly<Record<string, SchemaWithRequiredProp>>> = {
    [K in keyof S]: S[K]['required'] extends true ? K : never;
}[keyof S];
/** special symbol used to set an plugin input to be filled via type-based injection */
declare const InjectPluginInputByType: unique symbol;
type PluginSchemaItemDefinition = {
    /** is this input required */
    required?: boolean;
    /** description of the input */
    description?: string;
    /** data type of this input */
    extends?: TypeExtendsDefinition;
};
type DmnoPluginInputSchema = Record<string, PluginSchemaItemDefinition>;
type PluginInputMappingValue<StaticValueType = ConfigValue> = ConfigPath | typeof InjectPluginInputByType | StaticValueType;
type DmnoPluginClass<ChildClass extends DmnoPlugin = DmnoPlugin> = {
    new (): ChildClass;
} & typeof DmnoPlugin<ChildClass>;
declare const _PluginInputTypesSymbol: unique symbol;
type DmnoPluginInputMap<S extends DmnoPluginInputSchema> = MarkKeysRequired<Record<keyof S, PluginInputMappingValue | undefined>, RequiredKeys<S>>;
type GetPluginInputTypes<P extends DmnoPlugin> = P[typeof _PluginInputTypesSymbol];
declare class DmnoPluginInputItem<ValueType = any> {
    readonly key: string;
    readonly itemSchema: PluginSchemaItemDefinition;
    readonly dataType: DmnoDataType;
    schemaError?: SchemaError;
    /** error encountered during coercion step */
    coercionError?: CoercionError;
    /** more details about the validation failure if applicable */
    validationErrors?: Array<ValidationError>;
    /** resolved value _before_ coercion logic applied */
    resolvedRawValue?: ConfigValue;
    resolvedValue?: ValueType;
    isResolved: boolean;
    resolvingConfigItems?: Array<DmnoConfigItemBase>;
    get resolutionMethod(): "path" | "type" | "static" | undefined;
    /** flag to enable type-based injection */
    typeInjectionEnabled: boolean;
    /** config path to use in order to fill this input */
    configPath?: ConfigPath;
    constructor(key: string, itemSchema: PluginSchemaItemDefinition);
    /** used to set a static value to resolve this input */
    setStaticValue(val: ValueType): void;
    /** used to enable type-based injection to resolve this input */
    enableTypeInjection(): void;
    /** used to set a specific config path to resolve this input */
    setPathInjection(configPath: ConfigPath): void;
    /** set the value after being resolved  */
    private setValue;
    attemptResolutionUsingConfigItem(item: DmnoConfigItemBase): void;
    checkResolutionStatus(): void;
    get isValid(): boolean;
    toJSON(): SerializedDmnoPluginInput;
}
declare abstract class DmnoPlugin<ChildPlugin extends DmnoPlugin = NoopPlugin> {
    readonly instanceName: string;
    constructor(instanceName: string);
    /** name of the plugin itself - which is the name of the class */
    pluginType: string;
    /** iconify icon name */
    icon?: string;
    static cliPath?: string;
    get cliPath(): string | undefined;
    /**
     * reference back to the service this plugin was initialized in
     * NOTE - when using injection, it will still be the original initializing service
     * */
    initByService?: DmnoService;
    injectedByServices?: Array<DmnoService>;
    /** schema for the inputs this plugin needs - stored on the class */
    protected static readonly inputSchema: DmnoPluginInputSchema;
    /** helper to get the inputSchema from within a instance of the class */
    get inputSchema(): DmnoPluginInputSchema;
    /**
     * tracks the status of each input
     * how it will be resolved, status of that resolution, and the resolvedValue
     * */
    readonly inputItems: {
        [K in keyof GetPluginInputTypes<ChildPlugin>]-?: DmnoPluginInputItem<GetPluginInputTypes<ChildPlugin>[K]>;
    };
    getInputItem<K extends keyof GetPluginInputTypes<ChildPlugin>>(key: K): { [K_1 in keyof GetPluginInputTypes<ChildPlugin>]-?: DmnoPluginInputItem<GetPluginInputTypes<ChildPlugin>[K_1]>; }[K];
    private _inputsAllResolved;
    get inputsAllResolved(): boolean;
    protected setInputMap(inputMapping: DmnoPluginInputMap<DmnoPluginClass<ChildPlugin>['inputSchema']>): void;
    /**
     * map of input keys to their generated types
     * this will be filled in via our type auto-generation process
     * and overridden via module augmentation
     * */
    [_PluginInputTypesSymbol]: Record<string, any>;
    inputValues: GetPluginInputTypes<ChildPlugin>;
    attemptInputResolutionsUsingConfigItem(item: DmnoConfigItemBase): void;
    checkItemsResolutions(): void;
    get isValid(): boolean;
    resolvers: Array<ConfigValueResolver>;
    createResolver(def: Parameters<typeof createResolver>[0]): ReturnType<typeof createResolver>;
    toJSON(): SerializedDmnoPlugin;
    static injectInstance<T extends DmnoPlugin>(this: new (...args: Array<any>) => T, instanceName: string): T;
}
declare function beginWorkspaceLoadPlugins(workspace: DmnoWorkspace): void;
declare function beginServiceLoadPlugins(): void;
declare function finishServiceLoadPlugins(service: DmnoService): void;
declare class NoopPlugin extends DmnoPlugin {
}

type ConfigValue = string | number | boolean | null | {
    [key: string]: ConfigValue;
} | Array<ConfigValue>;
type ValueResolverResult = undefined | ConfigValue;
type ConfigValueInlineFunction = (ctx: ResolverContext) => MaybePromise<ValueResolverResult>;
type InlineValueResolverDef = ConfigValue | ConfigValueResolver | ConfigValueInlineFunction;
type ConfigValueOverride = {
    /** the value of the override */
    value: ConfigValue;
    /** comments about the item from the file */
    comments?: string;
    /** where does the value come from */
    source: string;
    /**
     * some overrides apply only in certan envs, for example if coming from `.env.production` */
    envFlag?: string;
};
type ValueOrValueGetter<T> = T | ((ctx: ResolverContext) => T);
type MaybePromise<T> = T | Promise<T>;
type ResolverDefinition = {
    /** reference back to the plugin which created the resolver (if applicable) */
    createdByPlugin?: DmnoPlugin;
    /** set a specific icon for the resolver, will default to the plugin's icon if set */
    icon?: ValueOrValueGetter<string>;
    /** label for the resolver */
    label: ValueOrValueGetter<string>;
    /**
     * caching key for the final value
     * this is just a convenience to avoid having to explicityl interact with the caching logic directly
     * */
    cacheKey?: ValueOrValueGetter<string>;
} & ({
    resolve: (ctx: ResolverContext) => MaybePromise<ValueResolverResult>;
} | {
    resolveBranches: Array<ResolverBranch>;
});
declare function createResolver(def: ResolverDefinition): ConfigValueResolver;
type ResolverBranch = {
    id: string;
    label: string;
    resolver: ConfigValueResolver;
    condition: (ctx: ResolverContext) => boolean;
    isDefault: boolean;
    isActive?: boolean;
};
declare class ConfigValueResolver {
    readonly def: ResolverDefinition;
    constructor(def: ResolverDefinition);
    isResolved: boolean;
    resolvedValue?: ConfigValue;
    isUsingCache: boolean;
    resolutionError?: ResolutionError;
    icon?: string;
    label?: string;
    private _configItem?;
    set configItem(configItem: DmnoConfigItemBase | undefined);
    get configItem(): DmnoConfigItemBase | undefined;
    parentResolver?: ConfigValueResolver;
    branchDef?: ResolverBranch;
    get branchIdPath(): string | undefined;
    getFullPath(): string;
    resolve(ctx: ResolverContext): Promise<void>;
    toJSON(): SerializedResolver;
}
declare function processInlineResolverDef(resolverDef: InlineValueResolverDef): ConfigValueResolver;
/**
 * helper fn to add caching to a value resolver that does not have it built-in
 * for example, a fn that generates a random number / key
 * */
declare function cacheFunctionResult(resolverFn: ConfigValueInlineFunction): ConfigValueResolver;
declare function cacheFunctionResult(cacheKey: string, resolverFn: ConfigValueInlineFunction): ConfigValueResolver;
declare function createdPickedValueResolver(sourceItem: DmnoConfigItemBase, valueTransform?: ((val: any) => any)): ConfigValueResolver;

/**
 * Represents the options for a DmnoDataType
 * @category HelperMethods
 */
type DmnoDataTypeOptions<TypeSettings = any> = Omit<ConfigItemDefinition<TypeSettings>, 'validate' | 'asyncValidate' | 'coerce'> & {
    /** type identifier used internally */
    typeLabel?: string;
    /** define a schema for the settings that will be passed in when using this data type */
    settingsSchema?: TypeSettings;
    /** validation function that can use type instance settings */
    validate?: (val: any, settings: TypeSettings, ctx?: ResolverContext) => TypeValidationResult;
    /** validation function that can use type instance settings */
    asyncValidate?: (val: any, settings: TypeSettings, ctx?: ResolverContext) => Promise<TypeValidationResult>;
    /** coerce function that can use type instance settings */
    coerce?: (val: any, settings: TypeSettings, ctx?: ResolverContext) => any;
    /** allows disabling or controling execution order of running the parent type's `validate` function (default = "before") */
    runParentValidate?: 'before' | 'after' | false;
    /** allows disabling or controling execution order of running the parent type's `asyncValidate` function (default = "before") */
    runParentAsyncValidate?: 'before' | 'after' | false;
    /** allows disabling or controling execution order of running the parent type's `coerce` function (default = "before") */
    runParentCoerce?: 'before' | 'after' | false;
};
/**
 * data type factory function - which is the result of `createDmnoDataType`
 * This is the type of our base types and any custom types defined by the user
 * */
type DmnoDataTypeFactoryFn<T> = ((opts?: T) => DmnoDataType<T>);
/**
 * utility type to extract the settings schema shape from a DmnoDataTypeFactoryFn (for example DmnoBaseTypes.string)
 * this is useful when extending types and wanting to reuse the existing settings
 * */
type ExtractSettingsSchema<F> = F extends DmnoDataTypeFactoryFn<infer T> ? T : never;
declare class DmnoDataType<InstanceOptions = any> {
    readonly typeDef: DmnoDataTypeOptions<InstanceOptions>;
    readonly typeInstanceOptions: InstanceOptions;
    /**
     * the factory function that created this item
     * Should be always defined unless this is an inline defined type from a config schema
     * */
    private _typeFactoryFn?;
    parentType?: DmnoDataType;
    private _valueResolver?;
    constructor(typeDef: DmnoDataTypeOptions<InstanceOptions>, typeInstanceOptions: InstanceOptions, 
    /**
     * the factory function that created this item
     * Should be always defined unless this is an inline defined type from a config schema
     * */
    _typeFactoryFn?: DmnoDataTypeFactoryFn<InstanceOptions> | undefined);
    get valueResolver(): ConfigValueResolver | undefined;
    validate(val: any, ctx?: ResolverContext): true | Array<ValidationError>;
    asyncValidate(val: any, ctx?: ResolverContext): Promise<true | Array<Error>>;
    coerce(val: any, ctx?: ResolverContext): any | CoercionError;
    /** helper to unroll config schema using the type chain of parent "extends"  */
    getDefItem<T extends keyof DmnoDataTypeOptions>(key: T): DmnoDataTypeOptions[T];
    /** checks if this data type is directly an instance of the data type (not via inheritance) */
    isType(factoryFn: DmnoDataTypeFactoryFn<any>): boolean;
    /** getter to retrieve the last type in the chain */
    get typeFactoryFn(): DmnoDataTypeFactoryFn<any>;
    /** checks if this data type is an instance of the data type, whether directly or via inheritance */
    extendsType(factoryFn: DmnoDataTypeFactoryFn<any>): boolean;
    /** helper to determine if the type was defined inline in a schema */
    get isInlineDefinedType(): boolean;
    get primitiveType(): DmnoDataType;
    get primitiveTypeFactory(): DmnoDataTypeFactoryFn<any>;
    toJSON(): SerializedDmnoDataType;
}
declare function createDmnoDataType<T>(opts: DmnoDataTypeOptions<T>): DmnoDataTypeFactoryFn<T>;
/**
 * String base type settings
 * @category BaseTypes
 */
type StringDataTypeSettings = {
    /** The minimum length of the string. */
    minLength?: number;
    /** The maximum length of the string. */
    maxLength?: number;
    /** The exact length of the string. */
    isLength?: number;
    /** The required starting substring of the string. */
    startsWith?: string;
    /** The required ending substring of the string. */
    endsWith?: string;
    /** The regular expression or string pattern that the string must match. */
    matches?: RegExp | string;
    /** converts to upper case */
    toUpperCase?: boolean;
    /** converts to lower case */
    toLowerCase?: boolean;
    /** allow empty string as a valid string (default is to NOT allow it) */
    allowEmpty?: boolean;
};
/**
 * Represents the settings for the NumberDataType.
 * @category BaseTypes
 */
type NumberDataTypeSettings = {
    /**
     * The minimum value allowed for the number.
     */
    min?: number;
    /**
     * The maximum value allowed for the number.
     */
    max?: number;
    /**
     * Determines whether the number should be coerced to the minimum or maximum value if it is outside the range.
     */
    coerceToMinMaxRange?: boolean;
    /**
     * The number that the value must be divisible by.
     */
    isDivisibleBy?: number;
    /**
     * Determines whether the number should be an integer.
     */
    /** checks if it's an integer */
    isInt?: boolean;
    /** The number of decimal places allowed (for non-integers) */
    precision?: number;
};
/**
 * Represents the settings for the ArrayDataType.
 * @category BaseTypes
 */
type ArrayDataTypeSettings = {
    /**
     * The schema definition for each item in the array.
     */
    itemSchema?: ConfigItemDefinition;
    /**
     * The minimum length of the array.
     */
    minLength?: number;
    /**
     * The maximum length of the array.
     */
    maxLength?: number;
    /**
     * The exact length of the array.
     */
    isLength?: number;
};
/**
 * Represents the settings for the DictionaryDataType.
 * @category BaseTypes
 */
type DictionaryDataTypeSettings = {
    /**
     * The schema definition for each item in the dictionary.
     */
    itemSchema?: ConfigItemDefinition;
    /**
     * The minimum number of items in the dictionary.
     */
    minItems?: number;
    /**
     * The maximum number of items in the dictionary.
     */
    maxItems?: number;
    /**
     * A function to validate the keys of the dictionary.
     */
    validateKeys?: (key: string) => boolean;
    /**
     * A function to asynchronously validate the keys of the dictionary.
     */
    asyncValidateKeys?: (key: string) => Promise<boolean>;
    /**
     * A description of the keys of the dictionary.
     */
    keyDescription?: string;
};
type PossibleEnumValues = string | number | boolean;
type ExtendedEnumDescription = {
    value: PossibleEnumValues;
    description?: string;
};
declare const DmnoBaseTypes: {
    string: DmnoDataTypeFactoryFn<StringDataTypeSettings>;
    number: DmnoDataTypeFactoryFn<({
        min?: number | undefined;
        max?: number | undefined;
        coerceToMinMaxRange?: boolean | undefined;
        isDivisibleBy?: number | undefined;
    } & {
        isInt: true;
    }) | ({
        min?: number | undefined;
        max?: number | undefined;
        coerceToMinMaxRange?: boolean | undefined;
        isDivisibleBy?: number | undefined;
    } & {
        isInt?: undefined;
        precision?: number | undefined;
    })>;
    boolean: DmnoDataTypeFactoryFn<unknown>;
    simpleObject: DmnoDataTypeFactoryFn<unknown>;
    enum: DmnoDataTypeFactoryFn<PossibleEnumValues[] | ExtendedEnumDescription[] | Record<string, Omit<ExtendedEnumDescription, "value">>>;
    email: DmnoDataTypeFactoryFn<{
        normalize?: boolean | undefined;
    }>;
    url: DmnoDataTypeFactoryFn<{
        prependProtocol?: boolean | undefined;
        normalize?: boolean | undefined;
        allowedDomains?: string[] | undefined;
    }>;
    ipAddress: DmnoDataTypeFactoryFn<{
        version?: 4 | 6 | undefined;
        normalize?: boolean | undefined;
    }>;
    port: DmnoDataTypeFactoryFn<unknown>;
    semver: DmnoDataTypeFactoryFn<{
        normalize?: boolean | undefined;
    }>;
    isoDate: DmnoDataTypeFactoryFn<StringDataTypeSettings | undefined>;
    uuid: DmnoDataTypeFactoryFn<StringDataTypeSettings | undefined>;
    md5: DmnoDataTypeFactoryFn<StringDataTypeSettings | undefined>;
    object: DmnoDataTypeFactoryFn<Record<string, ConfigItemDefinition>>;
    array: DmnoDataTypeFactoryFn<ArrayDataTypeSettings>;
    dictionary: DmnoDataTypeFactoryFn<DictionaryDataTypeSettings>;
};
type DmnoSimpleBaseTypeNames = 'string' | 'number' | 'url' | 'boolean' | 'simpleObject';
declare const NodeEnvType: DmnoDataTypeFactoryFn<unknown>;

type ConfigRequiredAtTypes = 'build' | 'boot' | 'run' | 'deploy';
type CacheMode = 'skip' | 'clear' | true;
type TypeExtendsDefinition<TypeSettings = any> = DmnoDataType | DmnoSimpleBaseTypeNames | (() => DmnoDataType) | ((opts: TypeSettings) => DmnoDataType);
type TypeValidationResult = boolean | undefined | void | Error | Array<Error>;
/**
 * options for defining an individual config item
 * @category HelperMethods
 */
type ConfigItemDefinition<ExtendsTypeSettings = any> = {
    /** short description of what this config item is for */
    summary?: string;
    /** longer description info including details, gotchas, etc... supports markdown  */
    description?: string;
    /** expose this item to be "pick"ed by other services, usually used for outputs of run/deploy */
    expose?: boolean;
    /** description of the data type itself, rather than the instance */
    typeDescription?: string;
    /** example value */
    exampleValue?: any;
    /** link to external documentation */
    externalDocs?: {
        description?: string;
        url: string;
    };
    /** dmno config ui specific options */
    ui?: {
        /** icon to use, see https://icones.js.org/ for available options
        * @example mdi:aws
        */
        icon?: string;
        /** color (any valid css color)
        * @example FF0000
        */
        color?: string;
    };
    /** whether this config is sensitive and must be kept secret */
    sensitive?: boolean;
    /** is this config item required, an error will be shown if empty */
    required?: boolean;
    /** at what time is this value required */
    useAt?: ConfigRequiredAtTypes | Array<ConfigRequiredAtTypes>;
    /** opt in/out of build-type code replacements - default is false unless changed at the service level */
    dynamic?: boolean;
    /** the type the item is based, can be a DmnoBaseType or something custom */
    extends?: TypeExtendsDefinition<ExtendsTypeSettings>;
    /** a validation function for the value, return true if valid, otherwise throw an error */
    validate?: ((val: any, ctx: ResolverContext) => TypeValidationResult);
    /** same as \`validate\` but async */
    asyncValidate?: ((val: any, ctx: ResolverContext) => Promise<TypeValidationResult>);
    /** a function to coerce values */
    coerce?: ((val: any, ctx: ResolverContext) => any);
    /** set the value, can be static, or a function, or use helpers */
    value?: InlineValueResolverDef;
    /** import value a env variable with a different name */
    importEnvKey?: string;
    /** export value as env variable with a different name */
    exportEnvKey?: string;
};
type PickConfigItemDefinition = {
    /** which service to pick from, defaults to "root" */
    source?: string;
    /** key(s) to pick, or function that matches against all keys from source */
    key: string | Array<string> | ((key: string) => boolean);
    /** new key name or function to rename key(s) */
    renameKey?: string | ((key: string) => string);
    /** function to transform value(s) */
    transformValue?: (value: any) => any;
};
type ConfigItemDefinitionOrShorthand = ConfigItemDefinition | TypeExtendsDefinition;
type DynamicConfigModes = 'public_static' | 'only_static' | 'only_dynamic' | 'default_static' | 'default_dynamic';
/**
 * options for defining a service's config schema
 * @category HelperMethods
 */
type DmnoWorkspaceConfig = {
    /** root service name, if empty will fallback to name from package.json */
    name?: string;
    /** settings for the root service - children will be inherit individual settings unless overridden */
    settings?: DmnoServiceSettings;
    /** config schema items that live in the workspace root */
    schema: Record<string, ConfigItemDefinitionOrShorthand>;
};
type DmnoServiceSettings = {
    /** default behaviour for "dynamic" vs "static" behaviour of config items */
    dynamicConfig?: DynamicConfigModes;
};
/**
 * options for defining a service's config schema
 * @category HelperMethods
 */
type DmnoServiceConfig = {
    /** service name - if empty, name from package.json will be used */
    name?: string;
    /** name of parent service (if applicable) - if empty this service will be a child of the root service */
    parent?: string;
    /** optional array of "tags" for the service */
    tags?: Array<string>;
    /** settings for this service - each item will be inherited from parent(s) if unspecified */
    settings?: DmnoServiceSettings;
    /** array of config items to be picked from parent */
    pick?: Array<PickConfigItemDefinition | string>;
    /** the config schema itself */
    schema: Record<string, ConfigItemDefinitionOrShorthand>;
};
type InjectedDmnoEnvItem = {
    value: any;
    sensitive?: boolean | 1 | '1';
    dynamic?: boolean | 1 | '1';
};
type InjectedDmnoEnv = Record<string, InjectedDmnoEnvItem>;
declare function defineDmnoService(opts: DmnoServiceConfig): DmnoServiceConfig;
declare function defineDmnoWorkspace(opts: DmnoWorkspaceConfig): DmnoWorkspaceConfig;
declare class ConfigPath {
    readonly path: string;
    constructor(path: string);
}
declare const configPath: (path: string) => ConfigPath;
type NestedOverrideObj<T = string> = {
    [key: string]: NestedOverrideObj<T> | T;
};
declare class OverrideSource {
    readonly type: string;
    private values;
    readonly enabled: boolean;
    constructor(type: string, values: NestedOverrideObj, enabled?: boolean);
    /** get an env var override value using a dot notation path */
    getOverrideForPath(path: string): string | NestedOverrideObj<string>;
}
declare class DmnoWorkspace {
    private services;
    private servicesArray;
    private servicesByPackageName;
    private rootServiceName;
    get rootService(): DmnoService;
    get rootPath(): string;
    readonly processEnvOverrides: OverrideSource;
    addService(service: DmnoService): void;
    private servicesDag;
    initServicesDag(): void;
    processConfig(): void;
    resolveConfig(): Promise<void>;
    get allServices(): DmnoService[];
    getService(descriptor: string | {
        serviceName?: string;
        packageName?: string;
    }): DmnoService;
    get cacheFilePath(): string;
    get cacheKeyFilePath(): string;
    private valueCache;
    private cacheLastLoadedAt;
    private cacheMode;
    setCacheMode(cacheMode: typeof this.cacheMode): void;
    private loadCache;
    private writeCache;
    getCacheItem(key: string, usedBy?: string): Promise<any>;
    setCacheItem(key: string, value: string, usedBy?: string): Promise<undefined>;
    plugins: Record<string, DmnoPlugin>;
    toJSON(): SerializedWorkspace;
}
declare class DmnoService {
    /** name of service according to package.json file  */
    readonly packageName: string;
    /** name of service within dmno - pulled from config.ts but defaults to packageName if not provided  */
    readonly serviceName: string;
    /** true if service is root */
    readonly isRoot: boolean;
    /** path to the service itself */
    readonly path: string;
    /** unprocessed config schema pulled from config.ts */
    readonly rawConfig?: DmnoServiceConfig;
    /** error encountered while _loading_ the config schema */
    readonly configLoadError?: ConfigLoadError;
    /** error within the schema itself */
    readonly schemaErrors: Array<SchemaError>;
    /** processed config items - not necessarily resolved yet */
    readonly config: Record<string, DmnoConfigItem | DmnoPickedConfigItem>;
    readonly workspace: DmnoWorkspace;
    injectedPlugins: Array<DmnoPlugin>;
    ownedPlugins: Array<DmnoPlugin>;
    private settings;
    private overrideSources;
    constructor(opts: {
        packageName: string;
        path: string;
        workspace: DmnoWorkspace;
    } & ({
        isRoot: true;
        rawConfig: DmnoWorkspaceConfig | ConfigLoadError;
    } | {
        isRoot: false;
        rawConfig: DmnoServiceConfig | ConfigLoadError;
    }));
    get parentService(): DmnoService | undefined;
    getSettingsItem<K extends keyof DmnoServiceSettings>(key: K): DmnoServiceSettings[K] | undefined;
    addConfigItem(item: DmnoConfigItem | DmnoPickedConfigItem): void;
    loadOverrideFiles(): Promise<void>;
    resolveConfig(): Promise<void>;
    getConfigItemByPath(path: string): DmnoConfigItemBase;
    get isValid(): boolean;
    getEnv(): Record<string, any>;
    getInjectedEnvJSON(): InjectedDmnoEnv;
    toJSON(): SerializedService;
}
declare class ResolverContext {
    private resolver?;
    private configItem;
    constructor(resolverOrItem: ConfigValueResolver | DmnoConfigItemBase);
    get service(): DmnoService | undefined;
    get serviceName(): string | undefined;
    get itemPath(): string;
    get itemFullPath(): string;
    get resolverFullPath(): string;
    get resolverBranchIdPath(): string | undefined;
    get(itemPath: string): ConfigValue | undefined;
    getCacheItem(key: string): Promise<any>;
    setCacheItem(key: string, value: ConfigValue): Promise<undefined>;
    getOrSetCacheItem(key: string, getValToWrite: () => Promise<string>): Promise<any>;
}
declare abstract class DmnoConfigItemBase {
    /** the item key / name */
    readonly key: string;
    private parent?;
    constructor(
    /** the item key / name */
    key: string, parent?: DmnoService | DmnoConfigItemBase | undefined);
    overrides: Array<ConfigValueOverride>;
    valueResolver?: ConfigValueResolver;
    isResolved: boolean;
    get resolvedRawValue(): ConfigValue | undefined;
    /** error encountered during resolution */
    get resolutionError(): ResolutionError | undefined;
    /** resolved value _after_ coercion logic applied */
    resolvedValue?: ConfigValue;
    /** error encountered during coercion step */
    coercionError?: CoercionError;
    /** more details about the validation failure if applicable */
    validationErrors?: Array<ValidationError>;
    /** whether the final resolved value is valid or not */
    get isValid(): boolean | undefined;
    abstract get type(): DmnoDataType;
    children: Record<string, DmnoConfigItemBase>;
    get parentService(): DmnoService | undefined;
    getPath(respectImportOverride?: boolean): string;
    getFullPath(respectImportOverride?: boolean): string;
    get isDynamic(): boolean;
    resolve(): Promise<void>;
    /** this is the shape that gets injected into an serialized json env var by `dmno run` */
    toInjectedJSON(): InjectedDmnoEnvItem;
    toJSON(): SerializedConfigItem;
}
declare class DmnoConfigItem extends DmnoConfigItemBase {
    readonly type: DmnoDataType;
    readonly schemaError?: Error;
    constructor(key: string, defOrShorthand: ConfigItemDefinitionOrShorthand, parent?: DmnoService | DmnoConfigItem);
    private initializeChildren;
}
declare class DmnoPickedConfigItem extends DmnoConfigItemBase {
    private def;
    /** full chain of items up to the actual config item */
    private pickChain;
    constructor(key: string, def: {
        sourceItem: DmnoConfigItemBase;
        transformValue?: (val: any) => any;
    }, parent?: DmnoService | DmnoPickedConfigItem);
    /** the real source config item - which defines most of the settings */
    get originalConfigItem(): DmnoConfigItem;
    get type(): DmnoDataType<any>;
    private initializeChildren;
}

export { DmnoPlugin as $, type ArrayDataTypeSettings as A, type DmnoSimpleBaseTypeNames as B, ConfigValueResolver as C, type DmnoDataTypeFactoryFn as D, type ExtractSettingsSchema as E, NodeEnvType as F, type ConfigValue as G, type ConfigValueOverride as H, type InjectedDmnoEnv as I, createResolver as J, processInlineResolverDef as K, cacheFunctionResult as L, createdPickedValueResolver as M, type NumberDataTypeSettings as N, OverrideSource as O, type ClassOf as P, InjectPluginInputByType as Q, ResolutionError as R, type SerializedWorkspace as S, type TypeExtendsDefinition as T, type DmnoPluginInputSchema as U, ValidationError as V, type DmnoPluginClass as W, type DmnoPluginInputMap as X, type GetPluginInputTypes as Y, DmnoPluginInputItem as Z, _PluginInputTypesSymbol as _, type InjectedDmnoEnvItem as a, beginWorkspaceLoadPlugins as a0, beginServiceLoadPlugins as a1, finishServiceLoadPlugins as a2, type SerializedDmnoPlugin as b, type InlineValueResolverDef as c, type SerializedService as d, CoercionError as e, SchemaError as f, type CacheMode as g, type TypeValidationResult as h, type ConfigItemDefinition as i, type DmnoWorkspaceConfig as j, type DmnoServiceConfig as k, defineDmnoService as l, defineDmnoWorkspace as m, ConfigPath as n, configPath as o, DmnoWorkspace as p, DmnoService as q, ResolverContext as r, DmnoConfigItemBase as s, DmnoConfigItem as t, DmnoPickedConfigItem as u, DmnoDataType as v, createDmnoDataType as w, type StringDataTypeSettings as x, type DictionaryDataTypeSettings as y, DmnoBaseTypes as z };
