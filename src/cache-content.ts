import { Observable, of, Subject } from "rxjs";
import { tap } from 'rxjs/operators';

export class CacheContent{

    private cache:any;
    private invalid:boolean;
    private subject:Subject<any>;

    /**
     *
     */
    constructor() {
        this.invalidate();
    }

    public get(source:Observable<any>):Observable<any>{

        if(!this.invalid){
            return of(this.cache);
        }

        if(this.subject == null){
            this.subject = new Subject();
            return source.pipe(tap(d => this.updateCache(d)));    
        }

        return this.subject.asObservable();
    }

    public invalidate():void{
        this.invalid = true;
    }

    private updateCache(content:any){
        this.cache = content;
        this.invalid = false;
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