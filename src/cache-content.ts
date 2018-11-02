import { Observable, of, Subject } from "rxjs";
import { tap, mergeMap } from 'rxjs/operators';

export type Executable<T> = () => Observable<T> 

export class CacheContent{

    private valid:boolean;
    private subject:Subject<any>;

    constructor(
        private cache:any = null,
    ) {
        this.valid = (this.cache != null);
    }

    public get<T>(fallback: Executable<T>): Observable<T>{
        return of({}).pipe(
            mergeMap(() => {
                if(this.valid){
                    return of(this.cache);
                }

                if(this.subject == null){
                    this.subject = new Subject();
                    return fallback().pipe(tap(c => this.updateCache(c)));
                }

                return this.subject.asObservable();
            })
        );
    }

    public invalidate():void{
        this.valid = false;
    }

    private updateCache(content:any){
        this.cache = content;
        this.valid = true;
        this.notifyInflightObservers(content);
    }

    private notifyInflightObservers(content:any){
        if(this.subject.observers.length > 0){
            this.subject.next(content);
            this.subject.complete();
        }
        this.subject = null;
    }
}