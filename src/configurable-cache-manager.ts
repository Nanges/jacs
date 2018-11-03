import { CacheManager } from "./cache-manager";

export abstract class ConfigurableCacheManager<T> extends CacheManager{
    abstract setup(config:T);
}