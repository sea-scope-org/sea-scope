import type { GqlCChatAssistantArtifactCard } from '../../graphql/generated';
import { ChatArtifactCard } from './ChatArtifactCard';

type CardListFields = {
    cards: ReadonlyArray<GqlCChatAssistantArtifactCard>;
};

export function CardListArtifact({ list }: { list: CardListFields }) {
    // Wrapper owns `@container`; the grid queries that ancestor. Putting both on the
    // same element would make column breakpoints query a *parent* container (or none).
    return (
        <div className="@container w-full min-w-0">
            <ul className="grid w-full min-w-0 grid-cols-1 gap-3 @min-[28rem]:grid-cols-2 @min-[42rem]:grid-cols-3">
                {list.cards.map((card, index) => (
                    <li key={`${card.title}-${card.href ?? ''}-${index}`} className="min-w-0">
                        <ChatArtifactCard card={card} layout="responsive" />
                    </li>
                ))}
            </ul>
        </div>
    );
}
