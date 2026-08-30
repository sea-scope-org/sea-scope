# SeaScope pitch (~2.5–3 minutes)

Partner pitch: one shared operational problem — which contact matters when the picture is noisy and when AIS fails — then complementary
answers. SeaScope is the intelligence layer; the partner is the sensing layer; both feed the same engine.

**Promise line:** From thousands of vessel tracks to the one that matters — even when AIS goes dark.

**Arc:** Shared problem → SeaScope (meaning) → partner (presence) → same engine.

**Slide rule:** One sentence and one picture per slide. No bullet stacks. A beat may use more than one slide.

**Timing:** Hook ~15s; beats ~30–35s. Cut the rentable-asset line in beat 4 first if long.

**Visuals to capture / build**

| Asset                                                                     | Source                                      |
| ------------------------------------------------------------------------- | ------------------------------------------- |
| Crowded AIS traffic over cables/pipelines (no SeaScope UI)                | Slide art / stock / ops map                 |
| Watch console screenshot (Needs attention + Case / Why)                   | Live `/watch` with Demo on                  |
| Watch console / Demo frame (AIS-dark or mismatched track)                 | Live `/watch` with Demo on                  |
| Engine diagram v1 — feeds in → classification & evaluation → risk out     | Coded page `/how-it-works` (also slide art) |
| Engine diagram v2 — same diagram; partner sensor network joins the inputs | Slide art (reuse v1 layout)                 |

### Image generation prompts

Use these only for **slide art**. Do **not** generate product UI — capture slides 3 and 5 from live `/watch` with Demo on. Slide 6 is
partner-supplied.

**Shared style (prepend to every prompt):** Full-bleed presentation still, 16:9, one clear focal point, no text overlays, no logos, no UI
chrome, no watermarks. Documentary maritime-ops realism — cool blue-grey sea, muted chart greens, soft operational lighting. Avoid purple
gradients, neon glow, sci-fi HUD clutter, and cartoon illustration.

#### Slide 1 — Hook (generate)

```text
Photorealistic 16:9 wide shot of a professional woman in a maritime operations center, mid-30s, short practical hair, civilian ops
attire (no naval uniform), leaning forward at a large curved multi-monitor wall. She points firmly at a single highlighted vessel
contact among a dense cloud of AIS track dots on a nautical traffic display. The room is dimly lit by the screens; soft reflections
on glass; serious focused expression. Background shows other faint tracks and coastline silhouettes. Shallow depth of field on her
hand and the one contact she indicates. Full bleed, no text, no logos, no UI labels.
```

#### Slide 2 — Shared problem (generate)

```text
Photorealistic 16:9 top-down or oblique maritime operations map: dense AIS vessel tracks as many small dots and trails crowding a
coastal sea lane. Beneath the traffic, faint schematic undersea cable and pipeline routes cross the seabed like thin infrastructure
lines. Status-quo ops picture only — generic chart styling, not a branded product UI. Sense of noise and overload: dozens of contacts,
no single highlight. Cool blue water, muted land, subtle depth cues for cables. Full bleed, no text, no logos, no callout badges.
```

#### Slide 3 — SeaScope product (do not generate)

Capture from live `/watch` with Demo on: Needs attention queue + Case / Why on a scored contact.

#### Slide 4 — Engine diagram v1 (generate)

```text
Clean editorial architecture diagram, 16:9, light warm off-white canvas (#f4f3ec feel), flat vector / isometric hybrid. Left: two
simple input nodes labeled only as abstract feed blocks (no readable words preferred — use icon glyphs: radio/AIS wave and a public
data stack). Center: one strong rounded engine block suggesting classification and evaluation (subtle inner layers, deep indigo
accent #1e179f). Right: ranked risk outputs as a short stack of assessment cards with factor lines — abstract, not real product UI.
Soft connecting arrows left→center→right. Generous whitespace, one composition, no decorative clutter, no logos, no screenshots.
```

#### Slide 5 — Handoff (do not generate)

Capture from live `/watch` with Demo on: AIS-dark or mismatched track on the same console.

#### Slide 6 — Partner (do not generate)

Partner-supplied ocean sensor / network imagery.

#### Slide 7 — Engine diagram v2 (generate)

```text
Same layout, style, proportions, colors, and center engine block as the v1 engine diagram — identical composition so they match as a
pair. Only change the left inputs: keep AIS / public-feed nodes and add a third input node for a partner ocean sensor network
(buoy / hydrophone / underwater node glyph). Same center classification & evaluation engine. Same ranked risk assessment outputs on
the right. Soft arrows from all three inputs into the engine. Light warm off-white canvas, deep indigo accent, full bleed, no text
overlays if possible, no logos, no product screenshots.
```

**Generation notes**

- Generate slides 4 and 7 as a matching pair (same seed / same base image + edit, or regenerate v2 from v1).
- Prefer landscape 1920×1080 or higher; crop full-bleed for slides.
- If the model insists on labels, keep them to three short English words max (e.g. AIS, Engine, Risk) — never full sentences.

---

## 0. Hook (~15s)

**Say**

- A vessel near an undersea cable drops off AIS.
- The screen is full of other traffic. No one knows which track to chase first.
- SeaScope turns that noise into ranked priorities — and says why.
- Our partner adds independent sensing where AIS falls short.

**Slide**

- **Sentence:** From thousands of vessel tracks to the one that matters — even when AIS goes dark.
- **Picture:** A woman at a naval traffic dashboard, leaning in and pointing at one contact among many.

---

## 1. Shared problem (~30s)

**Say**

- One problem: which contact matters right now — and why — when the screen is crowded.
- AIS — the radio broadcast ships use to report who and where they are — often lies or goes dark.
- Ship databases answer “what do we know about this vessel?” Traffic systems answer “what is moving?”
- Neither answers which track to chase while cables, pipelines, and sea lanes sit under that traffic.
- Ships go silent or spoof identity. Coverage thins where risk is highest. A broadcast is not proof a hull is there.
- The need is not more dots on a map. It is priorities you can explain and act on.

**Slide**

- **Sentence:** Not more dots on a map — priorities you can explain and act on.
- **Picture:** Crowded AIS traffic over cables and pipelines — status-quo ops picture, not SeaScope UI.

---

## 2. SeaScope: meaning (~35s)

**Say**

- SeaScope is an AI maritime security copilot: ingest, detect, prioritize, explain, alert.
- Feeds come in; our classification and evaluation engine scores them.
- Ranked risk assessments come out — with contributing factors you can defend.
- Elevated risk lands on a short attention list. Critical risk opens an incident with a human in the loop.
- From there, teams act in their own systems — or plug SeaScope into them — including visual confirmation when they need it.
- Software watches first. People escalate — and act on — what matters.
- Today that starts with AIS and public feeds. The same model is built for any sensor feed next.

**Slide A — product**

- **Sentence:** Software watches first; people act on what matters.
- **Picture:** Product screenshot — Needs attention queue plus Case / Why on a scored contact (Demo narrative).

**Slide B — engine**

- **Sentence:** Data in; classification and evaluation; explainable risk out.
- **Picture:** Engine diagram v1 — AIS (and public feeds) flow into SeaScope’s classification & evaluation engine; ranked risk assessments
  and factors flow out.

---

## 3. Partner: presence (~35s)

**Say (SeaScope handoff, ~10s)**

- AIS tells what ships claim. We need to know what is there.
- SeaScope is ready for partner ocean sensors — and radar, cameras — inside the same prioritization model.

**Say (Partner)**

_[Partner owns this beat — leave blank.]_

**Slide A — handoff**

- **Sentence:** AIS tells what ships claim — we need to know what is there.
- **Picture:** Product screenshot or Demo frame — a track going AIS-dark (or mismatched) on the same console.

**Slide B — partner**

- **Sentence:** They detect presence; SeaScope turns it into meaning.
- **Picture:** Partner sensor / ocean network imagery _(partner-supplied)_.

---

## 4. Same engine → endgame (~30s)

**Say**

- Partner detections feed SeaScope first — into the same engine you just saw.
- One picture: AIS where it works, proprietary sensing where it does not.
- Offline support keeps operations usable when public feeds or the wide-area link drop.
- Win as the intelligence layer teams already trust.
- Later, the same sensor network can become a rentable asset — capacity leased to others while SeaScope stays the primary product.
- Close the AIS gap today. Own the sensing layer others will need tomorrow.

**Slide**

- **Sentence:** Same engine — now with the sensor network alongside AIS.
- **Picture:** Engine diagram v2 — identical layout to slide 2B; partner sensor network joins the input side next to AIS; same risk
  assessments out.

---

## Slide spine

| #   | Beat     | Slide sentence                                                                     | Picture                                                    |
| --- | -------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1   | Hook     | From thousands of vessel tracks to the one that matters — even when AIS goes dark. | Woman pointing at one contact on a naval traffic dashboard |
| 2   | Problem  | Not more dots on a map — priorities you can explain and act on.                    | Crowded AIS over cables/pipelines (no SeaScope UI)         |
| 3   | SeaScope | Software watches first; people act on what matters.                                | Screenshot: Needs attention + Case / Why                   |
| 4   | SeaScope | Data in; classification and evaluation; explainable risk out.                      | Engine diagram v1 (AIS → engine → risk)                    |
| 5   | Handoff  | AIS tells what ships claim — we need to know what is there.                        | Screenshot: AIS-dark / mismatch on console                 |
| 6   | Partner  | They detect presence; SeaScope turns it into meaning.                              | Partner sensors → network                                  |
| 7   | Endgame  | Same engine — now with the sensor network alongside AIS.                           | Engine diagram v2 (AIS + sensors → engine → risk)          |

---

## Speaker notes

- Cold open on a dark vessel / busy screen; name SeaScope vs partner briefly — professional, not ceremonial.
- Tell **one** problem once (noise + AIS failure); do not restart a second problem/solution cycle.
- Problem slide: status-quo picture only — first SeaScope UI appears in beat 2.
- Audience is mixed business / technical — precise language is fine; avoid navy-only jargon.
- Beat 3: SeaScope owns the ~10s handoff; partner owns the rest — do not invent sensor details.
- Sell **one picture + exclusive data + offline + act when it matters**.
- If challenged on sensors: “SeaScope already prioritizes any feed — AIS today, partner network next.”
- Keep slides sparse: one sentence, one image; let the voice carry the detail.
- Capture screenshots from the real watch console so the room sees working product, not mockups.
- Engine diagrams must match layout between v1 and v2 — only the inputs change — so the callback lands visually.
