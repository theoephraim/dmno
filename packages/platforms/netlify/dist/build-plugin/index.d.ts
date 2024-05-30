declare function onBuild(args: any): Promise<void>;
declare function onPreBuild(): void;
declare function onPreDev(args: any): void;
declare function onDev(args: any): Promise<void>;

export { onBuild, onDev, onPreBuild, onPreDev };
