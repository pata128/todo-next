"use client";

import { FilterType } from "@/lib/types";

interface Props {
  current: FilterType;
  onChange: (f: FilterType) => void;
  activeCount: number;
  completedCount: number;
  onClearCompleted: () => void;
}

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "active", label: "未完了" },
  { value: "completed", label: "完了済み" },
];

export default function TodoFilter({
  current,
  onChange,
  activeCount,
  completedCount,
  onClearCompleted,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500 dark:text-gray-400">
      <span>{activeCount} 件残り</span>

      <div className="flex gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => onChange(f.value)}
            className={`px-3 py-1 rounded-md transition-colors ${
              current === f.value
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {completedCount > 0 && (
        <button
          onClick={onClearCompleted}
          className="hover:text-red-500 transition-colors"
        >
          完了済みを削除
        </button>
      )}
    </div>
  );
}
