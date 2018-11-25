import { CacheManager } from "./cache-manager";

export type CacheManagerFactory = (c?:any) => CacheManager;
export class CacheManagerResolver{
    
    private static _factory: CacheManagerFactory;

    static set factory(f: CacheManagerFactory){
        this._factory = f;
    }

    static get factory(): CacheManagerFactory{
        return this._factory;
    }
}