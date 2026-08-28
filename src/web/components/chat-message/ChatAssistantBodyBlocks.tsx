import type { GqlCChatAssistantBodyBlock } from '../../graphql/generated';
import { AssistantMarkdown } from '../AssistantMarkdown';
import { CardListArtifact } from './ChatAssistantArtifactBody';

/** Renders ordered assistant body blocks (markdown + card lists). */
export function ChatAssistantBodyBlocks({
    blocks,
    streamingMarkdown = false,
}: {
    blocks: ReadonlyArray<GqlCChatAssistantBodyBlock>;
    /** When true, markdown blocks render with the streaming cursor. */
    streamingMarkdown?: boolean;
}) {
    if (blocks.length === 0) return null;
    return (
        <div className="flex w-full min-w-0 flex-col gap-2">
            {blocks.map((block, index) => (
                <ChatAssistantBodyBlock
                    key={assistantBodyBlockKey(block, index, blocks)}
                    block={block}
                    streamingMarkdown={streamingMarkdown}
                />
            ))}
        </div>
    );
}

/** Prefer type + occurrence over absolute index so appending non-markdown
 *  blocks (cards after prose) does not remount the streaming markdown node. */
function assistantBodyBlockKey(
    block: GqlCChatAssistantBodyBlock,
    index: number,
    blocks: ReadonlyArray<GqlCChatAssistantBodyBlock>,
): string {
    const occurrence = blocks.slice(0, index).filter((b) => b.__typename === block.__typename).length;
    switch (block.__typename) {
        case 'ChatAssistantBodyBlockMarkdown':
            return `markdown-${occurrence}`;
        case 'ChatAssistantBodyBlockCardList':
            return `cards-${occurrence}-${block.cards[0]?.title ?? block.cards.length}`;
        case undefined:
            return `block-${index}`;
    }
}

function ChatAssistantBodyBlock({ block, streamingMarkdown }: { block: GqlCChatAssistantBodyBlock; streamingMarkdown: boolean }) {
    switch (block.__typename) {
        case 'ChatAssistantBodyBlockMarkdown':
            return block.text.length > 0 ? <AssistantMarkdown text={block.text} streaming={streamingMarkdown} /> : null;
        case 'ChatAssistantBodyBlockCardList':
            return <CardListArtifact list={block} />;
        case undefined:
            return null;
    }
}
