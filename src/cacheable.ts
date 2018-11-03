import { CacheManager } from "./cache-manager";
import { BaseCacheManager } from "./managers/base-cm";
import { Executable } from "./cache-content";
import { ConfigurableCacheManager } from "./configurable-cache-manager";
import { Observable } from "rxjs";
import { CacheConfiguration, DefaultCacheManager } from "./managers/default-cm";




export function cacheable();
export function cacheable(config:CacheConfiguration);
export function cacheable(ctor:{new():CacheManager});
export function cacheable<T>(ctor:{new():ConfigurableCacheManager<T>}, config:T);
export function cacheable<T>(ctor?:any, config?:T){

    const decoratorArgs = arguments;

    return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        const original = descriptor.value as (...args:any[]) =>Observable<any>;
        let cacheManager: CacheManager;

        if(decoratorArgs.length == 0){
            cacheManager = new BaseCacheManager();
        }
        else if (decoratorArgs.length == 1 && !(decoratorArgs[0] instanceof CacheManager)){
            let cacheManager = new DefaultCacheManager();
            cacheManager.setup(decoratorArgs[0] as CacheConfiguration);
        }
        else {
            cacheManager = new ctor();

            if(config){
                (cacheManager as ConfigurableCacheManager<T>).setup(config);
            }
        }
        
        descriptor.value = function(...args:any[]){
            const executable = original.bind(this, ...args) as Executable<any>;
            return cacheManager.execute(executable, args);
        }
    }
}