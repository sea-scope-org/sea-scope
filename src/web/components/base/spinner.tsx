import { Loader2Icon } from 'lucide-react';
import { cn } from '../../utils/cn';

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
    // Decorative usages pass `aria-hidden` which overrides this for AT; keep a
    // default so standalone status spinners stay announced.
    const loadingLabel = 'Loading';
    return <Loader2Icon role="status" aria-label={loadingLabel} className={cn('size-4 animate-spin', className)} {...props} />;
}

export { Spinner };
