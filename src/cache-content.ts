import { Observable, of, Subject } from "rxjs";
import { tap, switchMap } from 'rxjs/operators';
import { Executable } from "./executable";
import { cloneDeep } from 'lodash';

export class CacheContent<T>{

    private valid:boolean;
    private subject:Subject<any>;

    constructor(
        private _value:T = null,
    ) {
        this.valid = (this._value != null);
    }

    /**
     * Prevent value mutation by cloning it
     */
    get value():T{
        return cloneDeep(this._value) as T;
    }

    /**
     * Return an observable of the cached value or the given fallback if cache is invalid
     * @param fallback : The fallback used to refresh the value when the cache is not valid anymore
     */
    public get(fallback: Executable<T>): Observable<T>{
        return of({}).pipe(
            switchMap(() => {
                if(this.valid){
                    return of(this._value);
                }

                if(this.subject == null){
                    this.subject = new Subject<T>();
                    return fallback().pipe(
                        tap(c => this.updateCache(c)),
                        tap(c => this.notifyInflightObservers(c))
                    );
                }

                return this.subject.asObservable();
            })
        );
    }

    /**
     * Invalidate the cache.
     */
    public invalidate():void{
        this.valid = false;
    }

    private updateCache(content:T){
        this._value = content;
        this.valid = true;
    }

    private notifyInflightObservers(content:T){
        if(this.subject.observers.length > 0){
            this.subject.next(content);
            this.subject.complete();
        }
        this.subject = null;
    }
}