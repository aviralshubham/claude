import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getToolLabel } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

// ─── getToolLabel pure function tests ────────────────────────────────────────

test("str_replace_editor create in-progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "src/components/Card.tsx" }, false)).toBe("Creating Card.tsx");
});

test("str_replace_editor create done", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "src/components/Card.tsx" }, true)).toBe("Created Card.tsx");
});

test("str_replace_editor str_replace in-progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "src/components/Card.tsx" }, false)).toBe("Editing Card.tsx");
});

test("str_replace_editor str_replace done", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "src/components/Card.tsx" }, true)).toBe("Edited Card.tsx");
});

test("str_replace_editor insert in-progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "src/components/Card.tsx" }, false)).toBe("Inserting into Card.tsx");
});

test("str_replace_editor insert done", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "src/components/Card.tsx" }, true)).toBe("Inserted into Card.tsx");
});

test("str_replace_editor view in-progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "src/components/Card.tsx" }, false)).toBe("Reading Card.tsx");
});

test("str_replace_editor view done", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "src/components/Card.tsx" }, true)).toBe("Read Card.tsx");
});

test("str_replace_editor undo_edit in-progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "src/components/Card.tsx" }, false)).toBe("Undoing edit in Card.tsx");
});

test("str_replace_editor undo_edit done", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "src/components/Card.tsx" }, true)).toBe("Undid edit in Card.tsx");
});

test("file_manager delete in-progress", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "src/components/Card.tsx" }, false)).toBe("Deleting Card.tsx");
});

test("file_manager delete done", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "src/components/Card.tsx" }, true)).toBe("Deleted Card.tsx");
});

test("file_manager rename in-progress", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "src/components/Card.tsx", new_path: "src/components/NewCard.tsx" }, false)).toBe("Renaming Card.tsx to NewCard.tsx");
});

test("file_manager rename done", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "src/components/Card.tsx", new_path: "src/components/NewCard.tsx" }, true)).toBe("Renamed Card.tsx to NewCard.tsx");
});

test("file_manager rename without new_path in-progress", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "src/Card.tsx" }, false)).toBe("Renaming Card.tsx");
});

test("file_manager rename without new_path done", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "src/Card.tsx" }, true)).toBe("Renamed Card.tsx");
});

test("extracts filename from deep path", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "src/components/ui/Button.tsx" }, false)).toBe("Creating Button.tsx");
});

test("handles shallow path (filename only)", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "App.tsx" }, false)).toBe("Creating App.tsx");
});

test("fallback for unknown tool name", () => {
  expect(getToolLabel("some_unknown_tool", {}, false)).toBe("some_unknown_tool");
});

test("fallback for unknown command on str_replace_editor", () => {
  expect(getToolLabel("str_replace_editor", { command: "unknown_cmd", path: "Card.tsx" }, false)).toBe("str_replace_editor");
});

test("fallback for unknown command on file_manager", () => {
  expect(getToolLabel("file_manager", { command: "archive", path: "Card.tsx" }, false)).toBe("file_manager");
});

test("handles undefined args", () => {
  expect(getToolLabel("str_replace_editor", undefined, false)).toBe("str_replace_editor");
});

// ─── ToolCallBadge render tests ───────────────────────────────────────────────

test("shows spinner when state is 'call'", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{ toolCallId: "1", toolName: "str_replace_editor", args: { command: "create", path: "src/Card.tsx" }, state: "call" }}
    />
  );
  expect(screen.getByText("Creating Card.tsx")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows spinner when state is 'partial-call'", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{ toolCallId: "1", toolName: "str_replace_editor", args: { command: "str_replace", path: "src/App.tsx" }, state: "partial-call" }}
    />
  );
  expect(screen.getByText("Editing App.tsx")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("shows green dot when state is 'result' with non-null result", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{ toolCallId: "1", toolName: "str_replace_editor", args: { command: "create", path: "src/Card.tsx" }, state: "result", result: "ok" }}
    />
  );
  expect(screen.getByText("Created Card.tsx")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("shows spinner when state is 'result' but result is undefined", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{ toolCallId: "1", toolName: "str_replace_editor", args: { command: "create", path: "src/Card.tsx" }, state: "result", result: undefined }}
    />
  );
  expect(screen.getByText("Creating Card.tsx")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("outer container has expected classes", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{ toolCallId: "1", toolName: "str_replace_editor", args: { command: "create", path: "src/Card.tsx" }, state: "call" }}
    />
  );
  const div = container.firstChild as HTMLElement;
  expect(div.className).toContain("inline-flex");
  expect(div.className).toContain("font-mono");
  expect(div.className).toContain("bg-neutral-50");
  expect(div.className).toContain("border-neutral-200");
});

test("file_manager delete in-progress renders correctly", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{ toolCallId: "1", toolName: "file_manager", args: { command: "delete", path: "src/Card.tsx" }, state: "call" }}
    />
  );
  expect(screen.getByText("Deleting Card.tsx")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("file_manager delete done renders correctly", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{ toolCallId: "1", toolName: "file_manager", args: { command: "delete", path: "src/Card.tsx" }, state: "result", result: true }}
    />
  );
  expect(screen.getByText("Deleted Card.tsx")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
});

test("fallback label for unknown tool renders as-is", () => {
  render(
    <ToolCallBadge
      toolInvocation={{ toolCallId: "1", toolName: "my_tool", args: {}, state: "call" }}
    />
  );
  expect(screen.getByText("my_tool")).toBeDefined();
});

test("str_replace_editor view in-progress renders correctly", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{ toolCallId: "1", toolName: "str_replace_editor", args: { command: "view", path: "src/index.ts" }, state: "call" }}
    />
  );
  expect(screen.getByText("Reading index.ts")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeDefined();
});
