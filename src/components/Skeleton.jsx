import React from "react";

/**
 * Плейсхолдеры загрузки. Повторяют форму реального контента,
 * чтобы страница не "прыгала" после ответа сервера.
 */
export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-slate-200 dark:bg-zinc-800 rounded-lg ${className}`} />;
}

// Карточка класса: заголовок, код доступа, метаданные
export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[32px] border-4 border-black/10 dark:border-white/10 p-8">
      <Skeleton className="h-8 w-2/3 mb-5" />
      <Skeleton className="h-6 w-1/2 mb-6" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function SkeletonCardGrid({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

// Строка списка: название слева, значение справа
export function SkeletonRows({ count = 3, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border-2 border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900">
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-12 shrink-0" />
        </div>
      ))}
    </div>
  );
}
