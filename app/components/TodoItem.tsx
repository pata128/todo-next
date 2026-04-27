"use client";

import { useState, useRef, useEffect, KeyboardEvent, FocusEvent } from "react";
import { Todo } from "@/lib/types";

interface Props {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string, dueDate?: string) => void;
}

function dueDateStatus(dueDate: string, completed: boolean) {
  if (completed) return null;
  const today = new Date().toISOString().slice(0, 10);
  if (dueDate < today) return "overdue";
  if (dueDate === today) return "today";
  return "upcoming";
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${y}/${m}/${d}`;
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const [draftDue, setDraftDue] = useState(todo.dueDate ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const editAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const startEdit = () => {
    setDraft(todo.text);
    setDraftDue(todo.dueDate ?? "");
    setEditing(true);
  };

  const commitEdit = () => {
    onEdit(todo.id, draft, draftDue || undefined);
    setEditing(false);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setEditing(false);
  };

  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (editAreaRef.current?.contains(e.relatedTarget as Node)) return;
    commitEdit();
  };

  const status = todo.dueDate ? dueDateStatus(todo.dueDate, todo.completed) : null;
  const dueBadgeClass =
    status === "overdue"
      ? "text-red-500 dark:text-red-400"
      : status === "today"
      ? "text-yellow-500 dark:text-yellow-400"
      : "text-gray-400 dark:text-gray-500";

  return (
    <li className="flex items-start gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 group">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="w-5 h-5 mt-0.5 accent-blue-600 cursor-pointer shrink-0"
      />

      <div className="flex-1 min-w-0">
        {editing ? (
          <div ref={editAreaRef} className="flex flex-col gap-1.5" onBlur={handleBlur}>
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKey}
              className="w-full bg-transparent border-b border-blue-500 outline-none text-gray-900 dark:text-gray-100"
            />
            <div className="flex items-center gap-2 text-sm">
              <label htmlFor={`due-date-${todo.id}`} className="text-gray-500 dark:text-gray-400 shrink-0">納期限:</label>
              <input
                id={`due-date-${todo.id}`}
                type="date"
                value={draftDue}
                onChange={(e) => setDraftDue(e.target.value)}
                onKeyDown={handleKey}
                className="px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {draftDue && (
                <button
                  onClick={() => setDraftDue("")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ) : (
          <div onDoubleClick={startEdit} className="cursor-text space-y-0.5">
            <p
              className={`select-none break-words ${
                todo.completed
                  ? "line-through text-gray-400 dark:text-gray-500"
                  : "text-gray-800 dark:text-gray-200"
              }`}
            >
              {todo.text}
            </p>
            {todo.dueDate && (
              <p className={`text-xs font-medium ${dueBadgeClass}`}>
                {status === "overdue" && "⚠ 期限切れ "}
                {status === "today" && "⏰ 今日まで "}
                {status === "upcoming" && "📅 "}
                {formatDate(todo.dueDate)}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
        <button
          onClick={startEdit}
          title="編集"
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          title="削除"
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
        >
          🗑️
        </button>
      </div>
    </li>
  );
}
