import { Observable } from "rxjs";
import { CacheManager } from "./cache-manager";
import { ConfigurableCacheManager } from "./configurable-cache-manager";
import { BASE_CACHE_MANAGER, DEFAULT_CACHE_MANAGER, DEFAULT_CONFIGURATION } from "./cacheable-settings";
import { Executable } from "./executable";

export function resolveManager<T>(...args:any[]): CacheManager{

    let cacheManager: CacheManager;
    
    if(args.length == 0){
        cacheManager = new BASE_CACHE_MANAGER();
    }
    else if (args.length == 1 && !(args[0].prototype instanceof CacheManager)){
        cacheManager = new DEFAULT_CACHE_MANAGER();
        (cacheManager as ConfigurableCacheManager<DEFAULT_CONFIGURATION>).setup(args[0] as T);
    }
    else {
        const ctor = args[0] as {new():CacheManager};
        const config = args[1] as T;

        cacheManager = new ctor();

        if(config){
            (cacheManager as ConfigurableCacheManager<T>).setup(config);
        }
    }

    return cacheManager;
}



export function cacheable();
export function cacheable(config:DEFAULT_CONFIGURATION);
export function cacheable(ctor:{new():CacheManager});
export function cacheable<T>(ctor:{new():ConfigurableCacheManager<T>}, config:T);
export function cacheable<T>(ctor?:any, config?:T){
    return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        const original = descriptor.value as (...args:any[]) =>Observable<any>;
        let cacheManager = resolveManager<T>(ctor, config);

        descriptor.value = function(...args:any[]){
            const executable = original.bind(this, ...args) as Executable<any>;
            return cacheManager.execute(executable, args);
        }
    }
}