import { Observable, of } from "rxjs";
import { delay } from "rxjs/operators";

export interface People{
    name:string;
}

export interface Operation{
    data:People;
    id:number;
}

export class MockService{

    private db:People[] = [
        {
            name:'John'
        },
        {
            name:'Jack'
        },
        {
            name:'Daniele'
        }
    ];

    public counter = 0;

    getValue(index, _delay = 0): Observable<Operation>{
        
        let src$ = Observable.create(observer => {
            observer.next(<Operation>{
                id: ++this.counter,
                data:this.db[index]
            });

            observer.complete();
        });
        
        if(_delay > 0){
            src$ = src$.pipe(delay(_delay));
        }

        return src$;
    }
}