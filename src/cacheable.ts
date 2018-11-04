import { Observable } from "rxjs";
import { CacheManager } from "./cache-manager";
import { Executable } from "./cache-content";
import { ConfigurableCacheManager } from "./configurable-cache-manager";
import { CacheConfiguration } from "./managers/default-cm";
import { DEFAULT_CACHEABLE_SETTINGS } from "./cacheable-settings";

const settings = DEFAULT_CACHEABLE_SETTINGS.settings;

export function resolveManager<T>(...args:any[]): CacheManager{

    let cacheManager: CacheManager;
    
    if(args.length == 0){
        cacheManager = new settings.BASE_CACHE_MANAGER()
    }
    else if (args.length == 1 && !(args[0] instanceof CacheManager)){
        cacheManager = new settings.DEFAULT_CACHE_MANAGER();
        (cacheManager as ConfigurableCacheManager<T>).setup(args[0] as T);
    }
    else {

        const ctor = args[0] as {new():ConfigurableCacheManager<T>};
        const config = args[1] as T;

        cacheManager = new ctor();

        if(config){
            (cacheManager as ConfigurableCacheManager<T>).setup(config);
        }
    }

    return cacheManager;
}



export function cacheable();
export function cacheable(config:CacheConfiguration);
export function cacheable(ctor:{new():CacheManager});
export function cacheable<T>(ctor:{new():ConfigurableCacheManager<T>}, config:T);
export function cacheable<T>(ctor?:any, config?:T){

    const decoratorArgs = arguments;

    return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        const original = descriptor.value as (...args:any[]) =>Observable<any>;
        let cacheManager = resolveManager(decoratorArgs);

        descriptor.value = function(...args:any[]){
            const executable = original.bind(this, ...args) as Executable<any>;
            return cacheManager.execute(executable, args);
        }
    }
}