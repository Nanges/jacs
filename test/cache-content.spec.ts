import { assert, expect } from "chai";
import { CacheContent, Executable } from "../src/cache-content";
import { of, Observable } from "rxjs";
import { delay, mergeMap, tap, ignoreElements } from "rxjs/operators";
import { MockService, Operation } from "./mock-service";

describe('Cache content', () => {

    let cacheContent:CacheContent;
    let service:MockService;

    beforeEach(() => {
        cacheContent = new CacheContent();
        service = new MockService();
    });

    describe('get() method', () => {

        it('should return expected data', (done) => {

            const call1 = service.getValue.bind(service,0) as Executable<Operation>;

            cacheContent.get(call1)
                .subscribe(v => {
                    assert.equal(v.data.name, 'John');
                    done();
                });
        })

        it('should cache the value of the first observable parameter', (done) => {

            const call1 = service.getValue.bind(service,0) as Executable<Operation>;
            const call2 = service.getValue.bind(service,1) as Executable<Operation>;

            cacheContent.get(call1)
                .pipe(
                    mergeMap(() => cacheContent.get(call2))
                )
                .subscribe(v => {
                    assert.notEqual(v.data.name, 'Jack');
                    assert.equal(v.data.name, 'John');
                    done();
                });
        });

        it('should return observable not equal to source', () => {
            const src$ = service.getValue.bind(service, 0);
            const cC$ = cacheContent.get(src$);

            assert.notEqual(src$, cC$);
        })

        it('should return observable using source once', (done) => {
            const source = service.getValue.bind(service, 0) as Executable<Operation>;
            const cC = cacheContent.get(source);

            cC.subscribe(v => {
                assert.equal(v.id, 1);
            });

            cC.pipe(delay(20))
            .subscribe(v => {
                assert.equal(v.id, 1);
                done();
            })
        })

        it('should use inflight observable feature', (done) => {
            const source = service.getValue.bind(service, 1, 10) as Executable<Operation>;

            cacheContent.get(source).subscribe(v => {
                assert.equal(v.id, 1);
            });

            cacheContent.get(source).subscribe(v => {
                assert.equal(v.id, 1);
                setTimeout(() => done(), 10);
            });
        });

        it('should use inflight observable feature when multiple subscriptions on returned source', (done) => {
            
            const source = service.getValue.bind(service, 2, 10)  as Executable<Operation>;
            const cC = cacheContent.get(source);

            cC.subscribe(v => {
                assert.equal(v.id, 1);
            });

            cC.subscribe(v => {
                assert.equal(v.id, 1);
                setTimeout(() => done(), 10);
            });
        });
    });

    describe('cache invalidation', () => {
        it('should invalidate the cache', (done) => {

            const call1 = service.getValue.bind(service, 0) as Executable<Operation>;
            const call2 = service.getValue.bind(service, 1) as Executable<Operation>;

            cacheContent.get(call1)
                .pipe(
                    tap(() => cacheContent.invalidate()),
                    mergeMap(() => cacheContent.get(call2))
                )
                .subscribe(v => {
                    assert.notEqual(v.data.name, 'John');
                    assert.equal(v.data.name, 'Jack');
                    done();
                });
        });

        it('should use source twice when invalidation between', (done) => {
            const source = service.getValue.bind(service, 0) as Executable<Operation>;
            const cC = cacheContent.get(source);

            cC.subscribe(v => {
                assert.equal(v.id, 1);
                cacheContent.invalidate();
            });

            cC.pipe(delay(20))
            .subscribe(v => {
                assert.equal(v.id, 2);
                done();
            })
        });
    });

    describe('default cache', () => {
        it('use default value', (done) => {
            cacheContent = new CacheContent('foo');
            cacheContent.get(service.getValue.bind(service, 0) as Executable<string|Operation>)
                .subscribe(v => {
                    assert.notEqual(v, 'bar');
                    assert.equal(v, 'foo');
                    done();
                });
        });
    })
});