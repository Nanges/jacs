import { BaseCacheManager } from "../src/managers/base-cm";
import { MockService, Operation } from "./mock-service";
import { assert } from "chai";
import { switchMap } from "rxjs/operators";
import { Executable } from "../src/executable";

describe('Base Cache Manager', () => {
    let cm: BaseCacheManager;
    let service: MockService;

    beforeEach(() => {
        service = new MockService();
        cm = new BaseCacheManager();
    });

    it('should return expected data', (done) => {

        const call1 = service.getValue.bind(service,0);

        cm.execute<Operation>(call1, [0])
            .subscribe(v => {
                assert.equal(v.data.name, 'John');
                done();
            });
    })

    it('should cache the value if args never changes', (done) => {

        const call1 = service.getValue.bind(service,0);
        const call2 = service.getValue.bind(service,1);

        cm.execute<Operation>(call1, [0]).pipe(
            switchMap(() => cm.execute<Operation>(call2, [0]))
        ).subscribe(v => {
            assert.equal(v.id, 1);
            assert.equal(v.data.name, 'John');
            done();
        });
    })

    it('should clear the cache if parameters changes', (done) => {

        const call1 = service.getValue.bind(service,0);
        const call2 = service.getValue.bind(service,1);

        cm.execute<Operation>(call1, [0]).pipe(
            switchMap(() => cm.execute<Operation>(call2, [1]))
        ).subscribe(v => {
            assert.equal(v.id, 2);
            assert.equal(v.data.name, 'Jack');
            done();
        });
    })

})