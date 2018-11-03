import { ConfigurableCacheManager } from "../configurable-cache-manager";
import { Executable } from "../cache-content";
import { Observable } from "rxjs";

export interface CacheConfiguration{

}

export class DefaultCacheManager extends ConfigurableCacheManager<CacheConfiguration>{


    /**
     *
     */
    constructor() {
        super();
        DefaultCacheManager._created = true;
    }

    /**
     * Test purpose only
     */
    private static _created = false;
    static created(){
        return DefaultCacheManager._created;
    }

    setup(config: CacheConfiguration) {
        
    }    
    
    execute<T>(executable: Executable<T>, args: any[]): Observable<T> {
        return null;
    }
}