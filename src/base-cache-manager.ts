import { Observable } from "rxjs";
import { Executable } from "./executable";

export abstract class BaseCacheManager{
    abstract execute<T>(executable: Executable<T>, args:any[]):Observable<T>;
}
