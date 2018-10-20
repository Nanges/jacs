import { assert } from "chai";
import { CacheContent } from "../src/cache-content";
import { of, Observable } from "rxjs";
import { delay, mergeMap, tap, ignoreElements } from "rxjs/operators";

describe('Cache content', () => {

    let cacheContent:CacheContent;

    beforeEach(() => {
        cacheContent = new CacheContent();
    });

    describe('get() method', () => {

        it('should return expected data', (done) => {

            cacheContent.get(of(2))
                .subscribe(v => {
                    assert.equal(v, 2);
                    done();
                });
        })

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

        it('should return observable not equal to source', () => {
            let counter = 0;
            const source = Observable.create(e => e.next(++counter));
            const cC = cacheContent.get(source);

            assert.notEqual(source, cC);
        })

        it('should return observable using source once', (done) => {
            let counter = 0;
            const source = Observable.create(e => e.next(++counter));
            const cC = cacheContent.get(source);

            cC.subscribe(v => {
                assert.equal(v, 1);
            });

            cC.pipe(delay(20))
            .subscribe(v => {
                assert.equal(v, 1);
                done();
            })
        })

        it('should use inflight observable feature', (done) => {
            let counter = 0;
            const source = Observable.create(e => e.next(++counter)).pipe(delay(10));

            cacheContent.get(source).subscribe(v => {
                assert.equal(v, 1);
            });

            cacheContent.get(source).subscribe(v => {
                assert.equal(v, 1);
                setTimeout(() => done(), 10);
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

        it('should use source twice when invalidation between', (done) => {
            let counter = 0;
            const source = Observable.create(e => e.next(++counter));
            const cC = cacheContent.get(source);

            cC.subscribe(v => {
                assert.equal(v, 1);
                cacheContent.invalidate();
            });

            cC.pipe(delay(20))
            .subscribe(v => {
                assert.equal(v, 2);
                done();
            })
        });
    });
});