import { CacheManager } from "./cache-manager";
import { BaseCacheManager } from "./managers/base-cm";
import { DefaultCacheManager, CacheConfiguration } from "./managers/default-cm";

export const BASE_CACHE_MANAGER = BaseCacheManager
export const DEFAULT_CACHE_MANAGER = DefaultCacheManager;
export type DEFAULT_CONFIGURATION = CacheConfiguration;