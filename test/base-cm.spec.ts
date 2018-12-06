import { assert } from "chai";
import { switchMap, concat, tap } from "rxjs/operators";
import { BaseCacheManager } from "../src/managers/base-cm";
import { MockService, Operation } from "./mock-service";
import { CacheManagerResolver } from "../src/cache-manager-resolver";
import { cacheDecorator as cacheable } from "../src/cache-decorator";

/**
 * declare factory before setup the service
 */
CacheManagerResolver.factory = () => new BaseCacheManager();

class BcmMockService extends MockService{
    @cacheable()
    getValue(index:number, delay?: number){
        return super.getValue(index, delay);
    }
}


describe('Base Cache Manager', () => {
    let service: BcmMockService;

    beforeEach(() => {
        service = new BcmMockService();
    });

    it('should return expected data', (done) => {

        service.getValue(0)
            .subscribe(v => {
                assert.equal(v.id, 1);
                assert.equal(v.data.name, 'John');
                done();
            })
    })

    it('should cache the value if args never changes', (done) => {
        service.getValue(0).pipe(
            tap(v => assert.equal(v.id, 1)),
            switchMap(() => service.getValue(0)),
            tap(v => assert.equal(v.id, 1)),
        ).subscribe(v => done());
    })

    it('should clear the cache if parameters changes', (done) => {

        service.getValue(0).pipe(
            tap(v => {
                assert.equal(v.id, 1)
                assert.equal(v.data.name, 'John');
            }),
            switchMap(() => service.getValue(1)),
            tap(v => {
                assert.equal(v.id, 2);
                assert.equal(v.data.name, 'Jack');
            }),
            switchMap(() => service.getValue(2)),
            tap(v => {
                assert.equal(v.id, 3)
                assert.equal(v.data.name, 'Daniele');
            })
        ).subscribe(v => done());
    })

    it('should use one manager per instance', (done) => {

        const service1 = new BcmMockService();
        const service2 = new BcmMockService();

        service1.getValue(0).pipe(
            tap(v => {
                assert.equal(v.id, 1)
                assert.equal(v.data.name, 'John');
            }),
            switchMap(() => service1.getValue(1)),
            tap(v => {
                assert.equal(v.id, 2);
                assert.equal(v.data.name, 'Jack');
            }),
            switchMap(() => service2.getValue(0)),
            tap(v => {
                assert.equal(v.id, 1)
                assert.equal(v.data.name, 'John');
            }),
            switchMap(() => service2.getValue(1)),
            tap(v => {
                assert.equal(v.id, 2);
                assert.equal(v.data.name, 'Jack');
            })
        ).subscribe(v => done());
    })

})