import { assert } from 'chai';
import { CacheContent } from '../src/cache-content';
import { delay, switchMap, concatMap } from 'rxjs/operators';
import { MockService, Operation } from './mock-service';
import { Executable } from 'src/executable';
import { Subject } from 'rxjs';

describe('Cache content', () => {
    let cacheContent: CacheContent<Operation>;
    let service: MockService;

    beforeEach(() => {
        cacheContent = new CacheContent<Operation>();
        service = new MockService();
    });

    describe('get() method', () => {
        it('should return expected data', done => {
            const call1 = service.getValue.bind(service, 0) as Executable<Operation>;

            cacheContent.get(call1).subscribe(v => {
                assert.equal(v.data.name, 'John');
                done();
            });
        });

        it('should cache the value of the first observable parameter', done => {
            const call1 = service.getValue.bind(service, 0) as Executable<Operation>;
            const call2 = service.getValue.bind(service, 1) as Executable<Operation>;

            cacheContent
                .get(call1)
                .pipe(switchMap(() => cacheContent.get(call2)))
                .subscribe(v => {
                    assert.notEqual(v.data.name, 'Jack');
                    assert.equal(v.data.name, 'John');
                    done();
                });
        });
    });

    describe('call id and subscription features', () => {
        it('call, cancel, call', done => {
            const call = service.getValue.bind(service, 1, 10) as Executable<Operation>;
            const sub = cacheContent.get(call).subscribe();
            sub.unsubscribe();
            cacheContent.get(call).subscribe(v => done());
        });

        it('call, call, cancel', done => {
            const call = service.getValue.bind(service, 1, 10) as Executable<Operation>;

            const sub = cacheContent.get(call).subscribe();
            const sub2 = cacheContent.get(call).subscribe(() => done());
            sub.unsubscribe();
        });
    });

    describe('inflight observable', () => {
        it('should use inflight observable feature', done => {
            const source = service.getValue.bind(service, 1, 10) as Executable<Operation>;

            cacheContent.get(source).subscribe(v => {
                assert.equal(v.id, 1);
            });

            cacheContent.get(source).subscribe(v => {
                assert.equal(v.id, 1);
                setTimeout(() => done(), 5);
            });
        });

        it('should work with switchMap', done => {
            // source with a delay of 10ms
            const source = service.getValue.bind(service, 1, 10) as Executable<Operation>;

            const emitter = new Subject();

            emitter.pipe(switchMap(() => cacheContent.get(source))).subscribe(v => {
                assert.equal(v.id, 2);
                done();
            });

            emitter.next(0);
            setTimeout(() => {
                emitter.next(0);
            }, 5);
        });
    });

    describe('cache invalidation', () => {
        it('should invalidate the cache', done => {
            const call1 = service.getValue.bind(service, 0) as Executable<Operation>;
            const call2 = service.getValue.bind(service, 1) as Executable<Operation>;

            cacheContent
                .get(call1)
                .pipe(
                    concatMap(() => {
                        cacheContent.invalidate();
                        return cacheContent.get(call2);
                    })
                )
                .subscribe(v => {
                    assert.notEqual(v.data.name, 'John');
                    assert.equal(v.data.name, 'Jack');
                    done();
                });
        });
    });

    describe('default cache', () => {
        it('use default value', done => {
            let cacheContent = new CacheContent<string | Operation>('foo');
            cacheContent.get(service.getValue.bind(service, 0) as Executable<string | Operation>).subscribe(v => {
                assert.notEqual(v, 'bar');
                assert.equal(v, 'foo');
                done();
            });
        });
    });

    describe('value accessor', () => {
        it('use value accessor', done => {
            let cacheContent = new CacheContent<Operation>();
            cacheContent.get(service.getValue.bind(service, 0) as Executable<Operation>).subscribe(v => {
                assert.deepEqual(v, cacheContent.value);
                done();
            });
        });

        it('should value accessor be a clone of original cached value', done => {
            let cacheContent = new CacheContent<Operation>();
            cacheContent.get(service.getValue.bind(service, 0) as Executable<Operation>).subscribe(v => {
                assert.notEqual(v, cacheContent.value);
                done();
            });
        });
    });
});
