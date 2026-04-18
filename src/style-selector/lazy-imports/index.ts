import React from 'react';

export interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
}

export function createDeferred<T>(): Deferred<T> {
  let resolve!: Deferred<T>['resolve'];
  let reject!: Deferred<T>['reject'];

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

export const styleSelector = createDeferred<{
  default: React.ComponentType<unknown>;
}>();

export const StyleSelectorComponent = React.lazy(() => styleSelector.promise);

export async function completeStyleSelectorPromise() {
  const styleSelectorModule = await import('@/style-selector/bootstrap/App');
  styleSelector.resolve({ default: styleSelectorModule.default as React.ComponentType<unknown> });
}