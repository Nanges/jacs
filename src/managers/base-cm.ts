import { CacheManager} from "../cache-manager";
import { Observable } from "rxjs";
import { CacheContent } from "../cache-content";
import { Executable } from "../executable";

export class BaseCacheManager extends CacheManager{

    private cacheContent = new CacheContent();
    private previousArgs:string;
    
    execute<T>(executable: Executable<T>, args: any[]): Observable<T> {
        const key = JSON.stringify(args);

        if(this.previousArgs !== key){
            this.cacheContent.invalidate();
            this.previousArgs = key;
        }

        return this.cacheContent.get(executable) as Observable<T>;
    }
}