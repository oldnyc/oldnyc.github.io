/** Provide a synchronous view on async resources */

import React from "react";

export interface ResourcePending {
  status: "pending";
}
export interface ResourceSuccess<T> {
  status: "success";
  data: T;
}
export interface ResourceError {
  status: "error";
  error: Error;
}
export type Resource<T> = ResourcePending | ResourceSuccess<T> | ResourceError;

class LRUCache<T> {
  maxSize: number;
  entries = new Map<string, [number, T]>;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (entry) {
      entry[0] = Date.now();
      return entry[1];
    } else {
      return undefined;
    }
  }

  set(key: string, value: T) {
    const {entries, maxSize} = this;
    entries.set(key, [Date.now(), value]);
    if (entries.size > maxSize) {
      const keys = [...entries.keys()];
      keys.sort((a, b) => entries.get(a)![0] - entries.get(b)![0]);
      for (const k of keys) {
        entries.delete(k)
        if (entries.size <= maxSize) break;
      }
    }
    const fns = listeners.get(key);
    if (fns) {
      // Copy the array to allow the function to call removeListener
      for (const fn of [...fns]) {
        fn();
      }
    }
  }
}

// TODO: would be better for the cache size to be in terms of megabytes, not items.
const cache = new LRUCache<Resource<unknown>>(100);

const listeners = new Map<string, Array<() => void>>();

function addListener(key: string, fn: () => void) {
  let fns = listeners.get(key);
  if (!fns) {
    fns = [fn];
    listeners.set(key, fns);
  } else {
    if (fns.indexOf(fn) === -1) {
      fns.push(fn);
    }
  }
}

function removeListener(key: string, fn: () => void) {
  const fns = listeners.get(key);
  if (!fns) return;
  const idx = fns.indexOf(fn);
  if (idx >= 0) {
    fns.splice(idx, 1);
  }
}

const PENDING: ResourcePending = {status: 'pending'};

export function useResource<T>(key: string, fn: () => Promise<T>): Resource<T> {
  console.log('useResource', key);
  const [, update] = React.useState(0);

  const forceUpdate = React.useCallback(() => {
    update(n => n + 1);
    removeListener(key, forceUpdate);
  }, [key]);

  React.useEffect(() => {
    const existing = cache.get(key);
    if (existing) {
      if (existing.status === 'pending') {
        console.log('useResource: re-using existing pending cache entry', key);
        addListener(key, forceUpdate);
        return;
      }
      console.log('useResource: re-using existing cache entry in terminal state', key);
      forceUpdate();
      return;
    }

    // It's our responsibility to load!
    console.log('useResource: triggering load', key);
    cache.set(key, PENDING);
    addListener(key, forceUpdate);
    (async () => {
      const val = await fn();
      console.log('useResource: set success', key, val);
      cache.set(key, {status: 'success', data: val});
    })().catch(error => {
      console.log('useResource: set failure', key);
      cache.set(key, {status: 'error', error});
    });
  }, [key, forceUpdate]);

  return cache.get(key) as Resource<T> ?? PENDING;
}
