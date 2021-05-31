export default class DeferredPromise<TFulfilled> {
    promise: Promise<TFulfilled>;
    resolve: (value?: any) => void
    reject: (reason?: any) => void

    constructor() {
        this.promise = new Promise((r, rj) => {
            this.resolve = r;
            this.reject = rj;
        })
    }
}
