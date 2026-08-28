# Theme

SeaScope is a **single light theme**. There is no dark-mode toggle, no `prefers-color-scheme` switch, and no `.dark` token set.

## Brand palette

| Token                         | Hex       | Role                                      |
| ----------------------------- | --------- | ----------------------------------------- |
| `text` / `--foreground`       | `#050315` | Body copy and icons on light surfaces     |
| `background` / `--background` | `#f4f3ec` | Page canvas                               |
| `primary` / `--primary`       | `#1e179f` | Primary actions, focus ring, nav progress |
| `secondary` / `--secondary`   | `#c4c3d2` | Secondary surfaces and soft chrome        |
| `accent` / `--accent`         | `#e8c751` | Highlight / emphasis                      |

Derived shadcn tokens (`muted`, `border`, `card`, `sidebar`, …) live in `src/styles.css` `:root` and stay in this warm light family.
Foregrounds on primary use `--primary-foreground` (`#f4f3ec`); accent and secondary use the ink `--foreground` (`#050315`) for contrast.

## Options considered

| Option                           | Pros                                                   | Cons                                         |
| -------------------------------- | ------------------------------------------------------ | -------------------------------------------- |
| Light-only brand tokens (chosen) | One visual identity, no flash / hydration theme script | Chart basemap stays dark Carto for geography |
| System light/dark + toggle       | Familiar OS sync                                       | Dilutes brand; needs flash-prevention script |
| Dual token sets without toggle   | Ready for later dark                                   | Dead weight while product is light-only      |

## Implementation

- `src/styles.css` — brand CSS variables + `@theme inline` color bridge; `html { color-scheme: light }`
- `src/routes/__root.tsx` — `theme-color` meta `#f4f3ec`; no theme-init script
- `public/manifest.json` — `theme_color` / `background_color` `#f4f3ec`
- Toasts force `theme="light"` in `src/web/components/base/sonner.tsx`
- `/watch` chrome (toolbar, sidebar, page shell) consumes the same light tokens as marketing and chat; only the MapLibre basemap stays Carto
  Dark Matter — see [`docs/features/watch-console.md`](../features/watch-console.md)

Do not reintroduce a theme toggle or a `.dark { … }` token block without updating this doc.
