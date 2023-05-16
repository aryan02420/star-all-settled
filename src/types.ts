export type DeferredPromise<T extends unknown = unknown> = {
  execute(): Promise<T>;
};
