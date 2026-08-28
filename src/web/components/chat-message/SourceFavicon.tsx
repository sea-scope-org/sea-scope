import { ExternalLinkIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../utils/cn';
import { sourceFaviconUrl } from '../../utils/sourceFaviconUrl';

/**
 * Tiny domain favicon for a chat source link. Falls back to the generic
 * external-link glyph when no domain can be derived (e.g. a Gemini grounding
 * redirect without a domain-like title) or the image fails to load.
 */
export function SourceFavicon({ url, title, className }: { url: string; title?: string; className?: string }) {
    const [failed, setFailed] = useState(false);
    const faviconUrl = sourceFaviconUrl(url, { title });

    if (!faviconUrl || failed) {
        return <ExternalLinkIcon className={cn('size-3.5 shrink-0 opacity-70', className)} aria-hidden />;
    }

    return (
        <img
            src={faviconUrl}
            alt=""
            width={14}
            height={14}
            decoding="async"
            referrerPolicy="no-referrer"
            className={cn('size-3.5 shrink-0 rounded-sm', className)}
            onError={() => setFailed(true)}
        />
    );
}
