import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoInput from "@/app/components/TodoInput";

describe("TodoInput", () => {
  it("テキスト入力と追加ボタンが表示される", () => {
    render(<TodoInput onAdd={vi.fn()} />);
    expect(screen.getByPlaceholderText("新しいタスクを入力...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();
    expect(screen.getByLabelText("納期限:")).toBeInTheDocument();
  });

  it("空テキストでは onAdd が呼ばれない", async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);
    await userEvent.click(screen.getByRole("button", { name: "追加" }));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("空白のみのテキストでは onAdd が呼ばれない", async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);
    await userEvent.type(screen.getByPlaceholderText("新しいタスクを入力..."), "   ");
    await userEvent.click(screen.getByRole("button", { name: "追加" }));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("追加ボタンをクリックすると onAdd が呼ばれる", async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);
    await userEvent.type(screen.getByPlaceholderText("新しいタスクを入力..."), "買い物");
    await userEvent.click(screen.getByRole("button", { name: "追加" }));
    expect(onAdd).toHaveBeenCalledWith("買い物", undefined);
  });

  it("Enter キーでも onAdd が呼ばれる", async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);
    await userEvent.type(screen.getByPlaceholderText("新しいタスクを入力..."), "買い物{Enter}");
    expect(onAdd).toHaveBeenCalledWith("買い物", undefined);
  });

  it("送信後に入力フィールドがリセットされる", async () => {
    render(<TodoInput onAdd={vi.fn()} />);
    const input = screen.getByPlaceholderText("新しいタスクを入力...");
    await userEvent.type(input, "買い物");
    await userEvent.click(screen.getByRole("button", { name: "追加" }));
    expect(input).toHaveValue("");
  });

  it("納期限を設定して追加すると dueDate が渡される", async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);
    await userEvent.type(screen.getByPlaceholderText("新しいタスクを入力..."), "タスク");
    await userEvent.type(screen.getByLabelText("納期限:"), "2026-12-31");
    await userEvent.click(screen.getByRole("button", { name: "追加" }));
    expect(onAdd).toHaveBeenCalledWith("タスク", "2026-12-31");
  });

  it("送信後に納期限もリセットされる", async () => {
    render(<TodoInput onAdd={vi.fn()} />);
    const dateInput = screen.getByLabelText("納期限:");
    await userEvent.type(screen.getByPlaceholderText("新しいタスクを入力..."), "タスク");
    await userEvent.type(dateInput, "2026-12-31");
    await userEvent.click(screen.getByRole("button", { name: "追加" }));
    expect(dateInput).toHaveValue("");
  });

  it("✕ボタンで納期限がクリアされる", async () => {
    render(<TodoInput onAdd={vi.fn()} />);
    await userEvent.type(screen.getByLabelText("納期限:"), "2026-12-31");
    await userEvent.click(screen.getByRole("button", { name: "✕" }));
    expect(screen.getByLabelText("納期限:")).toHaveValue("");
  });
});
