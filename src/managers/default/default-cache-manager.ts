import { ConfigurableCacheManager } from "../../configurable-cache-manager";
import { Observable } from "rxjs";
import { Executable } from "src/executable";
import { DefaultCacheConfig } from "./default-cache-config";
import { CacheContent } from "../../cache-content";

const defaultConfig:DefaultCacheConfig = {
    MAX_AGE:300000 //5 min 
};

export class DefaultCacheManager extends ConfigurableCacheManager<DefaultCacheConfig>{

    private config:DefaultCacheConfig;

    /**
     *
     */
    constructor() {
        super();
        this.config = defaultConfig;
    }

    setup(config: DefaultCacheConfig) {
        Object.assign(this.config, config);
    }    
    
    execute<T>(executable: Executable<T>, args: any[]): Observable<T> {
        const cC = new CacheContent();
        cC.get(undefined);
        return null;
    }
}