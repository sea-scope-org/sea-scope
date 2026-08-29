import type { PropsWithChildren, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface SectionTabsProps extends PropsWithChildren {
    ariaLabel: string;
    /** Section-level action outside the `<nav>` (focus mode, “New item”, …). */
    trailing?: ReactNode;
    className?: string;
    /** Draw the bottom border on the nav (or the trailing wrapper). Default true. */
    border?: boolean;
}

/**
 * Top-of-page section switcher shell. Items are typically TanStack `<Link>`s —
 * pass them as children with `sectionTabClassName(active)`. Optional primitive;
 * not required for every surface.
 */
export function SectionTabs({ ariaLabel, children, trailing, className, border = true }: SectionTabsProps) {
    const nav = (
        <nav
            aria-label={ariaLabel}
            className={cn(
                'flex gap-1 overflow-x-auto overflow-y-hidden no-scrollbar scroll-fade-x',
                trailing ? 'flex-wrap' : null,
                border && !trailing ? 'border-b border-border/60' : null,
                className,
            )}
        >
            {children}
        </nav>
    );

    if (trailing) {
        return (
            <div className={cn('flex flex-wrap items-end justify-between gap-2', border ? 'border-b border-border/60' : null)}>
                {nav}
                {trailing}
            </div>
        );
    }

    return nav;
}

/** Active/inactive classes for a section-tab `<Link>`. */
export function sectionTabClassName(active: boolean) {
    return cn(
        '-mb-px flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors',
        active
            ? 'border-primary text-foreground'
            : 'border-transparent text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground',
    );
}

/** Count badge on a section tab. */
export function SectionTabCount({ children }: PropsWithChildren) {
    return <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">{children}</span>;
}

/** Status dot. Pass `label` so the status is not color-only for assistive tech. */
export function SectionTabStatusDot({ label }: { label: string }) {
    return (
        <span className="ml-0.5 inline-flex items-center">
            <span className="size-1.5 rounded-full bg-amber-500" aria-hidden />
            <span className="sr-only">{label}</span>
        </span>
    );
}
