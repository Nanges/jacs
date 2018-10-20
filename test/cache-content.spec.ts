import { assert } from "chai";
import { CacheContent } from "../src/cache-content";
import { of, Observable } from "rxjs";
import { delay, mergeMap, tap } from "rxjs/operators";

describe('Cache content', () => {

    let cacheContent:CacheContent;

    beforeEach(() => {
        cacheContent = new CacheContent();
    });

    describe('get() method', () => {
        it('should cache the value of the first observable parameter', (done) => {
            cacheContent.get(of(2))
                .pipe(
                    mergeMap(() => cacheContent.get(of(4)))
                )
                .subscribe(v => {
                    assert.notEqual(v, 4);
                    assert.equal(v, 2);
                    done();
                });
        });

        it('should use inflight observable feature', (done) => {
            let counter = 0;
            const source = Observable.create(e => e.next(++counter)).pipe(delay(50));

            cacheContent.get(source).subscribe(v => {
                assert.equal(v, 1);
            });

            cacheContent.get(source).subscribe(v => {
                assert.equal(v, 1);
                done();
            });
        });
    });

    describe('cache invalidation', () => {
        it('should invalidate the cache', (done) => {
            cacheContent.get(of(2))
                .pipe(
                    tap(() => cacheContent.invalidate()),
                    mergeMap(() => cacheContent.get(of(4)))
                )
                .subscribe(v => {
                    assert.notEqual(v, 2);
                    assert.equal(v, 4);
                    done();
                });
        });
    });
});