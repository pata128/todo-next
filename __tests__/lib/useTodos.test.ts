import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTodos } from "@/lib/useTodos";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

describe("useTodos - 初期状態", () => {
  it("初期状態はタスクが空", () => {
    const { result } = renderHook(() => useTodos());
    expect(result.current.todos).toHaveLength(0);
  });

  it("初期フィルターは all", () => {
    const { result } = renderHook(() => useTodos());
    expect(result.current.filter).toBe("all");
  });

  it("localStorage に保存済みのタスクを読み込む", () => {
    localStorageMock.setItem(
      "todo-next-items",
      JSON.stringify([{ id: "1", text: "保存済みタスク", completed: false, createdAt: 0 }])
    );
    const { result } = renderHook(() => useTodos());
    expect(result.current.todos[0].text).toBe("保存済みタスク");
  });
});

describe("useTodos - addTodo", () => {
  it("タスクを追加できる", () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo("買い物"); });
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe("買い物");
    expect(result.current.todos[0].completed).toBe(false);
  });

  it("空文字ではタスクが追加されない", () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo(""); });
    expect(result.current.todos).toHaveLength(0);
  });

  it("空白のみではタスクが追加されない", () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo("   "); });
    expect(result.current.todos).toHaveLength(0);
  });

  it("テキストの前後の空白はトリムされる", () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo("  タスク  "); });
    expect(result.current.todos[0].text).toBe("タスク");
  });

  it("納期限付きでタスクを追加できる", () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo("タスク", "2026-12-31"); });
    expect(result.current.todos[0].dueDate).toBe("2026-12-31");
  });

  it("追加したタスクはリストの先頭に入る", () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo("タスク1"); });
    act(() => { result.current.addTodo("タスク2"); });
    expect(result.current.todos[0].text).toBe("タスク2");
  });

  it("追加後に localStorage に保存される", () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo("タスク"); });
    const stored = JSON.parse(localStorageMock.getItem("todo-next-items")!);
    expect(stored[0].text).toBe("タスク");
  });
});

describe("useTodos - toggleTodo", () => {
  it("未完了タスクを完了に切り替えられる", () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo("タスク"); });
    const id = result.current.todos[0].id;
    act(() => { result.current.toggleTodo(id); });
    expect(result.current.todos[0].completed).toBe(true);
  });

  it("完了タスクを未完了に切り替えられる", () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo("タスク"); });
    const id = result.current.todos[0].id;
    act(() => { result.current.toggleTodo(id); });
    act(() => { result.current.toggleTodo(id); });
    expect(result.current.todos[0].completed).toBe(false);
  });
});

describe("useTodos - deleteTodo", () => {
  it("タスクを削除できる", () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo("タスク"); });
    const id = result.current.todos[0].id;
    act(() => { result.current.deleteTodo(id); });
    expect(result.current.todos).toHaveLength(0);
  });

  it("指定した ID のタスクのみ削除される", () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo("タスク1"); });
    act(() => { result.current.addTodo("タスク2"); });
    const id = result.current.todos[1].id;
    act(() => { result.current.deleteTodo(id); });
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe("タスク2");
  });
});

describe("useTodos - editTodo", () => {
  it("タスクのテキストを変更できる", () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo("古いテキスト"); });
    const id = result.current.todos[0].id;
    act(() => { result.current.editTodo(id, "新しいテキスト"); });
    expect(result.current.todos[0].text).toBe("新しいテキスト");
  });

  it("空文字での編集はテキストが変わらない", () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo("元のテキスト"); });
    const id = result.current.todos[0].id;
    act(() => { result.current.editTodo(id, ""); });
    expect(result.current.todos[0].text).toBe("元のテキスト");
  });

  it("納期限を変更できる", () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo("タスク", "2026-01-01"); });
    const id = result.current.todos[0].id;
    act(() => { result.current.editTodo(id, "タスク", "2026-12-31"); });
    expect(result.current.todos[0].dueDate).toBe("2026-12-31");
  });

  it("納期限を undefined にして削除できる", () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo("タスク", "2026-01-01"); });
    const id = result.current.todos[0].id;
    act(() => { result.current.editTodo(id, "タスク", undefined); });
    expect(result.current.todos[0].dueDate).toBeUndefined();
  });
});

describe("useTodos - clearCompleted", () => {
  it("完了済みタスクをすべて削除する", () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo("タスク1"); });
    act(() => { result.current.addTodo("タスク2"); });
    act(() => { result.current.toggleTodo(result.current.todos[0].id); });
    act(() => { result.current.clearCompleted(); });
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].completed).toBe(false);
  });
});

describe("useTodos - フィルター", () => {
  it("active フィルターで未完了タスクのみ返す", () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo("タスク1"); });
    act(() => { result.current.addTodo("タスク2"); });
    act(() => { result.current.toggleTodo(result.current.todos[0].id); });
    act(() => { result.current.setFilter("active"); });
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].completed).toBe(false);
  });

  it("completed フィルターで完了済みタスクのみ返す", () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo("タスク1"); });
    act(() => { result.current.addTodo("タスク2"); });
    act(() => { result.current.toggleTodo(result.current.todos[0].id); });
    act(() => { result.current.setFilter("completed"); });
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].completed).toBe(true);
  });

  it("all フィルターですべてのタスクを返す", () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo("タスク1"); });
    act(() => { result.current.addTodo("タスク2"); });
    act(() => { result.current.toggleTodo(result.current.todos[0].id); });
    act(() => { result.current.setFilter("all"); });
    expect(result.current.todos).toHaveLength(2);
  });

  it("activeCount と completedCount が正しく計算される", () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo("タスク1"); });
    act(() => { result.current.addTodo("タスク2"); });
    act(() => { result.current.addTodo("タスク3"); });
    act(() => { result.current.toggleTodo(result.current.todos[0].id); });
    expect(result.current.activeCount).toBe(2);
    expect(result.current.completedCount).toBe(1);
  });
});
