import { BaseCacheManager } from "./base-cache-manager";

export type CacheManagerFactory = (c?:any) => BaseCacheManager;
export class CacheManagerResolver{

    private static _factory: CacheManagerFactory;

    static set factory(f: CacheManagerFactory){
        this._factory = f;
    }

    static get factory(): CacheManagerFactory{
        return this._factory;
    }
}
