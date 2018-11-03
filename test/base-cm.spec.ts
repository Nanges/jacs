import { BaseCacheManager } from "../src/managers/base-cm";
import { MockService, Operation } from "./mock-service";
import { assert } from "chai";
import { Executable } from "src/cache-content";
import { switchMap } from "rxjs/operators";

describe('Base Cache Manager', () => {
    let cm: BaseCacheManager;
    let service: MockService;

    beforeEach(() => {
        service = new MockService();
        cm = new BaseCacheManager();
    });

    it('should return expected data', (done) => {

        const call1 = service.getValue.bind(service,0) as Executable<Operation>;

        cm.execute(call1, [0])
            .subscribe(v => {
                assert.equal(v.data.name, 'John');
                done();
            });
    })

    it('should cache the value if args never changes', (done) => {

        const call1 = service.getValue.bind(service,0) as Executable<Operation>;
        const call2 = service.getValue.bind(service,1) as Executable<Operation>;

        cm.execute(call1, [0]).pipe(
            switchMap(() => cm.execute(call2, [0]))
        ).subscribe(v => {
            assert.equal(v.id, 1);
            assert.equal(v.data.name, 'John');
            done();
        });
    })

    it('should clear the cache if parameters change', (done) => {

        const call1 = service.getValue.bind(service,0) as Executable<Operation>;
        const call2 = service.getValue.bind(service,1) as Executable<Operation>;

        cm.execute(call1, [0]).pipe(
            switchMap(() => cm.execute(call2, [1]))
        ).subscribe(v => {
            assert.equal(v.id, 2);
            assert.equal(v.data.name, 'Jack');
            done();
        });
    })

})