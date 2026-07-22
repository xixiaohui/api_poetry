"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
      <p className="text-8xl mb-6">🪶</p>
      <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-3">
        出错了
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md">
        页面渲染时发生了错误，请稍后重试。
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-amber-600 px-5 py-2.5 text-white font-medium hover:bg-amber-700 transition-colors"
      >
        重试
      </button>
    </div>
  );
}
