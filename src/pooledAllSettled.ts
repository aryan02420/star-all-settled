import { DeferredPromise } from "./types.ts";

export async function pooledAllSettled<T extends unknown = unknown>(
  tasks: readonly DeferredPromise<T>[],
  options?: {
    size?: number;
    onBeforeExecute?: (task: DeferredPromise<T>) => void;
    onAfterSettled?: (task: DeferredPromise<T>) => void;
  },
): Promise<PromiseSettledResult<T>[]> {
  const taskQueue = (function* () {
    yield* tasks;
  })();

  const MAX_WORKERS = Math.max(options?.size ?? 1, 1);
  const settled: PromiseSettledResult<T>[] = [];
  const workerPromises: Promise<void>[] = [];

  for (let i = 0; i < MAX_WORKERS; i++) {
    const workerPromise = new Promise<void>((resolve) => {
      const worker = async () => {
        while (true) {
          const task = taskQueue.next();

          if (task.done) break;

          options?.onBeforeExecute?.(task.value);

          try {
            const result = await task.value.execute();
            settled.push({ status: "fulfilled", value: result });
          } catch (error) {
            settled.push({ status: "rejected", reason: error });
          }

          options?.onAfterSettled?.(task.value);
        }

        resolve();
      };

      worker();
    });

    workerPromises.push(workerPromise);
  }

  await Promise.all(workerPromises);

  return settled;
}
