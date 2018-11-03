import { Observable } from "rxjs";
import { Executable } from "./cache-content";

export abstract class CacheManager{
    abstract execute<T>(executable: Executable<T>, args:any[]):Observable<T>;
}