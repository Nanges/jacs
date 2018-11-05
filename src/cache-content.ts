import { Observable, of, Subject } from "rxjs";
import { tap, mergeMap } from 'rxjs/operators';
import { Dispatcher } from "./dispatcher";
import { Executable } from "./executable";

export class CacheContent{

    private valid:boolean;
    private dispatcher: Dispatcher;

    constructor(
        private cache:any = null,
    ) {
        this.dispatcher = new Dispatcher();
        this.valid = (this.cache != null);
    }

    public get<T>(fallback: Executable<T>): Observable<T>{
        return of({}).pipe(
            mergeMap(() => {
                if(this.valid){
                    return of(this.cache);
                }

                return this.dispatcher.dispatch(() => fallback().pipe(tap(c => this.updateCache(c))));
            })
        );
    }

    public invalidate():void{
        this.valid = false;
    }

    private updateCache(content:any){
        this.cache = content;
        this.valid = true;
    }
}