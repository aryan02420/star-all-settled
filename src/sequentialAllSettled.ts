import { DeferredPromise } from "./types.ts";

export async function sequentialAllSettled<T extends unknown = unknown>(
  tasks: readonly DeferredPromise<T>[],
  options?: {
    onBeforeExecute?: (task: DeferredPromise<T>) => void;
    onAfterSettled?: (task: DeferredPromise<T>) => void;
  },
): Promise<PromiseSettledResult<T>[]> {
  const settled: PromiseSettledResult<T>[] = [];

  for (const task of tasks) {
    options?.onBeforeExecute?.(task);

    try {
      const result = await task.execute();
      settled.push({ status: "fulfilled", value: result });
    } catch (error) {
      settled.push({ status: "rejected", reason: error });
    } finally {
      options?.onAfterSettled?.(task);
    }
  }

  return settled;
}
