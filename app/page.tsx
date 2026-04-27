"use client";

import { useTodos } from "@/lib/useTodos";
import TodoInput from "./components/TodoInput";
import TodoItem from "./components/TodoItem";
import TodoFilter from "./components/TodoFilter";

export default function Home() {
  const {
    todos,
    filter,
    setFilter,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    clearCompleted,
    activeCount,
    completedCount,
  } = useTodos();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-lg space-y-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100">
          TODOリスト
        </h1>

        <TodoInput onAdd={addTodo} />

        {todos.length > 0 ? (
          <>
            <ul className="space-y-2">
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  onEdit={editTodo}
                />
              ))}
            </ul>

            <TodoFilter
              current={filter}
              onChange={setFilter}
              activeCount={activeCount}
              completedCount={completedCount}
              onClearCompleted={clearCompleted}
            />
          </>
        ) : (
          <p className="text-center text-gray-400 dark:text-gray-500 py-8">
            {filter === "all"
              ? "タスクがありません。上から追加してください。"
              : filter === "active"
              ? "未完了のタスクはありません。"
              : "完了済みのタスクはありません。"}
          </p>
        )}
      </div>
    </main>
  );
}
