"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocationShape {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  state: "call" | "partial-call" | "result";
  result?: unknown;
}

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocationShape;
}

function extractFilename(path: string | undefined): string {
  if (!path) return "";
  return path.replace(/\\/g, "/").split("/").pop() || path;
}

export function getToolLabel(
  toolName: string,
  args: Record<string, unknown> | undefined,
  isDone: boolean
): string {
  const filename = extractFilename(args?.path as string | undefined);

  if (toolName === "str_replace_editor") {
    const cmd = args?.command as string | undefined;
    if (cmd === "create")      return isDone ? `Created ${filename}`        : `Creating ${filename}`;
    if (cmd === "str_replace") return isDone ? `Edited ${filename}`         : `Editing ${filename}`;
    if (cmd === "insert")      return isDone ? `Inserted into ${filename}`  : `Inserting into ${filename}`;
    if (cmd === "view")        return isDone ? `Read ${filename}`           : `Reading ${filename}`;
    if (cmd === "undo_edit")   return isDone ? `Undid edit in ${filename}`  : `Undoing edit in ${filename}`;
    return toolName;
  }

  if (toolName === "file_manager") {
    const cmd = args?.command as string | undefined;
    if (cmd === "delete") return isDone ? `Deleted ${filename}` : `Deleting ${filename}`;
    if (cmd === "rename") {
      const newFilename = extractFilename(args?.new_path as string | undefined);
      if (newFilename) return isDone ? `Renamed ${filename} to ${newFilename}` : `Renaming ${filename} to ${newFilename}`;
      return isDone ? `Renamed ${filename}` : `Renaming ${filename}`;
    }
    return toolName;
  }

  return toolName;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const { toolName, args, state, result } = toolInvocation;
  const isDone = state === "result" && result != null;
  const label = getToolLabel(toolName, args, isDone);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
