import { CheckIcon, CircleAlertIcon, FileIcon, PaperclipIcon, SendIcon, XIcon } from 'lucide-react';
import type { ChangeEvent, ClipboardEvent, DragEvent, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '../hooks/use-mobile';
import { cn } from '../utils/cn';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from './base/input-group';
import { Spinner } from './base/spinner';

export interface ComposerAttachment {
    localId: string;
    file: File;
    status: 'uploading' | 'uploaded' | 'error';
    fileUploadId?: string;
    error?: string;
}

export type MessageComposerProps = {
    value: string;
    onValueChange: (value: string) => void;
    onSubmit: () => void;
    disabled?: boolean;
    busy?: boolean;
    placeholder?: string;
    ariaLabel: string;
    rows?: number;
    addonStart?: ReactNode;
    accept?: string;
    multipleAttachments?: boolean;
    name?: string;
    autoFocus?: boolean;
} & (
    | {
          attachments: readonly ComposerAttachment[];
          onAttachmentsAdd: (files: File[]) => void;
          onAttachmentRemove: (localId: string) => void;
          attachmentsTitle: string;
      }
    | {
          attachments?: undefined;
          onAttachmentsAdd?: undefined;
          onAttachmentRemove?: undefined;
          attachmentsTitle?: undefined;
      }
);

export function MessageComposer({
    value,
    onValueChange,
    onSubmit,
    disabled = false,
    busy = false,
    placeholder,
    ariaLabel,
    rows = 2,
    addonStart,
    attachments,
    onAttachmentsAdd,
    onAttachmentRemove,
    accept,
    attachmentsTitle,
    multipleAttachments = true,
    name = 'message',
    autoFocus = false,
}: MessageComposerProps) {
    const isMobile = useIsMobile();
    const sendLabel = busy ? 'Sending' : 'Send';
    const attachmentsEnabled = onAttachmentsAdd !== undefined;
    const currentAttachments = attachments ?? [];
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [showSent, setShowSent] = useState(false);

    const wasBusyRef = useRef(busy);
    useEffect(() => {
        if (wasBusyRef.current && !busy) {
            textareaRef.current?.focus();
            setShowSent(true);
            const timeout = window.setTimeout(() => setShowSent(false), 700);
            wasBusyRef.current = busy;
            return () => window.clearTimeout(timeout);
        }
        wasBusyRef.current = busy;
    }, [busy]);

    useEffect(() => {
        if (autoFocus) textareaRef.current?.focus();
    }, []);

    const dragDepthRef = useRef(0);

    const hasAttachments = currentAttachments.length > 0;
    const anyUploading = currentAttachments.some((a) => a.status === 'uploading');
    const canSubmit = !disabled && !busy && !anyUploading && (value.trim().length > 0 || hasAttachments);
    const inputsLocked = disabled || busy;

    const submit = () => {
        if (!canSubmit) return;
        onSubmit();
    };

    const acceptFiles = (incoming: FileList | File[]) => {
        if (!attachmentsEnabled || inputsLocked) return;
        const next = Array.from(incoming);
        if (next.length === 0) return;
        const clamped = multipleAttachments ? next : next.slice(0, 1);
        onAttachmentsAdd(clamped);
    };

    const onPickerChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) acceptFiles(event.target.files);
        event.target.value = '';
    };

    const isFileDrag = (event: DragEvent) => event.dataTransfer.types.includes('Files');

    const onDragEnter = (event: DragEvent<HTMLFormElement>) => {
        if (!attachmentsEnabled || inputsLocked || !isFileDrag(event)) return;
        event.preventDefault();
        dragDepthRef.current += 1;
        setIsDragOver(true);
    };

    const onDragOver = (event: DragEvent<HTMLFormElement>) => {
        if (!attachmentsEnabled || inputsLocked || !isFileDrag(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    };

    const onDragLeave = () => {
        if (!attachmentsEnabled) return;
        dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
        if (dragDepthRef.current === 0) setIsDragOver(false);
    };

    const onDrop = (event: DragEvent<HTMLFormElement>) => {
        if (!attachmentsEnabled || inputsLocked || !isFileDrag(event)) return;
        event.preventDefault();
        dragDepthRef.current = 0;
        setIsDragOver(false);
        if (event.dataTransfer.files.length > 0) acceptFiles(event.dataTransfer.files);
    };

    const onPaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
        if (!attachmentsEnabled || inputsLocked) return;
        const files = event.clipboardData.files;
        if (files.length === 0) return;

        event.preventDefault();
        acceptFiles(files);

        const text = event.clipboardData.getData('text/plain');
        if (!text) return;
        const textarea = event.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const nextCaret = start + text.length;
        onValueChange(value.slice(0, start) + text + value.slice(end));
        requestAnimationFrame(() => {
            textarea.setSelectionRange(nextCaret, nextCaret);
        });
    };

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                submit();
            }}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <InputGroup className={cn(isDragOver && 'border-ring ring-[3px] ring-ring/50')}>
                {attachmentsEnabled && hasAttachments ? (
                    <InputGroupAddon align="block-start" className="flex-wrap gap-2">
                        {currentAttachments.map((attachment) => (
                            <AttachmentPreview
                                key={attachment.localId}
                                attachment={attachment}
                                disabled={inputsLocked}
                                onRemove={() => onAttachmentRemove(attachment.localId)}
                            />
                        ))}
                    </InputGroupAddon>
                ) : null}

                <InputGroupTextarea
                    ref={textareaRef}
                    name={name}
                    value={value}
                    onChange={(event) => onValueChange(event.target.value)}
                    onPaste={onPaste}
                    onKeyDown={(event) => {
                        if (isMobile) return;
                        if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            submit();
                        }
                    }}
                    enterKeyHint={isMobile ? 'enter' : 'send'}
                    placeholder={placeholder}
                    aria-label={ariaLabel}
                    disabled={inputsLocked}
                    rows={rows}
                />

                <InputGroupAddon align="block-end">
                    {addonStart}
                    {attachmentsEnabled ? (
                        <>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={accept}
                                multiple={multipleAttachments}
                                className="hidden"
                                onChange={onPickerChange}
                            />
                            <InputGroupButton
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="ml-auto"
                                disabled={inputsLocked}
                                aria-label={attachmentsTitle}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <PaperclipIcon />
                            </InputGroupButton>
                        </>
                    ) : null}
                    <InputGroupButton
                        type="submit"
                        variant="default"
                        size="sm"
                        className={cn(
                            attachmentsEnabled ? undefined : 'ml-auto',
                            'transition-all duration-200 enabled:-translate-y-px motion-reduce:enabled:translate-y-0',
                        )}
                        disabled={!canSubmit}
                        aria-label={sendLabel}
                    >
                        <span className="relative grid place-items-center">
                            <SendIcon
                                aria-hidden
                                className={cn('transition-opacity duration-150', busy || showSent ? 'opacity-0' : 'opacity-100')}
                            />
                            <Spinner
                                aria-hidden
                                className={cn('absolute inset-0 transition-opacity duration-150', busy ? 'opacity-100' : 'opacity-0')}
                            />
                            <CheckIcon
                                aria-hidden
                                className={cn(
                                    'absolute inset-0 transition-opacity duration-150',
                                    !busy && showSent ? 'opacity-100' : 'opacity-0',
                                )}
                            />
                        </span>
                        {sendLabel}
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>
        </form>
    );
}

function AttachmentPreview({
    attachment,
    disabled = false,
    onRemove,
}: {
    attachment: ComposerAttachment;
    disabled?: boolean;
    onRemove: () => void;
}) {
    const { file, status, error } = attachment;
    const isImage = file.type.startsWith('image/');
    const [objectUrl, setObjectUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!isImage) return;
        const url = URL.createObjectURL(file);
        setObjectUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file, isImage]);

    return (
        <div className="relative size-16 shrink-0" title={status === 'error' ? error : undefined}>
            <div className="relative flex size-full items-center justify-center overflow-hidden rounded-md border border-input bg-background">
                {isImage && objectUrl ? (
                    <img src={objectUrl} alt={file.name} className="size-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-1 p-1 text-[10px] text-muted-foreground">
                        <FileIcon className="size-5" />
                        <span className="line-clamp-2 text-center leading-tight break-all">{file.name}</span>
                    </div>
                )}
                {status === 'uploading' ? (
                    <div className="absolute inset-0 grid place-items-center bg-background/70">
                        <Spinner className="size-4 text-muted-foreground" />
                    </div>
                ) : null}
                {status === 'error' ? (
                    <div className="absolute inset-0 grid place-items-center bg-destructive/20 text-destructive">
                        <CircleAlertIcon className="size-5" />
                    </div>
                ) : null}
            </div>
            <button
                type="button"
                aria-label={`Remove ${file.name}`}
                disabled={disabled}
                onClick={onRemove}
                className="absolute -top-1.5 -right-1.5 grid size-4 place-items-center rounded-full bg-foreground text-background shadow-sm hover:bg-foreground/90 disabled:opacity-50 cursor-pointer"
            >
                <XIcon className="size-3" />
            </button>
        </div>
    );
}
