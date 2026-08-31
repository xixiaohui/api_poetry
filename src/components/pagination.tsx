"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

export interface PaginationProps {
  readonly currentPage: number;
  readonly totalPages: number;
  /** 生成指定页码的 href，用于 Link 导航 */
  readonly buildHref: (page: number) => string;
  /** 跳转指定页码时回调（如跳转输入框提交） */
  readonly onJump?: (page: number) => void;
  /** 当前页左右各显示几个页码，默认 1 */
  readonly siblingCount?: number;
}

/** 生成带省略号的页码序列，如 [1, "…", 4, 5, 6, "…", 20] */
function getPageItems(
  current: number,
  total: number,
  siblingCount: number
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const left = Math.max(current - siblingCount, 2);
  const right = Math.min(current + siblingCount, total - 1);
  const items: (number | "ellipsis")[] = [1];
  if (left > 2) items.push("ellipsis");
  for (let i = left; i <= right; i++) items.push(i);
  if (right < total - 1) items.push("ellipsis");
  items.push(total);
  return items;
}

export function Pagination({
  currentPage,
  totalPages,
  buildHref,
  onJump,
  siblingCount = 1,
}: PaginationProps) {
  const [jumpValue, setJumpValue] = useState("");

  if (totalPages <= 1) return null;

  const items = getPageItems(currentPage, totalPages, siblingCount);

  const handleJump = (e: FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(jumpValue, 10);
    const p = Number.isNaN(parsed)
      ? currentPage
      : Math.max(1, Math.min(totalPages, parsed));
    setJumpValue("");
    if (onJump) onJump(p);
  };

  const btnCls =
    "inline-flex items-center justify-center min-w-9 h-9 px-2 rounded-lg border text-sm transition-colors";
  const btnIdle =
    "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800";
  const btnDisabled =
    "border-zinc-200 dark:border-zinc-800 text-zinc-300 dark:text-zinc-600 cursor-not-allowed";
  const btnActive =
    "border-amber-500 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:border-amber-600 dark:text-amber-300 font-medium";

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 mt-10" aria-label="分页">
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1)}
          className={`${btnCls} ${btnIdle}`}
          aria-label="上一页"
        >
          ← 上一页
        </Link>
      ) : (
        <span className={`${btnCls} ${btnDisabled}`} aria-disabled="true">
          ← 上一页
        </span>
      )}

      {items.map((item, idx) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${idx}`}
            className="min-w-6 text-center text-zinc-400 select-none"
          >
            …
          </span>
        ) : (
          <Link
            key={item}
            href={buildHref(item)}
            aria-current={item === currentPage ? "page" : undefined}
            className={`${btnCls} ${item === currentPage ? btnActive : btnIdle}`}
          >
            {item}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link
          href={buildHref(currentPage + 1)}
          className={`${btnCls} ${btnIdle}`}
          aria-label="下一页"
        >
          下一页 →
        </Link>
      ) : (
        <span className={`${btnCls} ${btnDisabled}`} aria-disabled="true">
          下一页 →
        </span>
      )}

      {onJump && (
        <form onSubmit={handleJump} className="flex items-center gap-2 ml-2">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">跳至</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            placeholder={String(currentPage)}
            className="w-16 h-9 px-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm text-zinc-700 dark:text-zinc-300 text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label="跳转页码"
          />
          <button
            type="submit"
            className="h-9 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            确定
          </button>
        </form>
      )}
    </nav>
  );
}
