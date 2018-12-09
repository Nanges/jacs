import { BaseCacheContent } from "./base-cache-content";

export class TimeoutCacheContent<T> extends BaseCacheContent<T>{

    private _lastUpdate:number;

    get lastUpdate(){
        return this._lastUpdate;
    }

    /**
     *
     */
    constructor(private readonly maxAge:number = 300000, _value:T = null) {
        super(_value);
    }

    protected isValid(){
        return (Date.now() - this._lastUpdate) < this.maxAge && super.isValid();
    }

    protected updateCache(content: T){
        super.updateCache(content);
        this._lastUpdate = Date.now();
    }
}
