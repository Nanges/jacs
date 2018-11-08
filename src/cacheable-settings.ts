import { CacheManager } from "./cache-manager";
import { BaseCacheManager } from "./managers/base-cm";
import { DefaultCacheManager } from "./managers/default/default-cache-manager";
import { DefaultCacheConfig } from "./managers/default/default-cache-config";

export const BASE_CACHE_MANAGER = BaseCacheManager
export const DEFAULT_CACHE_MANAGER = DefaultCacheManager;
export type DEFAULT_CONFIGURATION = DefaultCacheConfig;