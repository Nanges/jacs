import { Observable, of, Subject, Subscription, Observer, race } from 'rxjs';
import { tap, switchMap, finalize, takeUntil, share } from 'rxjs/operators';
import { Executable } from './executable';
import { cloneDeep } from 'lodash';

export class BaseCacheContent<T> {
    private _valid: boolean = false;
    private src$: Observable<T>;
    private _value:T;

    constructor(value: T = null) {
        if(value){
            this.updateCache(value);
        }
    }

    /**
     * Prevent value mutation by cloning it
     */
    get value(): T {
        return cloneDeep(this._value) as T;
    }

    /**
     *
     */
    get valid(): boolean {
        return this.isValid();
    }

    /**
     * Return an observable of the cached value or the given fallback if cache is invalid
     * @param fallback : The fallback used to refresh the value when the cache is not valid anymore
     */
    public get(fallback: Executable<T>): Observable<T> {
        return Observable.create((o: Observer<T>) => {
            if(this.valid){
                o.next(this._value);
                o.complete();
                return;
            }

            const src$ = this.src$ || (this.src$ = this.makeSrc$(fallback));
            src$.subscribe(o);
        });
    }

    /**
     * Invalidate the cache.
     */
    public invalidate(): void {
        this._valid = false;
    }

    protected updateCache(content: T) {
        this._value = content;
        this._valid = true;
        this.src$ = null;
    }

    protected isValid(): boolean {
        return this._valid;
    }

    private makeSrc$(fallback: Executable<T>):Observable<T> {
        return fallback().pipe(
            tap(c => this.updateCache(c)),
            share()
        );
    }
}
