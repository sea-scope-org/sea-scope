# Fonts

Typography is Inter only — a single sans for UI, reading, and marketing surfaces.

## Decision

| Role               | Face                        | Source                                 |
| ------------------ | --------------------------- | -------------------------------------- |
| Sans (`font-sans`) | Inter (opsz + wght 400–700) | Google Fonts, loaded from `__root.tsx` |

`body` and the Tailwind `font-sans` utility both resolve to Inter via `--font-sans` in `src/styles.css`. Mono stays the Tailwind default
stack for code / tabular instrument readouts (`font-mono`).

## Options considered

| Option                          | Pros                                              | Cons                              |
| ------------------------------- | ------------------------------------------------- | --------------------------------- |
| Inter via Google Fonts (chosen) | Zero package weight, variable opsz/wght, familiar | Network dependency on first paint |
| `@fontsource-variable/inter`    | Offline / CSP-friendly                            | Extra install, bundler wiring     |
| System UI stack                 | Instant                                           | No brand control                  |

## Implementation

- `src/routes/__root.tsx` — `preconnect` to `fonts.googleapis.com` / `fonts.gstatic.com`, then the Inter stylesheet link.
- `src/styles.css` — `@theme inline { --font-sans: 'Inter', … }`; `body` applies `font-sans`.

Do not introduce a second display face without updating this doc.
