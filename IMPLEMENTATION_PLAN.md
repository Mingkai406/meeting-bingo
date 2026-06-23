# Meeting Bingo — Implementation Plan

**Derived from**: `meeting-bingo-prd.md`, `meeting-bingo-architecture.md`, `meeting-bingo-uxr.md`
**Target**: Browser-only React SPA, zero backend, deployable to Vercel free tier
**Status**: Ready to build

---

## Review Summary

Reviewed: 2026-06-23 | Reviewers: VP Product, VP Engineering, VP Design

19 issues found (4 Critical, 7 High, 4 Medium, 4 Low). All recommendations applied below.

### Changes Applied

| # | Change |
|---|--------|
| 1 | §5: auto-fill must read card/filled via a ref (fix stale-closure detection). |
| 2 | §6: guarded auto-restart outside setState, ref-tracked intent, backoff. |
| 3 | §6: elevated audio-capture limitation (mic ≠ tab/system audio). |
| 4 | Phase 2 + §7: wire `getClosestToWin` "one away" UX (PRD US-3.2 / UXR Moment 2). |
| 5 | §3: standardize timestamps on `number` (epoch ms) for clean JSON persistence. |
| 6 | §3: `filledCount` always derived via `countFilled()`; drop hand-set `1`. |
| 7 | Summary: noted plan exceeds the 90-min PRD target; flagged stretch scope. |
| 8 | Phase 3: cap stored `transcript` to avoid unbounded memory growth. |
| 9 | Phase 4: restore sets `isListening:false`; require explicit re-enable. |
| 10 | Phase 2: BingoSquare a11y (`aria-pressed`, non-color cue, reduced-motion). |
| 11 | Phase 3/4: `aria-live` regions for toasts / "one away" / BINGO. |
| 12 | §2/Phase 1: Vitest now a required dev dep (gates Phase 1). |
| 13 | §5: build a word→{row,col} index for auto-fill lookup. |
| 14 | §6: iOS Safari continuous-mode unreliability noted. |
| 15 | Phase 4: disable prod sourcemaps. |
| 16 | §1: noted intentional UXR divergences (Join/Custom/leaderboard out, single CTA). |

---

## 1. Summary

Meeting Bingo is a single-player, client-only web app. A player picks a buzzword
category, gets a randomized 5×5 bingo card, and squares auto-fill as the Web Speech
API transcribes meeting audio and matches buzzwords. Manual tap is always available
as a fallback. First line (row/col/diagonal) triggers a confetti win screen with a
shareable summary.

**No backend, no accounts, no database.** All state lives in React + `localStorage`.
Audio never leaves the device.

> **Note (scope vs 90-min target):** This plan exceeds the PRD's headline 90-minute
> workshop target. Phases 0–3 form the core demo; Phase 4 (persistence-restore, share,
> responsive) and Vitest are stretch beyond 90 min. UXR depicts Join Game, a Custom
> word pack, and leaderboards/multiplayer — these are intentionally **out** for MVP
> (PRD §2.2). Landing uses a single "New Game" CTA per PRD §6.2 (not the UXR two-CTA
> Create/Join layout).

The architecture doc already supplies working code for the hard parts
(`cardGenerator`, `bingoChecker`, `wordDetector`, `useSpeechRecognition`). This plan
sequences the build and fills the gaps those snippets leave open.

---

## 2. Tech Stack (locked by docs)

| Layer | Choice |
|-------|--------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| Speech | Web Speech API (`webkitSpeechRecognition`) |
| Animation | CSS + `canvas-confetti` |
| State | `useState` + Context, persisted to `localStorage` |
| Deploy | Vercel (static) |

Runtime deps: `react`, `react-dom`, `canvas-confetti`.
Dev deps: `vite`, `@vitejs/plugin-react`, `typescript`, `tailwindcss`, `postcss`,
`autoprefixer`, `@types/*`, ESLint, `vitest` (required — gates Phase 1 logic tests).

---

## 3. Gaps the docs leave open (decisions to make)

These are referenced but not specified in the architecture doc. Proposed resolutions:

| Gap | Resolution |
|-----|------------|
| `cn()` util (`src/lib/utils.ts`) | Add tiny `clsx`-style helper (no dep needed). |
| `GameBoard.tsx` internals | Not shown — owns listening toggle, wires speech→detect→fill→win check. Spec in §5. |
| `useGame`, `useBingoDetection`, `useLocalStorage` hooks | Listed in structure but unused by shown `App.tsx` (which keeps state inline). **Decision: keep state in `App`/`GameBoard`**, add only `useLocalStorage` for persistence. Drop the other two unless needed. |
| `shareUtils.ts` | Not shown. Implement clipboard text summary + `navigator.share` fallback. §5. |
| `WinScreen.tsx`, `LandingPage.tsx`, `CategorySelect.tsx`, `GameControls.tsx` | Interfaces given, bodies not. Build per UI mockups in PRD §6. |
| Card **preview + regenerate** before play (US-1.3) | Add a preview step in CategorySelect or a pre-game state. |
| Mic permission UX (US-2.1) | Explicit "Enable microphone" CTA with privacy copy before `start()`. |
| Firefox / unsupported speech | Feature-detect `isSupported`; hide listening UI, run manual-only. |
| `filledCount` accuracy | Derive from card via `countFilled()` rather than hand-incrementing. |
| GameContext | `App.tsx` uses prop-drilling instead. **Decision: skip Context**, drop `GameContext.tsx`. |
| Timestamp type (PRD uses `Date`, arch uses `number`) | **Decision: use `number` (epoch ms) everywhere** — clean JSON persistence, no `Date` (de)serialization. |
| `filledCount` source | **Always derived via `countFilled(card)`**; remove the hand-set `filledCount: 1` from the adapted `App.tsx`. |

---

## 4. Build Phases

### Phase 0 — Scaffold (foundation)
1. `npm create vite@latest . -- --template react-ts` (into existing repo; preserve
   `.git`, `LICENSE`, the three `meeting-bingo-*.md` docs, this plan).
2. Install deps: `canvas-confetti`; dev: `tailwindcss postcss autoprefixer`.
3. `npx tailwindcss init -p`; configure `content`, animations per architecture doc.
4. Wire `src/index.css` Tailwind directives; strip Vite boilerplate.
5. Commit: "scaffold Vite + React + TS + Tailwind".

**Done when:** `npm run dev` serves a blank Tailwind-styled page; `npm run build` passes.

### Phase 1 — Types, data, core logic (pure, testable)
Copy/adapt directly from architecture doc:
1. `src/types/index.ts` — all interfaces.
2. `src/data/categories.ts` — 3 categories, 45+ words each.
3. `src/lib/cardGenerator.ts` — Fisher-Yates shuffle, 5×5, center free space.
4. `src/lib/bingoChecker.ts` — `checkForBingo`, `countFilled`, `getClosestToWin`.
5. `src/lib/wordDetector.ts` — `detectWords` + alias support.
6. `src/lib/utils.ts` — `cn()` helper.

**Done when:** A throwaway script (or Vitest) confirms a card has 24 unique words +
free space, and `checkForBingo` detects all 12 lines. **Add Vitest tests for these
4 pure modules (required — high value, low cost; this gates the phase).**

### Phase 2 — Core game UI (manual play, no speech)
1. `App.tsx` — screen state machine: `landing → category → game → win`.
2. `LandingPage.tsx` — hero, "New Game", privacy note, "How it works" (PRD §6.2).
3. `CategorySelect.tsx` — 3 cards + sample words + back (PRD §6.3); generate card,
   show preview, allow **regenerate** before starting.
4. `BingoSquare.tsx` — per architecture doc (states: default/filled/free/winning).
   **A11y:** add `aria-pressed` for toggle state, a non-color fill cue (checkmark/icon)
   + accessible label; make the auto-fill pulse a **one-shot** animation (not permanent)
   and gate pulse + confetti behind `prefers-reduced-motion`.
5. `BingoCard.tsx` — render 5×5 grid of squares.
6. `GameBoard.tsx` — header (logo, status, `X/24` counter), card, controls; manual
   tap toggles `isFilled`; after each change run `checkForBingo` → `onWin`.
7. `GameControls.tsx` — New Card, listening toggle (wired in Phase 3).
8. `WinScreen.tsx` — winning card, stats (time, winning word, filled count), buttons.
9. **Near-win UX (PRD US-3.2 / UXR Moment 2):** wire `getClosestToWin` into the board —
   show "One away from BINGO!" and highlight the line(s)/word(s) needed.

**Done when:** Full game playable by tapping squares; BINGO fires; win screen shows
correct stats; "One away" indication + potential winning-line highlight appear;
"Play Again" / "Home" work.

### Phase 3 — Speech recognition (the differentiator)
1. `src/hooks/useSpeechRecognition.ts` — per architecture doc (continuous, interim
   results, auto-restart on `onend`, error handling, `isSupported`).
   - **Fix auto-restart:** track intended-listening in a ref; in `onend`, restart only
     if intent is true, inside try/catch **outside** any setState updater; add backoff
     and stop after repeated immediate `onend` (esp. iOS Safari).
   - **Cap transcript:** store only the last ~500 chars of `transcript` to avoid
     unbounded memory growth over a long meeting.
2. `TranscriptPanel.tsx` — live transcript + interim + detected-word chips.
3. Wire in `GameBoard`: on each final transcript chunk → `detectWordsWithAliases`
   against unfilled card words → mark squares `isFilled + isAutoFilled` → toast →
   re-check bingo.
4. Mic permission flow: explicit enable CTA + privacy copy; handle denial gracefully.
5. Feature detection: if `!isSupported`, hide listening controls, manual-only mode.
6. **A11y:** add `aria-live` regions — polite for detected-word toasts and "one away",
   assertive for BINGO — so screen-reader users get the core feedback.

**Done when:** Speaking a buzzword auto-fills its square within ~500ms with a toast;
auto-fill can complete a BINGO; denying mic still allows manual play.

### Phase 4 — Polish, persistence, deploy
1. `canvas-confetti` celebration on win (silent — user is in a meeting, per UXR).
2. `shareUtils.ts` — text summary (category, time, winning word, filled) + play link;
   `navigator.share` on mobile, clipboard copy on desktop; "Copied!" feedback.
3. `useLocalStorage` — persist in-progress game; restore on reload (PRD P1). On restore,
   set `isListening:false` and require explicit re-enable (mic permission can't
   auto-resume; a restored game must not appear "listening" while dead).
4. Responsive pass (mobile portrait priority — Dev/Maya personas use phones).
5. Toast component + `ui/Button`, `ui/Card`.
6. Deploy to Vercel; verify HTTPS (Web Speech API requires secure context).
   Set `build.sourcemap: false` for production (the architecture sample enables it).

**Done when:** Win → confetti + share works in Slack/Teams paste; reload resumes game;
mobile layout clean; live Vercel URL.

---

## 5. Key wiring specs (the parts not in the docs)

**GameBoard responsibilities**
- Owns `isListening`; calls `startListening(onResult)` / `stopListening`.
- **Avoid stale closures:** keep current game/card in a ref (`cardRef`/`gameRef`)
  updated via `useEffect` on each change. `onResult` must read the card + already-filled
  set from this ref (never a captured snapshot), so detection and `checkForBingo` always
  run against current state.
- **Word→square mapping:** build a `word → {row,col}` index from the generated card
  (cards are duplicate-free); auto-fill marks squares via this lookup.
- `onResult(finalTranscript)`:
  1. `const alreadyFilled = new Set(filled words lowercased)` (from `cardRef`)
  2. `detected = detectWordsWithAliases(finalTranscript, card.words, alreadyFilled)`
  3. For each detected word → look up `{row,col}`, set its square `isFilled=true,
     isAutoFilled=true, filledAt=Date.now()`; push toast.
  4. Recompute `filledCount = countFilled(card)`.
  5. `const line = checkForBingo(card)`; if `line` → `onWin(line, lastDetectedWord)`.
- Manual `onSquareClick(row,col)`: toggle `isFilled` (block free space), then steps 4–5.

**shareUtils**
```
buildShareText(game) -> string   // "🎯 BINGO in 18 min! Winning word: 'Blocker'. Play: <url>"
shareResult(game)    -> uses navigator.share if available, else clipboard.writeText
```

**Win stats source**: `time = completedAt - startedAt`, `winningWord` from last fill,
`filledCount` from `countFilled(card)`.

---

## 6. Risks (from PRD/architecture, carried forward)

| Risk | Mitigation |
|------|------------|
| Web Speech API unavailable (Firefox/flag) | Feature-detect → manual-only mode. |
| Poor transcription accuracy | Manual tap fallback + word aliases. |
| **Core limitation — mic ≠ system/tab audio** | Web Speech API uses the local mic, not tab/system audio; browser echo-cancellation strips far-end participants on the same device. Detection works best with in-room meetings or audio on speakers. Set this expectation in mic-enable copy; **manual tap is the realistic primary path for headphone/remote users.** |
| Speech needs HTTPS | Vercel provides it; localhost is also a secure context for dev. |
| Auto-restart loops / mic stuck on | Track intended-listening in a ref; in `onend`, restart only if intent is true, inside try/catch **outside** any setState updater; add backoff and stop after repeated immediate `onend`. Stop on unmount + screen change. |
| iOS Safari continuous mode unreliable | `continuous=true` stops often, may emit a start beep, and is gesture-gated on iOS; restart on user gesture and don't promise seamless continuous listening on iOS (PRD overstates "full support"). |
| Scope creep | Multiplayer, accounts, custom words explicitly **out** (PRD §2.2). |

---

## 7. Acceptance checklist (from PRD §9 / architecture testing)

- [ ] Card: 24 unique words + center free space; regenerate works.
- [ ] Each category yields different cards.
- [ ] Manual tap toggles; can unfill.
- [ ] All 12 winning lines detected.
- [ ] "One away" indication + potential winning-line highlight shown (PRD US-3.2).
- [ ] Mic permission prompt + privacy copy; graceful denial.
- [ ] Buzzword auto-fills square + toast; multi-word phrases ("code review") work.
- [ ] Same word twice fills once.
- [ ] Win: confetti, winning line highlighted, correct stats.
- [ ] Share copies summary + link; mobile native share.
- [ ] Reload resumes in-progress game.
- [ ] Mobile portrait layout clean.
- [ ] Works manual-only when speech unsupported.

---

## 8. Suggested commit sequence

1. `chore: scaffold Vite + React + TS + Tailwind`
2. `feat: types, categories, and core game logic (+ tests)`
3. `feat: manual bingo gameplay (landing → category → game → win)`
4. `feat: Web Speech API auto-fill detection`
5. `feat: confetti, share, localStorage persistence`
6. `chore: responsive polish + Vercel deploy config`
