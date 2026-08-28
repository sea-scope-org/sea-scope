// Friendly display for tool-call rows in the transcript. The raw tool id
// (`promptUserForInput`, `writeToConsole`, `toolItemsUpsert`) is an internal
// name; showing it in the conversation reads as technical noise. This maps
// curated ids to a human English label + icon. Everything else falls back to
// a mechanical label derived from the tool name. The raw id stays available in
// the args inspector (`ToolArgumentsButton`), so nothing is lost.

import { HammerIcon, MessageSquareIcon, TerminalIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ToolDisplayEntry {
    Icon: LucideIcon;
    label: string;
}

const TOOL_DISPLAY: Record<string, ToolDisplayEntry> = {
    promptUserForInput: { Icon: MessageSquareIcon, label: 'Requested your input' },
    writeToConsole: { Icon: TerminalIcon, label: 'Console output' },
};

// Turn `toolItemsUpsert` / `itemsUpsert` into a short label: drop a leading
// `tool`, split camelCase / PascalCase into words, and sentence-case the result.
function humanizeToolName(toolName: string): string {
    const withoutPrefix = toolName.replace(/^tool/, '');
    const words = withoutPrefix
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);
    if (words.length === 0) return toolName;
    const joined = words.join(' ');
    return joined.charAt(0).toUpperCase() + joined.slice(1);
}

export function toolDisplay(toolName: string): { Icon: LucideIcon; label: string } {
    const known = TOOL_DISPLAY[toolName];
    if (known) return { Icon: known.Icon, label: known.label };
    return {
        Icon: HammerIcon,
        label: humanizeToolName(toolName),
    };
}
