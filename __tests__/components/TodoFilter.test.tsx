import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoFilter from "@/app/components/TodoFilter";

const defaultProps = {
  current: "all" as const,
  onChange: vi.fn(),
  activeCount: 3,
  completedCount: 0,
  onClearCompleted: vi.fn(),
};

describe("TodoFilter", () => {
  it("未完了件数が表示される", () => {
    render(<TodoFilter {...defaultProps} activeCount={5} />);
    expect(screen.getByText("5 件残り")).toBeInTheDocument();
  });

  it("3つのフィルターボタンが表示される", () => {
    render(<TodoFilter {...defaultProps} />);
    expect(screen.getByRole("button", { name: "すべて" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "未完了" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "完了済み" })).toBeInTheDocument();
  });

  it("アクティブなフィルターボタンに bg-blue-600 クラスが付く", () => {
    render(<TodoFilter {...defaultProps} current="active" />);
    expect(screen.getByRole("button", { name: "未完了" })).toHaveClass("bg-blue-600");
    expect(screen.getByRole("button", { name: "すべて" })).not.toHaveClass("bg-blue-600");
  });

  it("フィルターボタンをクリックすると onChange が呼ばれる", async () => {
    const onChange = vi.fn();
    render(<TodoFilter {...defaultProps} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "未完了" }));
    expect(onChange).toHaveBeenCalledWith("active");
  });

  it("completedCount が 0 の時は「完了済みを削除」ボタンが表示されない", () => {
    render(<TodoFilter {...defaultProps} completedCount={0} />);
    expect(screen.queryByRole("button", { name: "完了済みを削除" })).not.toBeInTheDocument();
  });

  it("completedCount > 0 の時は「完了済みを削除」ボタンが表示される", () => {
    render(<TodoFilter {...defaultProps} completedCount={2} />);
    expect(screen.getByRole("button", { name: "完了済みを削除" })).toBeInTheDocument();
  });

  it("「完了済みを削除」ボタンをクリックすると onClearCompleted が呼ばれる", async () => {
    const onClearCompleted = vi.fn();
    render(<TodoFilter {...defaultProps} completedCount={1} onClearCompleted={onClearCompleted} />);
    await userEvent.click(screen.getByRole("button", { name: "完了済みを削除" }));
    expect(onClearCompleted).toHaveBeenCalledOnce();
  });
});
