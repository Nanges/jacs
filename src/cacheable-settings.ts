import { CacheManager } from "./cache-manager";
import { BaseCacheManager } from "./managers/base-cm";
import { DefaultCacheManager, CacheConfiguration } from "./managers/default-cm";
import { ConfigurableCacheManager } from "./configurable-cache-manager";

export interface CacheableSettings {
    BASE_CACHE_MANAGER:{new():CacheManager};
    DEFAULT_CACHE_MANAGER:{new():CacheManager};
}

class DefaultCacheableSettings{
    private _settings: CacheableSettings = {
        BASE_CACHE_MANAGER: BaseCacheManager,
        DEFAULT_CACHE_MANAGER: DefaultCacheManager
    }

    get settings():CacheableSettings{
        return Object.assign({}, this._settings);
    }

    set settings(value:CacheableSettings){
        this._settings = value;
    }
}

export const DEFAULT_CACHEABLE_SETTINGS = new DefaultCacheableSettings();