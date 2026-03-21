"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface PyodideResult {
  output: string;
  error: string | null;
}

const EXECUTION_TIMEOUT_MS = 30_000;

/**
 * Lazily loads the Pyodide web worker on first call to runPython.
 * The worker file is served from /pyodide-worker.js (public directory)
 * so Turbopack does not bundle it — Pyodide bootstraps itself from CDN.
 */
export function usePyodide() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<
    Map<string, (result: PyodideResult) => void>
  >(new Map());
  const [isLoading, setIsLoading] = useState(false);

  // Terminate worker on component unmount to prevent stale workers
  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      pendingRef.current.clear();
    };
  }, []);

  function getWorker(): Worker {
    if (!workerRef.current) {
      workerRef.current = new Worker("/pyodide-worker.js");
      workerRef.current.onmessage = (event: MessageEvent) => {
        const { id, output, error } = event.data as {
          id: string;
          output: string;
          error: string | null;
        };
        const resolve = pendingRef.current.get(id);
        if (resolve) {
          pendingRef.current.delete(id);
          resolve({ output, error });
        }
        setIsLoading(false);
      };
      workerRef.current.onerror = (event) => {
        // Resolve all pending with error
        pendingRef.current.forEach((resolve) =>
          resolve({ output: "", error: event.message })
        );
        pendingRef.current.clear();
        setIsLoading(false);
      };
    }
    return workerRef.current;
  }

  const runPython = useCallback(async (code: string): Promise<PyodideResult> => {
    setIsLoading(true);
    const worker = getWorker();
    const id = crypto.randomUUID();

    return new Promise((resolve) => {
      const timeoutHandle = setTimeout(() => {
        // Timed out — remove the pending callback, kill the worker, force fresh on next run
        pendingRef.current.delete(id);
        workerRef.current?.terminate();
        workerRef.current = null;
        setIsLoading(false);
        resolve({ output: "", error: "Execution timed out (30s limit). Avoid infinite loops." });
      }, EXECUTION_TIMEOUT_MS);

      pendingRef.current.set(id, (result) => {
        clearTimeout(timeoutHandle);
        resolve(result);
      });
      worker.postMessage({ id, code });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { runPython, isLoading };
}
