// https://sergiodxa.com/tutorials/react/suspense-image-loading

import React from 'react';

// A Resource is an object with a read method returning the payload
interface Readable<Payload> {
  read: () => Payload;
}

interface ResourcePending {
  status: 'pending';
}
interface ResourceSuccess<T> {
  status: 'success';
  data: T;
}
interface ResourceError {
  status: 'error';
  error: Error;
}
type Resource<T> = ResourcePending | ResourceSuccess<T> | ResourceError;

// this function let us get a new function using the asyncFn we pass
// this function also receives a payload and return us a resource with
// that payload assigned as type
function createResource<Payload>(
  asyncFn: () => Promise<Payload>,
): Readable<Payload> {
  let result: Resource<Payload> = { status: 'pending' };
  const promise = asyncFn().then(
    (r: Payload) => {
      result = { status: 'success', data: r };
    },
    (e: Error) => {
      result = { status: 'error', error: e };
    },
  );
  // lately we return an error object with the read method
  return {
    read(): Payload {
      // here we will check the status value
      switch (result.status) {
        case 'pending':
          // if it's still pending we throw the promise
          // throwing a promise is how Suspense know our component is not ready
          throw promise;
        case 'error':
          // if it's error we throw the error
          throw result.error;
        case 'success':
          // if it's success we return the result
          return result.data;
      }
    },
  };
}

class LRUCache<T> {
  maxSize: number;
  entries = new Map<string, [number, T]>();

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
    const { entries, maxSize } = this;
    entries.set(key, [Date.now(), value]);
    if (entries.size > maxSize) {
      const keys = [...entries.keys()];
      keys.sort((a, b) => entries.get(a)![0] - entries.get(b)![0]);
      for (const k of keys) {
        entries.delete(k);
        if (entries.size <= maxSize) break;
      }
    }
  }
}

const cache = new LRUCache<Readable<string>>(25);

// then we create our loadImage function, this function receives the source
// of the image and returns a resource
function loadImage(source: string): Readable<string> {
  let resource = cache.get(source);
  if (resource) return resource;
  resource = createResource<string>(
    () =>
      new Promise((resolve, reject) => {
        const img = new window.Image();
        img.src = source;
        img.addEventListener('load', () => resolve(source));
        // img.addEventListener("load", () => {
        //   setTimeout(() => resolve(source), 1000);
        // });
        img.addEventListener('error', () =>
          reject(new Error(`Failed to load image ${source}`)),
        );
      }),
  );
  cache.set(source, resource);
  return resource;
}

export function SuspenseImage(
  props: React.ImgHTMLAttributes<HTMLImageElement> & { src: string },
): JSX.Element {
  loadImage(props.src).read();
  return <img {...props} />;
}
