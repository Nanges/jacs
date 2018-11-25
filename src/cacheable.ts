import { Observable } from "rxjs";
import { Executable } from "./executable";
import { CacheManagerResolver } from "./cache-manager-resolver";

export function cacheable<T>(config?:T){
    return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        /**
         * One cacheable manager per target instance
         */
        const cacheableSymbol = Symbol(`cacheable_${propertyKey}`);
        const original = descriptor.value as (...args:any[]) =>Observable<any>;

        descriptor.value = function(...args:any[]){
            /** Setup cachemanager once */
            const cacheManager = this[cacheableSymbol] || (this[cacheableSymbol] = CacheManagerResolver.factory(config));
            const executable = original.bind(this, ...args) as Executable<any>;
            return cacheManager.execute(executable, args);
        }
    }
}