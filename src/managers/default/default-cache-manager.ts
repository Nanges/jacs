import { Observable } from "rxjs";
import { Executable } from "src/executable";
import { DefaultCacheConfig } from "./default-cache-config";
import { BaseCacheContent } from "../../base-cache-content";

const defaultConfig: DefaultCacheConfig = {
  MAX_AGE: 300000 //5 min
};

export class DefaultCacheManager {
  /**
   *
   */
  constructor(private config: DefaultCacheConfig = defaultConfig) {}

  setup(config: DefaultCacheConfig) {
    Object.assign(this.config, config);
  }

  execute<T>(executable: Executable<T>, args: any[]): Observable<T> {
    const cC = new BaseCacheContent();
    cC.get(undefined);
    return null;
  }
}
