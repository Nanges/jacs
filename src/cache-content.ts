import { Observable, of, Subject, Subscription, Observer, race } from 'rxjs';
import { tap, switchMap, finalize, takeUntil } from 'rxjs/operators';
import { Executable } from './executable';
import { cloneDeep } from 'lodash';

export class CacheContent<T> {
    private _valid: boolean;
    private _pending: boolean;
    private onValue$: Subject<any>;
    private onCancel$: Subject<void>;

    constructor(private _value: T = null) {
        this._valid = this._value != null;
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
        return this._valid;
    }

    /**
     *
     */
    get pending(): boolean {
        return this._pending;
    }

    /**
     * Return an observable of the cached value or the given fallback if cache is invalid
     * @param fallback : The fallback used to refresh the value when the cache is not valid anymore
     */
    public get(fallback: Executable<T>): Observable<T> {
        if (this.valid) {
            return of(this._value);
        }

        return this.buildObservable(fallback);
    }

    /**
     *
     * @param fallback
     */
    private buildObservable(fallback: Executable<T>): Observable<T> {
        return Observable.create((o: Observer<T>) => {
            const src$ = fallback().pipe(
                tap(c => this.updateCache(c)),
                tap(c => this.notifyInflightObservers(c))
            );

            // first call
            if (!this.pending) {
                this._pending = true;
                src$.subscribe(o);
                return () => this.handleUnSubscription();
            }

            // inflight observable
            const value$ = this.onValue$ || (this.onValue$ = new Subject<T>());
            const cancel = this.onCancel$ || (this.onCancel$ = new Subject<void>());
            const cancel$ = cancel.pipe(switchMap(() => src$));

            race(value$, cancel$).subscribe(o);
        });
    }

    /**
     * Invalidate the cache.
     */
    public invalidate(): void {
        this._valid = false;
    }

    private updateCache(content: T) {
        this._value = content;
        this._valid = true;
        this._pending = false;
    }

    private notifyInflightObservers(content: T) {
        if (this.onValue$ && this.onValue$.observers.length > 0) {
            this.onValue$.next(content);
        }

        // dispose the subject as soon as possible
        this.dispose();
    }

    private handleUnSubscription() {
        // there is no inflight observers
        if (!this.onValue$) {
            this._pending = false;
            return;
        }

        // there is inflight observers
        this.onCancel$.next(void 0);
    }

    private dispose() {
        if (this.onValue$) {
            this.onValue$.complete();
        }

        this.onValue$ = null;
        this.onCancel$ = null;
    }
}
