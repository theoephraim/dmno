import { __name } from './chunk-TXZD2JN3.mjs';

// ../ts-lib/src/defer-promise.ts
function createDeferredPromise() {
  let resolve = /* @__PURE__ */ __name(() => {
  }, "resolve");
  let reject = /* @__PURE__ */ __name(() => {
  }, "reject");
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return { promise, resolve, reject };
}
__name(createDeferredPromise, "createDeferredPromise");

// ../ts-lib/src/promise-delay.ts
async function promiseDelay(delayInMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, delayInMs);
  });
}
__name(promiseDelay, "promiseDelay");

// ../../node_modules/.pnpm/is-promise@4.0.0/node_modules/is-promise/index.mjs
function isPromise(obj) {
  return !!obj && (typeof obj === "object" || typeof obj === "function") && typeof obj.then === "function";
}
__name(isPromise, "isPromise");

// ../ts-lib/src/try-catch.ts
async function tryCatch(tryFn, catchFn) {
  try {
    return await tryFn();
  } catch (err) {
    let catchResult = catchFn(err);
    if (isPromise(catchResult)) {
      catchResult = await catchResult;
    }
    return catchResult;
  }
}
__name(tryCatch, "tryCatch");

export { createDeferredPromise, promiseDelay, tryCatch };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=chunk-W4DES726.mjs.map