"use client";

import { useState, KeyboardEvent } from "react";

interface Props {
  onAdd: (text: string, dueDate?: string) => void;
}

export default function TodoInput({ onAdd }: Props) {
  const [value, setValue] = useState("");
  const [dueDate, setDueDate] = useState("");

  const submit = () => {
    if (!value.trim()) return;
    onAdd(value, dueDate || undefined);
    setValue("");
    setDueDate("");
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder="新しいタスクを入力..."
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={submit}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          追加
        </button>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <label className="text-gray-500 dark:text-gray-400 shrink-0">納期限:</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {dueDate && (
          <button
            onClick={() => setDueDate("")}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
