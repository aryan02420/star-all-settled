import { DeferredPromise } from "./types.ts";

export async function batchedAllSettled<T extends unknown = unknown>(
  tasks: readonly DeferredPromise<T>[],
  options?: {
    size?: number;
    onBeforeExecute?: (task: DeferredPromise<T>) => void;
    onAfterSettled?: (task: DeferredPromise<T>) => void;
  },
): Promise<PromiseSettledResult<T>[]> {
  const settled: PromiseSettledResult<T>[] = [];
  const BATCH_SIZE = Math.max(options?.size ?? 1, 1);
  const numBatches = Math.ceil(tasks.length / BATCH_SIZE);

  for (let i = 0; i < numBatches; i++) {
    const batch = tasks.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);

    const batchSettled = await Promise.allSettled(
      batch.map((task) => {
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

    settled.concat(batchSettled);
  }

  return settled;
}
