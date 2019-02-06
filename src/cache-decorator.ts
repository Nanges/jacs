import { Observable } from 'rxjs';
import { Executable } from './executable';
import { CacheManagerResolver } from './cache-manager-resolver';

const CACHE_MNGR_SYMBOL = Symbol(`cacheMngr`);

export function cacheDecorator(config?: any): MethodDecorator {
    return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        /**
         * One cacheable manager per target instance
         */
        const cachedMethodSymbol = Symbol(`cachedMethod_${propertyKey}`);
        const original = descriptor.value as (...args: any[]) => Observable<any>;
        const factory = CacheManagerResolver.factory;

        descriptor.value = function(...args: any[]) {
            /** Setup cachemanager once */
            const cacheMngrMap = this[CACHE_MNGR_SYMBOL] || (this[CACHE_MNGR_SYMBOL] = {});
            const cacheManager = cacheMngrMap[cachedMethodSymbol] || (cacheMngrMap[cachedMethodSymbol] = factory(config));
            const executable = original.bind(this, ...args) as Executable<any>;
            return cacheManager.execute(executable, args);
        };
    };
}
