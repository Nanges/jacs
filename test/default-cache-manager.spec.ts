import { assert } from 'chai';
import { MockService, Operation } from './mock-service';
import { DefaultCacheManager } from '../src/managers/default/default-cache-manager';
import { Executable } from '../src/executable';

describe('Default cache manager', function() {
    let mngr: DefaultCacheManager;
    let service: MockService;

    beforeEach(() => {
        mngr = new DefaultCacheManager({
            maxAge: 500,
            invalidateOn: ['VALUE_CHANGES'],
            maxStack: 2
        });

        service = new MockService();
    });

    describe('Max age validity', () => {
        it('should invalidate the cache after {maxAge} 500ms', done => {
            const call = service.getValue.bind(service, 0) as Executable<Operation>;

            mngr.execute(call, [0]).subscribe(v => {
                assert.equal(v.id, 1);
            });

            setTimeout(() => {
                mngr.execute(call, [0]).subscribe(v => {
                    assert.equal(v.id, 1);
                });
            }, 200);

            setTimeout(() => {
                mngr.execute(call, [0]).subscribe(v => {
                    assert.equal(v.id, 2);
                    done();
                });
            }, 600);
        });
    });

    describe('Max stack validity', () => {
        it('should keep the stack with {maxStack} -> 2 entries', () => {
            const call = service.getValue.bind(service, 0) as Executable<Operation>;
            const call1 = service.getValue.bind(service, 1) as Executable<Operation>;
            const call2 = service.getValue.bind(service, 2) as Executable<Operation>;

            mngr.execute(call, [0]).subscribe();
            mngr.execute(call1, [1]).subscribe();
            mngr.execute(call2, [2]).subscribe();

            assert.equal(mngr.map.size, 2);
            assert.isFalse(mngr.map.has('[0]'));
            assert.isTrue(mngr.map.has('[1]'));
            assert.isTrue(mngr.map.has('[2]'));
        });
    });
});
