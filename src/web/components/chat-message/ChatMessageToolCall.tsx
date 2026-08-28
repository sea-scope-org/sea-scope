import * as React from 'react';
import { toolDisplay } from '../../chat/toolDisplay';
import { interpretToolResult } from '../../chat/toolResult';
import type { GqlCChatMessage, GqlCChatMessageToolCall } from '../../graphql/generated';
import { cn } from '../../utils/cn';
import { AssistantMarkdown } from '../AssistantMarkdown';
import { AssistantReasoning } from '../AssistantReasoning';
import { MessageRow, Timestamp, ToolArgumentsButton, ToolRowShell, ToolStatusIcon } from './shared';

export function ChatMessageToolCallView({
    message,
    childMessages,
    active = false,
    reasoningText,
}: {
    message: GqlCChatMessageToolCall;
    childMessages?: ReadonlyArray<GqlCChatMessage>;
    active?: boolean;
    reasoningText?: string;
}) {
    const nestedStepCount = childMessages?.length ?? 0;
    const hasChildren = nestedStepCount > 0;
    const [nestedStepsOpen, setNestedStepsOpen] = React.useState(active);
    const [animateNestedSteps, setAnimateNestedSteps] = React.useState(false);
    const onNestedStepsToggle = React.useCallback(() => {
        setAnimateNestedSteps(true);
        setNestedStepsOpen((v) => !v);
    }, []);
    React.useEffect(() => {
        if (!active) return;
        setAnimateNestedSteps(false);
        setNestedStepsOpen(true);
    }, [active]);
    return (
        <MessageRow side="system">
            <div data-slot="chat-message-tool-call" className="flex max-w-full flex-col items-stretch gap-1">
                {reasoningText ? <AssistantReasoning text={reasoningText} /> : null}
                <ToolRowShell
                    toolName={message.toolName}
                    args={message.args}
                    result={message.toolResult}
                    createdAt={message.createdAt}
                    active={active}
                    nestedStepsOpen={hasChildren ? nestedStepsOpen : undefined}
                    nestedStepCount={hasChildren ? nestedStepCount : undefined}
                    onNestedStepsToggle={hasChildren ? onNestedStepsToggle : undefined}
                />
                {hasChildren ? (
                    <div
                        className={cn(
                            'grid',
                            nestedStepsOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                            animateNestedSteps && 'transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
                        )}
                    >
                        <div className="min-h-0 overflow-hidden" aria-hidden={!nestedStepsOpen} inert={!nestedStepsOpen}>
                            <ul
                                data-slot="chat-message-tool-call-children"
                                className="ml-3 flex list-none flex-col gap-1 border-l border-muted-foreground/30 pl-3"
                            >
                                {childMessages!.map((child) =>
                                    child.__typename === 'ChatMessageToolCall' ? (
                                        <ChildToolRow key={child.chatMessageId} child={child} />
                                    ) : null,
                                )}
                            </ul>
                        </div>
                    </div>
                ) : null}
            </div>
        </MessageRow>
    );
}

function ChildToolRow({ child }: { child: GqlCChatMessageToolCall }) {
    const { Icon, label } = toolDisplay(child.toolName);
    const { status, summary } = interpretToolResult(child.toolResult, false);
    const reasoning = child.reasoning ?? undefined;
    return (
        <li data-row-id={child.chatMessageId} className="flex flex-col gap-0.5 text-xs text-muted-foreground">
            {reasoning ? <AssistantReasoning text={reasoning} className="text-xs" /> : null}
            <div className="group/tool-row inline-flex max-w-full items-center gap-2">
                <Icon aria-hidden className="size-3 shrink-0" />
                <span className="truncate">{label}</span>
                <ToolStatusIcon status={status} className="size-3 shrink-0" />
                <ToolArgumentsButton toolName={child.toolName} args={child.args} result={child.toolResult} />
                <Timestamp iso={child.createdAt} className="mt-0" />
            </div>
            {summary ? (
                <div className={cn('ml-5 line-clamp-1 min-w-0', status === 'failed' && 'text-destructive/90')}>
                    <AssistantMarkdown text={summary} className="text-xs/relaxed text-inherit [&_p]:my-0" />
                </div>
            ) : null}
        </li>
    );
}
