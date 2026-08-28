import { ShieldCheckIcon } from 'lucide-react';
import { useState } from 'react';
import { toolDisplay } from '../../chat/toolDisplay';
import type { GqlCChatMessageToolApprovalRequest } from '../../graphql/generated';
import { AssistantReasoning } from '../AssistantReasoning';
import { Button } from '../base/button';
import { Card, CardContent, CardHeader, CardTitle } from '../base/card';
import { Textarea } from '../base/textarea';
import { MessageRow, Timestamp, ToolArgumentsButton } from './shared';

export function ChatMessageToolApprovalRequestView({
    message,
    onRespond,
    reasoningText,
}: {
    message: GqlCChatMessageToolApprovalRequest;
    onRespond?: (approvalId: string, approved: boolean, reason?: string) => void;
    reasoningText?: string;
}) {
    const [mode, setMode] = useState<'idle' | 'declining'>('idle');
    const [reasonDraft, setReasonDraft] = useState('');
    const { label: toolLabel } = toolDisplay(message.toolName);
    const reasonLabel = 'Optional: why decline?';

    const handleConfirmDecline = () => {
        if (!onRespond) return;
        const trimmed = reasonDraft.trim();
        onRespond(message.approvalId, false, trimmed.length > 0 ? trimmed : undefined);
    };

    return (
        <MessageRow side="system">
            <div className="flex w-full max-w-md flex-col gap-2">
                {reasoningText ? <AssistantReasoning text={reasoningText} /> : null}
                <Card className="w-full gap-2 py-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <ShieldCheckIcon aria-hidden />
                            Approval requested
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{`The assistant wants to run “${toolLabel}”.`}</span>
                            <ToolArgumentsButton toolName={message.toolName} args={message.args} />
                        </p>
                        {onRespond && mode === 'idle' ? (
                            <div className="flex gap-2">
                                <Button size="sm" onClick={() => onRespond(message.approvalId, true)}>
                                    Approve
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setMode('declining')}>
                                    Decline
                                </Button>
                            </div>
                        ) : null}
                        {onRespond && mode === 'declining' ? (
                            <div className="grid gap-2">
                                <Textarea
                                    aria-label={reasonLabel}
                                    placeholder={reasonLabel}
                                    value={reasonDraft}
                                    onChange={(event) => setReasonDraft(event.target.value)}
                                    rows={3}
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={handleConfirmDecline}>
                                        Confirm decline
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setMode('idle');
                                            setReasonDraft('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : null}
                        <Timestamp iso={message.createdAt} />
                    </CardContent>
                </Card>
            </div>
        </MessageRow>
    );
}
