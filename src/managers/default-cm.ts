import { ConfigurableCacheManager } from "../configurable-cache-manager";
import { Executable } from "../cache-content";
import { Observable } from "rxjs";

export interface CacheConfiguration{

}

export class DefaultCacheManager extends ConfigurableCacheManager<CacheConfiguration>{

    setup(config: CacheConfiguration) {
        
    }    
    
    execute<T>(executable: Executable<T>, args: any[]): Observable<T> {
        return null;
    }
}