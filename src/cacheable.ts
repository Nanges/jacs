import { Observable } from "rxjs";
import { Executable } from "./executable";
import { CacheManagerResolver } from "./cache-manager-resolver";

export function cacheable<T>(config?:T){
    return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        /**
         * One cacheable manager per target instance
         */
        const cacheMngrSymbol = Symbol(`cacheMngr_${propertyKey}`);
        const original = descriptor.value as (...args:any[]) =>Observable<any>;
        const factory = CacheManagerResolver.factory;

        descriptor.value = function(...args:any[]){
            /** Setup cachemanager once */
            const cacheManager = this[cacheMngrSymbol] || (this[cacheMngrSymbol] = factory(config));
            const executable = original.bind(this, ...args) as Executable<any>;
            return cacheManager.execute(executable, args);
        }
    }
}