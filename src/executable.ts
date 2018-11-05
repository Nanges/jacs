import { Observable } from "rxjs";

export type Executable<T> = () => Observable<T> 