import { BaseCacheContent } from "./base-cache-content";

export class TemporaryCacheContent<T> extends BaseCacheContent<T>{

    private lastUpdate:number;

    /**
     *
     */
    constructor(private readonly maxAge:number = 300000, _value:T = null) {
        super(_value);
    }

    get valid(){
        return (Date.now() - this.lastUpdate) < this.maxAge && this._valid;
    }

    protected updateCache(content: T){
        super.updateCache(content);
        this.lastUpdate = Date.now();
    }
}
