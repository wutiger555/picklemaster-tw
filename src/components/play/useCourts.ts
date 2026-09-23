import { useEffect, useState } from 'react';
import type { Court } from '../../types';

// courts.json 只抓一次，大廳、開團、團頁共用
let cache: Promise<Court[]> | null = null;
export function loadCourts(): Promise<Court[]> {
  if (!cache) {
    cache = fetch('/data/courts.json')
      .then((r) => r.json() as Promise<{ courts: Court[] }>)
      .then((d) => d.courts)
      .catch((e) => {
        cache = null;
        throw e;
      });
  }
  return cache;
}

export function useCourts() {
  const [courts, setCourts] = useState<Court[] | null>(null);
  useEffect(() => {
    let alive = true;
    loadCourts().then((c) => alive && setCourts(c)).catch(() => alive && setCourts([]));
    return () => {
      alive = false;
    };
  }, []);
  return courts;
}
