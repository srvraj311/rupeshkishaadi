# शुभ विवाह · Rupesh & Rachna

Animated, bilingual (Hindi / English) wedding invitation for **Rupesh Ranjan & Rachna Bharti** — 21 November 2026.
Plain HTML, CSS and JavaScript: no build step, no dependencies.

## Run locally

```bash
cd ~/shaadi
python3 -m http.server 8000      # or: npx serve .
```

Open http://localhost:8000. (Opening `index.html` directly also works, but sharing and audio behave best over http.)

## Deploy (Vercel, static)

```bash
npx vercel          # preview
npx vercel --prod   # production
```

No framework, build command or output directory needed. Any static host works (Netlify, GitHub Pages, Cloudflare Pages).
After deploying, set `SHARE_URL` at the top of `js/app.js` to the final link so “Copy link” and WhatsApp share it.

## Files

| Path | What it is |
|---|---|
| `index.html` | All invitation content as real HTML (Hindi + English) |
| `css/style.css` | Design tokens, layout, the shared ethnic card style, animations, reduced-motion rules |
| `js/app.js` | Behaviour: palace-door intro, language toggle, music, countdown, Saptapadi vows, scroll reveals, share |
| `assets/vakratunda.mp3` | Background music (compressed to 96 kbps with soft fades for looping) |
| `assets/ganesh-mark.svg`, `assets/corner.svg` | Card watermark and corner ornament |

## Editing content

- **Text, names, events, addresses** — edit `index.html` directly. Each language is a sibling pair: `<span class="hi" lang="hi">…</span><span class="en">…</span>`.
- **Calendar buttons** — each event card has a Google Calendar link and a downloadable `.ics` (data URL) with all-day dates in IST. If you change a date, update both links.
- **Seven vows** — the first vow is in `index.html`; all seven live in the `VOWS` array in `js/app.js`.
- **Countdown target** — `COUNTDOWN_TARGET_MS` in `js/app.js` (start of 21 Nov 2026, IST). It counts to the date, not the muhurat.
- **Music** — replace `assets/vakratunda.mp3` (keep the name, or change the `<audio src>` in `index.html`). Browsers block sound until the visitor's first tap, so it starts on the first tap and fades in; the music button mutes it.
- **Default language** — Hindi. A visitor's choice is remembered in their browser.

## Behaviour notes

- Tap anywhere on the cover (or “निमंत्रण खोलें”) to open the doors; “Skip intro” jumps to the programme. The floating ✕ closes the card back to the cover.
- `prefers-reduced-motion` (or the in-page motion button) turns all animation off; the page is fully usable.
- With JavaScript disabled, all content still shows (doors skipped, static countdown cells).

## Before sending to guests — verify with the family

- [ ] Bride's father “Kirendra Kumar” (श्री किरेन्द्र कुमार) and “Satgama” (सतगामा) spellings
- [ ] All grandparents' / parents' names, स्मृतिशेष markings, and family credits
- [ ] 20 Nov ritual name घृतढारी
- [ ] 18 Nov Lagna was removed from the programme on request — confirm
- [ ] Reception wording “7:00 PM onwards, until guests arrive” / सायं 7 बजे से आगमन तक
- [ ] All seven Saptapadi verses (working transcription), especially vow 3 line 2
- [ ] Divine-union verse (Lakshmi–Vishnu, Ram–Janaki…) not included — needs the card photo
- [ ] Added lines: आप सपरिवार सादर आमंत्रित हैं, ॥ शुभमस्तु ॥
- [ ] Music is a commercial recording (Anuradha Paudwal) — confirm you're comfortable sharing it publicly
- [ ] Tap every Directions button on a phone
