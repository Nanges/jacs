import { resolveManager } from "../src/cacheable";
import { BASE_CACHE_MANAGER, DEFAULT_CACHE_MANAGER } from "../src/cacheable-settings";
import { assert } from "chai";
import { CacheManager } from "../src/cache-manager";
import { Observable } from "rxjs";
import { ConfigurableCacheManager } from "../src/configurable-cache-manager";
import { Executable } from "src/executable";

class MyManager extends CacheManager{
    execute<T>(executable: Executable<T>, args: any[]): Observable<T> {
        return null;
    }
}

class MyConfigrableManager extends ConfigurableCacheManager<any>{
    setup(config: any) {
    
    }    
    
    execute<T>(executable: Executable<T>, args: any[]): Observable<T> {
        return null;
    }
}

describe('Resolve manager', () => {
    it('should return the Base cache manager', () => {
        assert.isTrue(resolveManager() instanceof BASE_CACHE_MANAGER);
    })

    it('should return the default configurable cache manager', () => {
        assert.isTrue(resolveManager({}) instanceof DEFAULT_CACHE_MANAGER);
    })

    it('should return instance of the constructor parameter', () => {
        assert.isTrue(resolveManager(MyManager) instanceof MyManager);
    });

    it('should return instance of the configurable constructor parameter', () => {
        assert.isTrue(resolveManager(MyConfigrableManager, {}) instanceof MyConfigrableManager);
    })
})