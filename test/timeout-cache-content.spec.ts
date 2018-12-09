import { assert } from 'chai';
import { switchMap } from 'rxjs/operators';
import { MockService, Operation } from './mock-service';
import { Executable } from 'src/executable';
import { Subject, Subscription } from 'rxjs';
import { TimeoutCacheContent } from '../src/timeout-cache-content';



describe('Timeout cache content', function(){
    let cacheContent: TimeoutCacheContent<Operation>;
    let service: MockService;

    beforeEach(() => {
        cacheContent = new TimeoutCacheContent<Operation>(500);
        service = new MockService();
    });

    describe('Max age validity', () => {
        it('should be invalid after {maxAge} -> 500ms', function(done){
            this.timeout(650);
            const call = service.getValue.bind(service, 0);
            cacheContent.get(call).subscribe(() => {
                // should be true
                assert.isTrue(cacheContent.valid);

                //after {maxAge}
                setTimeout(() => {
                    assert.isFalse(cacheContent.valid);
                    done();
                }, 600);
            });
        });
    });
});
