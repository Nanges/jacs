import { MockService } from "./mock-service";
import { cacheable } from "../src/cacheable";
import { BaseCacheManager } from "../src/managers/base-cm";
import { DefaultCacheManager } from "../src/managers/default-cm";
import { assert } from "chai";




class CacheableMockService extends MockService{
    
    @cacheable()
    getValueDirectly(index:number){
        return this.getValue(index, 0);
    }

    @cacheable({})
    getDelayedValue(index:number, delay:number){
        return this.getValue(index, delay);
    }
}


describe('Cacheable decorator', () => {
    it('should use BaseCacheManager', () => {
        assert.isTrue(BaseCacheManager.created());
    })

    it('should use DefaultCacheManager', () => {
        assert.isTrue(DefaultCacheManager.created());
    })
});