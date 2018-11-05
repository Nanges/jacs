import { Observable } from "rxjs";
import { Executable } from "./executable";

export abstract class CacheManager{
    abstract execute<T>(executable: Executable<T>, args:any[]):Observable<T>;
}