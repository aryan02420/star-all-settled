import { DeferredPromise } from "./types.ts";

export const deferPromise = <
  TArgs extends readonly unknown[] = readonly never[],
  TResult extends unknown = unknown,
>(
  promiseFn: (...args: TArgs) => Promise<TResult>,
  ...promiseFnArgs: TArgs
): DeferredPromise<TResult> => {
  return {
    execute() {
      // TODO: execute only once?
      return promiseFn(...promiseFnArgs);
    },
  };
};
