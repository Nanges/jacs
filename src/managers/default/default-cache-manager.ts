import { Observable, Subject } from 'rxjs';
import { cloneDeep } from 'lodash';
import { Executable } from '../../executable';
import { DefaultCacheConfig } from './default-cache-config';
import { TimeoutCacheContent } from '../../timeout-cache-content';
import { BaseCacheManager } from '../../base-cache-manager';
import { filter } from 'rxjs/operators';

export class DefaultCacheManager extends BaseCacheManager {
    private _config: DefaultCacheConfig;
    private _map = new Map<string, TimeoutCacheContent<any>>();
    private _stack: string[] = [];
    private static _notifier: Subject<string>;

    public static notifier() {
        if (!DefaultCacheManager._notifier) {
            DefaultCacheManager._notifier = new Subject<string>();
        }

        return DefaultCacheManager._notifier;
    }

    /**
     *
     */
    get map(): Map<string, TimeoutCacheContent<any>> {
        return cloneDeep(this._map);
    }

    /**
     *
     */
    constructor(config?: DefaultCacheConfig) {
        super();
        this._config = Object.assign(new DefaultCacheConfig(), config);

        if (this._config.invalidateOn.length) {
            DefaultCacheManager.notifier()
                .pipe(filter(v => this._config.invalidateOn.indexOf(v) > -1))
                .subscribe(v => {
                    this._map.forEach(cC => cC.invalidate());
                });
        }
    }

    execute<T>(executable: Executable<T>, args: any[]): Observable<T> {
        const key = JSON.stringify(args);

        // clean the stack
        this.manageStack(key);

        if (!this._map.has(key)) {
            this._map.set(key, new TimeoutCacheContent(this._config.maxAge));
        }

        const cC = this._map.get(key);
        return cC.get(executable);
    }

    private manageStack(key: string) {
        this._stack.unshift(key);
        // remove keys
        this._stack.splice(this._config.maxStack).forEach(k => this._map.delete(k));
    }
}
