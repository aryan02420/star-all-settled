import { DeferredPromise } from "./types.ts";

export async function parallelAllSettled<T extends unknown = unknown>(
  tasks: readonly DeferredPromise<T>[],
  options?: {
    onBeforeExecute?: (task: DeferredPromise<T>) => void;
    onAfterSettled?: (task: DeferredPromise<T>) => void;
  },
): Promise<PromiseSettledResult<T>[]> {
  return await Promise.allSettled(
    tasks.map((task) => {
      options?.onBeforeExecute?.(task);

      try {
        return task.execute();
      } catch (error) {
        throw error;
      } finally {
        options?.onAfterSettled?.(task);
      }
    }),
  );
}
