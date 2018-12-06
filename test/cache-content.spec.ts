import { assert } from "chai";
import { CacheContent } from "../src/cache-content";
import { delay, mergeMap, tap } from "rxjs/operators";
import { MockService, Operation } from "./mock-service";
import { Executable } from "src/executable";

describe("Cache content", () => {
  let cacheContent: CacheContent<Operation>;
  let service: MockService;

  beforeEach(() => {
    cacheContent = new CacheContent<Operation>();
    service = new MockService();
  });

  describe("get() method", () => {
    it("should return expected data", done => {
      const call1 = service.getValue.bind(service, 0) as Executable<Operation>;

      cacheContent.get(call1).subscribe(v => {
        assert.equal(v.data.name, "John");
        done();
      });
    });

    it("should cache the value of the first observable parameter", done => {
      const call1 = service.getValue.bind(service, 0) as Executable<Operation>;
      const call2 = service.getValue.bind(service, 1) as Executable<Operation>;

      cacheContent
        .get(call1)
        .pipe(mergeMap(() => cacheContent.get(call2)))
        .subscribe(v => {
          assert.notEqual(v.data.name, "Jack");
          assert.equal(v.data.name, "John");
          done();
        });
    });

    it("should use inflight observable feature", done => {
      const call1 = service.getValue.bind(service, 1, 10) as Executable<
        Operation
      >;
      const call2 = service.getValue.bind(service, 1, 10) as Executable<
        Operation
      >;

      cacheContent.get(call1).subscribe(v => {
        assert.equal(v.id, 1);
      });

      cacheContent.get(call2).subscribe(v => {
        assert.equal(v.id, 1);
        setTimeout(() => done(), 10);
      });
    });
  });

  describe("cache invalidation", () => {
    it("should invalidate the cache", done => {
      const call1 = service.getValue.bind(service, 0) as Executable<Operation>;
      const call2 = service.getValue.bind(service, 1) as Executable<Operation>;

      cacheContent
        .get(call1)
        .pipe(
          tap(() => cacheContent.invalidate()),
          mergeMap(() => cacheContent.get(call2))
        )
        .subscribe(v => {
          assert.notEqual(v.data.name, "John");
          assert.equal(v.data.name, "Jack");
          done();
        });
    });
  });

  describe("default cache", () => {
    it("use default value", done => {
      let cacheContent = new CacheContent<string | Operation>("foo");
      cacheContent
        .get(service.getValue.bind(service, 0) as Executable<
          string | Operation
        >)
        .subscribe(v => {
          assert.notEqual(v, "bar");
          assert.equal(v, "foo");
          done();
        });
    });
  });

  describe("value accessor", () => {
    it("use value accessor", done => {
      let cacheContent = new CacheContent<Operation>();
      cacheContent
        .get(service.getValue.bind(service, 0) as Executable<Operation>)
        .subscribe(v => {
          assert.deepEqual(v, cacheContent.value);
          done();
        });
    });

    it("should value accessor be a clone of original cached value", done => {
      let cacheContent = new CacheContent<Operation>();
      cacheContent
        .get(service.getValue.bind(service, 0) as Executable<Operation>)
        .subscribe(v => {
          assert.notEqual(v, cacheContent.value);
          done();
        });
    });
  });
});
