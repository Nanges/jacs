export class DefaultCacheConfig {
    maxAge?: number = 300000; //5 minutes
    maxStack?: number = 10;
    invalidateOn?: string[] = [];
}
