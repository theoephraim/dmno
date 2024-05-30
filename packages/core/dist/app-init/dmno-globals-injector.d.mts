import { I as InjectedDmnoEnv, a as InjectedDmnoEnvItem } from '../config-engine-DoN3SfFB.mjs';

declare function injectDmnoGlobals(opts?: {
    injectedConfig?: InjectedDmnoEnv;
    trackingObject?: Record<string, boolean>;
    onItemAccess?: (item: InjectedDmnoEnvItem) => void;
}): {
    injectedDmnoEnv?: undefined;
    staticReplacements?: undefined;
} | {
    injectedDmnoEnv: InjectedDmnoEnv;
    staticReplacements: Record<string, string>;
};

export { injectDmnoGlobals };
