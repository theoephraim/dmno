import * as dmno from 'dmno';

declare const NetlifyDataTypes: {
    NetlifyIdentifier: dmno.DmnoDataTypeFactoryFn<unknown>;
    NetlifyContext: dmno.DmnoDataTypeFactoryFn<unknown>;
    NetlifyBuildId: dmno.DmnoDataTypeFactoryFn<unknown>;
};
declare const NetlifyEnvPreset: {
    CONTEXT: dmno.DmnoDataTypeFactoryFn<unknown>;
    NETLIFY: dmno.DmnoDataTypeFactoryFn<unknown>;
    BUILD_ID: dmno.DmnoDataTypeFactoryFn<unknown>;
};

export { NetlifyDataTypes, NetlifyEnvPreset };
