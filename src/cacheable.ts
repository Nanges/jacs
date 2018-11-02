import { CacheManager } from "./cache-manager";
import { BaseCacheManager } from "./managers/base.cm";

export function cacheable(){
    return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        const original = descriptor.value;
        const cacheManager: CacheManager = new BaseCacheManager();

        descriptor.value = function(...args:any[]){
            const executable = original.bind(this, ...args);
            return cacheManager.execute(executable, args);
        }
    }
}