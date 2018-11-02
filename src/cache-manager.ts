import { Observable } from "rxjs";
import { Executable } from "./cache-content";

export abstract class CacheManager{
    abstract execute(executable: Executable<any>, args:any[]):Observable<any>;
}