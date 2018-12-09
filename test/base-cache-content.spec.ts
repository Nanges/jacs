import { assert } from 'chai';
import { BaseCacheContent } from '../src/base-cache-content';
import { switchMap } from 'rxjs/operators';
import { MockService, Operation } from './mock-service';
import { Executable } from 'src/executable';
import { Subject, Subscription } from 'rxjs';

describe('Base cache content', () => {
    let cacheContent: BaseCacheContent<Operation>;
    let service: MockService;

    beforeEach(() => {
        cacheContent = new BaseCacheContent<Operation>();
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
                .pipe(switchMap(v => {
                    assert.isTrue(cacheContent.valid);
                    assert.equal(v.data.name, 'John');
                    return cacheContent.get(call2);
                }))
                .subscribe(v => {
                    assert.notEqual(v.data.name, 'Jack');
                    assert.equal(v.data.name, 'John');
                    assert.equal(v.id, 1)
                    done();
                });
        });
    });

    describe('inflight observable and subscription features', () => {
        it('should work with switchMap', done => {
            // source with a delay of 10ms
            const source = service.getValue.bind(service, 1, 10) as Executable<Operation>;

            const emitter = new Subject();

            emitter.pipe(
                switchMap(() => {
                    assert.isFalse(cacheContent.valid);
                    return cacheContent.get(source)
                })
            ).subscribe(v => {
                assert.equal(v.id, 2);
                done();
            });

            emitter.next(0);
            setTimeout(() => {
                emitter.next(0);
            }, 5);
        });

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

        it('call, cancel, call', done => {
            const call = service.getValue.bind(service, 1, 10) as Executable<Operation>;
            const sub = cacheContent.get(call).subscribe(v => {
                assert.equal(v.id, 1);
                assert.isFalse(cacheContent.valid);
            });
            sub.unsubscribe();
            cacheContent.get(call).subscribe(v => {
                assert.equal(v.id, 2);
                done();
            });
        });

        it('call, call, switchMap', done => {
            const call = service.getValue.bind(service, 1, 100) as Executable<Operation>;

            const emitter = new Subject();

            emitter.pipe(switchMap(() => cacheContent.get(call))).subscribe(v => {
                assert.equal(v.id, 1);
                done();
            });

            emitter.next(0);
            setTimeout(() => cacheContent.get(call).subscribe(v => {
                assert.equal(v.id, 1);
            }), 5);
            setTimeout(() => emitter.next(0), 50);
        });

        it('call, call, cancel', done => {
            const call = service.getValue.bind(service, 1, 10) as Executable<Operation>;

            const sub = cacheContent.get(call).subscribe();
            const sub2 = cacheContent.get(call).subscribe(v => {
                assert.equal(v.id, 1);
                done();
            });
            sub.unsubscribe();
        });

        it('call, call, switchmap, cancel', done => {
            const call = service.getValue.bind(service, 1, 100) as Executable<Operation>;
            const emitter = new Subject();
            let subscription: Subscription;

            emitter.pipe(switchMap(() => cacheContent.get(call))).subscribe();

            // 1st call
            emitter.next(0);
            assert.equal(service.counter, 1);

            // 2nd call (inflight)
            setTimeout(() => {
                subscription = cacheContent.get(call).subscribe()
                assert.equal(service.counter, 1);
            }, 25);

            // switch
            setTimeout(() => {
                emitter.next(0);
                assert.equal(service.counter, 1);
            }, 50);

            // cancel
            setTimeout(() => {
                subscription.unsubscribe();
                assert.equal(service.counter, 1);
                done();
            }, 75);
        });
    });

    describe('cache invalidation', () => {
        it('should invalidate the cache', done => {
            const call1 = service.getValue.bind(service, 0) as Executable<Operation>;
            const call2 = service.getValue.bind(service, 1) as Executable<Operation>;

            cacheContent
                .get(call1)
                .pipe(
                    switchMap(() => {
                        cacheContent.invalidate();
                        assert.isFalse(cacheContent.valid);
                        return cacheContent.get(call2);
                    })
                )
                .subscribe(v => {
                    assert.notEqual(v.data.name, 'John');
                    assert.equal(v.data.name, 'Jack');
                    assert.equal(v.id, 2);
                    assert.isTrue(cacheContent.valid);
                    done();
                });
        });
    });

    describe('default cache', () => {
        it('use default value', done => {
            let cacheContent = new BaseCacheContent<string | Operation>('foo');
            assert.isTrue(cacheContent.valid);
            assert.equal(cacheContent.value, 'foo');


            cacheContent.get(service.getValue.bind(service, 0) as Executable<string | Operation>).subscribe(v => {
                assert.notEqual(v, 'bar');
                assert.equal(v, 'foo');
                assert.equal(service.counter, 0);
                done();
            });
        });
    });

    describe('value accessor', () => {
        it('use value accessor', done => {
            let cacheContent = new BaseCacheContent<Operation>();
            cacheContent.get(service.getValue.bind(service, 0) as Executable<Operation>).subscribe(v => {
                assert.deepEqual(v, cacheContent.value);
                done();
            });
        });

        it('should value accessor be a clone of original cached value', done => {
            let cacheContent = new BaseCacheContent<Operation>();
            cacheContent.get(service.getValue.bind(service, 0) as Executable<Operation>).subscribe(v => {
                assert.notEqual(v, cacheContent.value);
                done();
            });
        });
    });
});
