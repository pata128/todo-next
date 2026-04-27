import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoItem from "@/app/components/TodoItem";
import { Todo } from "@/lib/types";

const baseTodo: Todo = {
  id: "test-id",
  text: "買い物に行く",
  completed: false,
  createdAt: Date.now(),
};

const defaultProps = {
  todo: baseTodo,
  onToggle: vi.fn(),
  onDelete: vi.fn(),
  onEdit: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("TodoItem - 表示", () => {
  it("タスクのテキストが表示される", () => {
    render(<TodoItem {...defaultProps} />);
    expect(screen.getByText("買い物に行く")).toBeInTheDocument();
  });

  it("未完了タスクはチェックボックスが未チェック", () => {
    render(<TodoItem {...defaultProps} />);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("完了タスクはチェックボックスがチェック済み", () => {
    render(<TodoItem {...defaultProps} todo={{ ...baseTodo, completed: true }} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("完了タスクのテキストに打ち消し線クラスが付く", () => {
    render(<TodoItem {...defaultProps} todo={{ ...baseTodo, completed: true }} />);
    expect(screen.getByText("買い物に行く")).toHaveClass("line-through");
  });

  it("納期限なしの場合は日付が表示されない", () => {
    render(<TodoItem {...defaultProps} />);
    expect(screen.queryByText(/\d{4}\/\d{2}\/\d{2}/)).not.toBeInTheDocument();
  });

  it("納期限が設定されている場合は日付が表示される", () => {
    render(<TodoItem {...defaultProps} todo={{ ...baseTodo, dueDate: "2099-12-31" }} />);
    expect(screen.getByText(/2099\/12\/31/)).toBeInTheDocument();
  });

  it("期限切れの納期限には「⚠ 期限切れ」が表示される", () => {
    render(<TodoItem {...defaultProps} todo={{ ...baseTodo, dueDate: "2000-01-01" }} />);
    expect(screen.getByText(/⚠ 期限切れ/)).toBeInTheDocument();
  });

  it("今日が納期限の場合は「⏰ 今日まで」が表示される", () => {
    const today = new Date().toISOString().slice(0, 10);
    render(<TodoItem {...defaultProps} todo={{ ...baseTodo, dueDate: today }} />);
    expect(screen.getByText(/⏰ 今日まで/)).toBeInTheDocument();
  });

  it("未来の納期限には「📅」が表示される", () => {
    render(<TodoItem {...defaultProps} todo={{ ...baseTodo, dueDate: "2099-12-31" }} />);
    expect(screen.getByText(/📅/)).toBeInTheDocument();
  });

  it("完了タスクの納期限にはステータス表示が出ない", () => {
    render(<TodoItem {...defaultProps} todo={{ ...baseTodo, completed: true, dueDate: "2000-01-01" }} />);
    expect(screen.queryByText(/⚠ 期限切れ/)).not.toBeInTheDocument();
  });
});

describe("TodoItem - 操作", () => {
  it("チェックボックスをクリックすると onToggle が呼ばれる", async () => {
    const onToggle = vi.fn();
    render(<TodoItem {...defaultProps} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalledWith("test-id");
  });

  it("削除ボタンをクリックすると onDelete が呼ばれる", async () => {
    const onDelete = vi.fn();
    render(<TodoItem {...defaultProps} onDelete={onDelete} />);
    await userEvent.click(screen.getByTitle("削除"));
    expect(onDelete).toHaveBeenCalledWith("test-id");
  });

  it("編集ボタンをクリックすると編集モードになる", async () => {
    render(<TodoItem {...defaultProps} />);
    await userEvent.click(screen.getByTitle("編集"));
    expect(screen.getByDisplayValue("買い物に行く")).toBeInTheDocument();
  });

  it("テキストをダブルクリックすると編集モードになる", async () => {
    render(<TodoItem {...defaultProps} />);
    await userEvent.dblClick(screen.getByText("買い物に行く"));
    expect(screen.getByDisplayValue("買い物に行く")).toBeInTheDocument();
  });

  it("編集モードで Enter を押すと onEdit が呼ばれ編集モードを抜ける", async () => {
    const onEdit = vi.fn();
    render(<TodoItem {...defaultProps} onEdit={onEdit} />);
    await userEvent.click(screen.getByTitle("編集"));
    const input = screen.getByDisplayValue("買い物に行く");
    await userEvent.clear(input);
    await userEvent.type(input, "新しいタスク{Enter}");
    expect(onEdit).toHaveBeenCalledWith("test-id", "新しいタスク", undefined);
    expect(screen.queryByDisplayValue("新しいタスク")).not.toBeInTheDocument();
  });

  it("編集モードで Escape を押すと編集モードを抜けて元のテキストに戻る", async () => {
    render(<TodoItem {...defaultProps} />);
    await userEvent.click(screen.getByTitle("編集"));
    const input = screen.getByDisplayValue("買い物に行く");
    await userEvent.clear(input);
    await userEvent.type(input, "変更後{Escape}");
    expect(screen.getByText("買い物に行く")).toBeInTheDocument();
  });

  it("編集モードで納期限を変更して Enter を押すと dueDate が渡される", async () => {
    const onEdit = vi.fn();
    render(<TodoItem {...defaultProps} onEdit={onEdit} />);
    await userEvent.click(screen.getByTitle("編集"));
    await userEvent.type(screen.getByLabelText("納期限:"), "2026-12-31");
    await userEvent.keyboard("{Enter}");
    expect(onEdit).toHaveBeenCalledWith("test-id", "買い物に行く", "2026-12-31");
  });

  it("編集モードで納期限の✕ボタンを押しても編集モードが継続する", async () => {
    render(<TodoItem {...defaultProps} todo={{ ...baseTodo, dueDate: "2026-12-31" }} />);
    await userEvent.click(screen.getByTitle("編集"));
    expect(screen.getByDisplayValue("2026-12-31")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "✕" }));
    expect(screen.getByDisplayValue("買い物に行く")).toBeInTheDocument();
  });
});
