import { Subject, Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Executable } from "./executable";

export class Dispatcher{

    private subject:Subject<any>;

    dispatch(handler:Executable<any>):Observable<any>{
        if(this.subject == null){
            this.subject = new Subject<any>();
            return handler().pipe(tap(c => this.notifyInflightObservers(c)));
        }

        return this.subject.asObservable();
    }

    private notifyInflightObservers(content:any){
        if(this.subject.observers.length > 0){
            this.subject.next(content);
            this.subject.complete();
        }
        this.subject = null;
    }
}