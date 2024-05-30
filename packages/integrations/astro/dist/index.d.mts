import { AstroIntegration } from 'astro';

type DmnoAstroIntegrationOptions = {};
declare function dmnoAstroIntegration(dmnoIntegrationOpts?: DmnoAstroIntegrationOptions): AstroIntegration;

export { dmnoAstroIntegration as default };
