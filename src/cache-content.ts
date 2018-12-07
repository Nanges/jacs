import { Observable, of, Subject, Subscription, Observer, race } from 'rxjs';
import { tap, switchMap, finalize, takeUntil } from 'rxjs/operators';
import { Executable } from './executable';
import { cloneDeep } from 'lodash';

export class CacheContent<T> {
    private _valid: boolean;
    private _pending: boolean;
    private subject: Subject<any>;
    private onCancel: Subject<void>;
    private src$: Observable<T>;

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

        //
        this.src$ = fallback().pipe(
            tap(c => this.updateCache(c)),
            tap(c => this.notifyInflightObservers(c))
        );

        // first subscription will set the pending state to true
        if (!this.pending) {
            this._pending = true;
            return Observable.create((o: Observer<T>) => {
                this.src$.subscribe(o);
                return () => this.handleUnSubscription();
            });
        }

        console.log('inflight mode');
        // inflight observable
        if (!this.subject) {
            this.subject = new Subject<T>();
        }

        if (!this.onCancel) {
            this.onCancel = new Subject<void>();
        }

        return Observable.create((o: Observer<T>) => {
            console.log('inflight subscription');
            const cancelSrc$ = this.onCancel.pipe(
                tap(() => console.log('cancelled')),
                switchMap(() => this.src$)
            );
            race(cancelSrc$, this.subject).subscribe(o);
        });

        // return Observable.create((o: Observer<T>) => {
        //     if (!this.onCancel) {
        //         this.onCancel = new Subject<void>();
        //     }

        //     const transit$ = this.onCancel.pipe(
        //         tap(() => console.log('cancel')),
        //         switchMap(() => this.src$)
        //     );
        //     const t$ = race(transit$, this.subject);
        //     t$.subscribe(o);
        // });
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
        if (this.subject && this.subject.observers.length > 0) {
            this.subject.next(content);
        }

        // dispose the subject as soon as possible
        this.disposeSubject();
    }

    // private handleError(e: any) {
    //     this.subject.error(e);
    //     this.disposeSubject();
    // }

    private handleUnSubscription() {
        console.log('handle cancellation');
        if (!this.valid && this.subject) {
            console.log(this.onCancel.observers.length);
            this.onCancel.next(void 0);
        } else {
            this._pending = false;
        }

        /*if (this.onCancel) {
            console.log(this.subject.observers.length);
            this.onCancel.next(void 0);
        } else {
            this.disposeSubject();
        }*/
    }

    private disposeSubject() {
        if (this.subject) {
            this.subject.complete();
            this.subject = null;
        }
    }
}
