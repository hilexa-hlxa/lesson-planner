# Roadmap

## Done

- **Real data in mockups** — `PlanVisual`, `TestVisual`, `SummaryVisual`, `WordleVisual` and
  `DashboardPreview` take a `lang` prop and read from the `MOCK` map in `LandingPage.jsx`.
  The Wordle preview scores its guesses with a real two-pass Wordle algorithm, so the
  per-language words (КНИГА / САБАҚ / LEARN) colour correctly.
- **Mobile layout** — Header collapses to logo + settings menu + CTA below `lg`, with the
  accessibility controls (theme, contrast, font size) moved into a dropdown so they stay
  reachable on phones. Hero type scale, Before/After divider, feature rows, Hub cards,
  Dashboard panels, Classes/ClassDetail/StudentClasses headers and CreateTest all stack
  at small widths. Verified at 390px — no horizontal overflow.
- **Auth error messages** — inline errors in `AuthModal`. All other raw `alert()` calls are
  gone too: `CreateTestPage` (5), `StudentJoinPage` (3), `FortuneWheel` (1) now use inline
  banners or disabled states.
- **Footer content** — localised (RU/KZ/EN) with Pricing, Privacy, Terms and a contact
  mailto. Contacts and social links live in `src/siteConfig.js`; socials render only when a
  URL is filled in.
- **Empty states** — Hub (onboarding card), Classes (icon + create CTA), StudentClasses,
  Dashboard history and generation output.
- **Loading states** — shared `Skeleton` / `SkeletonCard` / `SkeletonRows` components replace
  the old bare `...` on Classes, StudentClasses, ClassDetail and the Dashboard output pane.
- **Profile page** — name edits persist through the new `PATCH /api/me` endpoint; page is
  localised; avatar is generated from initials instead of a hardcoded external image;
  achievements are driven by real unlocked keys and the coin balance; the achievement toast
  now actually renders (it was passing props the component never read).
- **404 page** — localised, follows the interface language.
- **SEO basics** — title, description, canonical, Open Graph and Twitter tags in
  `index.html`, plus `public/favicon.svg` and a generated `public/og-image.png` (1200×630).
  `App.jsx` keeps `<title>`, description and `<html lang>` in sync with the language switch.
- **Onboarding** — one-time dismissible welcome card on the Hub, with different copy and a
  different first action for teachers and students (`lp_onboarding_dismissed_v1`).
- **Pricing page** — `/pricing` with the free plan, an honest list of limits, why it's free,
  a section for schools, and terms for future pricing changes. `/privacy` and `/terms` ship
  alongside it.

## Security and correctness pass

- **AI stream required no login** — `POST /api/generate/stream` was routed before the
  main try block and never checked the session, so anyone could spend our Gemini key.
  Now returns 401 without a cookie.
- **Top students' results were discarded** — `grantAchievement` mutated `user.achievements`
  on a null user (guests on the public `/play` route) and threw before the submit fetch ran.
  Guests now short-circuit, dedup uses a ref, and `QuizPlayer` submits before granting.
- **Quiz scores were client-supplied** — `/api/quiz/submit` took `score` and `total` from the
  browser. The server now scores from its own answer key; the client sends only the selected
  option indices. One result per name per session window, so answers can't be brute-forced by
  resubmitting.
- **Students were sent the answer key** — `/api/quiz/join` returned `result_md`, complete with
  the `[x]` markers. Parsing moved server-side (`backend/src/QuizParser.php`, verified to match
  the old client parser's output); students receive question and option text only. The correct
  option is revealed per question by `/api/quiz/answer` after they have chosen, which keeps the
  instant feedback in the player.
- **Hardcoded API hosts** — `CreateTestPage` pointed at `http://localhost:8000/api` and three
  other files carried their own `VITE_API_URL` fallback. Everything now goes through `api.js`
  on a relative `/api` path.
- **DB errors leaked the connection string** — an uncaught `PDOException` at bootstrap printed
  a PHP fatal, host and all, to the client. `display_errors` is off, bootstrap is wrapped, and
  failures return a generic 503.
- **Intermittent 500s from Supabase** — `PDO::ATTR_PERSISTENT` was on, so when the transaction
  pooler dropped an idle connection the PHP worker kept reusing the dead handle and failed every
  request until it recycled ("SSL SYSCALL error: EOF detected"). Persistence is off.
- **Answers could be read ahead** — `/api/quiz/answer` revealed any question by index. Migration
  `003` adds `quiz_attempts`: joining issues a one-time token, the server tracks which question
  the student is on, and only that one can be revealed. The student's choices live in the
  attempt row, so `submit` no longer accepts answers from the browser at all. One finished
  attempt per name per session, enforced by a partial unique index.
- **No rate limiting** — migration `003` adds `rate_limits` and `backend/src/RateLimiter.php`
  (shared counter in the database, since PHP workers share no memory). Applied to quiz joins
  (30 failures / 5 min and 120 / hour per IP), logins (8 failures / 15 min per account, 40 per
  IP), registration (10 / hour per IP) and generation (60 / hour per account). Only *failures*
  count, and the code is checked before the limit — a whole class shares one school IP, so a
  correct code must never be refused because someone else was guessing.
- **`cookie_secure` was a manual step** — it was hardcoded `false` with a comment saying to
  flip it on HTTPS, which is the kind of thing you find out about after deploying. It is now
  detected from the request (`HTTPS`, port 443, or `X-Forwarded-Proto` behind a proxy) and can
  still be forced either way with the `COOKIE_SECURE` env var.
- **CreateTestPage was half-translated** — the page mixed hardcoded Russian and English and
  ignored the language switch. All of it now comes from one map, and `generateReport` asks the
  model for the interface language instead of always Russian.
- **Lint** — `eslint-plugin-react` was missing, so JSX usage was invisible to `no-unused-vars`
  and imports like `motion` looked dead (deleting them would have broken the pages). With the
  plugin added and the genuine problems fixed, the project lints clean: 0 problems, from 24.
- **Students could not reach the join page** — `/join-test` sat behind `Protected`, which sends
  anyone without an account to the landing page. The whole "join by code, no registration"
  promise — advertised on the landing, pricing and privacy pages — was unreachable for the
  people it was built for. The route is public now, like `/play` beside it, and the back arrow
  points home for guests instead of into the members-only games section.
- **The /prompts page did nothing** — two separate faults. `buildPrompt` loaded
  `cfg.lesson_plan` and never substituted any of it, so style, detail level and the section
  toggles had no effect on the prompt (the quiz half always worked). And nothing persisted:
  `api.promptConfig.get/set` pointed at `/api/prompt-config`, a route that did not exist, and
  no one called them — settings lived in React state and reset on reload. Migration `005` adds
  `users.prompt_config`, the route exists now, the app loads the config on sign-in and saves it
  with feedback on the button. `payloadToMarkdown` moved to `src/lib/lessonPlanDoc.js` and skips
  sections the teacher turned off instead of printing a heading with a dash, and drops the
  Minutes column when per-minute timing is off. The lesson-plan card also lost its "Markdown"
  toggle: that pipeline always emits JSON and the app renders the document itself, so the
  control could never have done anything.
- **Achievement names were always Russian** — the title was passed as a literal string into
  `grantAchievement` from three different files, so a teacher on the English interface saw
  «Высший пилотаж» in the toast. Calls now pass only a key and the text comes from
  `src/lib/achievements.js`, which also replaced the duplicate catalog `ProfilePage` was keeping.
- **Mobile on the last four pages** — Tools, Games, Wordle and Lesson Summary still had `px-10`,
  `p-10`, `text-6xl`/`text-7xl` and fixed `h-[360px]` cards with no responsive variants. Fixed by
  inspection: they sit behind auth, so they could not be measured in a browser the way the public
  pages were.
- **The student player was Russian-only** — every label in `QuizPlayer` was a hardcoded Russian
  literal, and the component no longer received `lang` at all, so a Kazakh or English class still
  sat a Russian-looking test. Both fixed; `AchievementToast` was likewise hardcoded English.
- **No automated tests** — everything was verified with throwaway scripts. `npm test` now covers
  the document renderer, prompt substitution and the achievement catalog (11 checks), and
  `php backend/extras/tests/quiz_parser_test.php` covers the parser that derives the answer key
  (13 checks, correct answers deliberately at different positions so a reordering bug fails).
- **Domain docs were stale** — `CONTEXT.md` gained Test Attempt and Generation Settings, ADR-0002
  and ADR-0003 record the scoring and rate-limiting decisions, and ADR-0001 now notes that the
  `type` column it described was only actually created in migration `004`.
- **Plans and quizzes were indistinguishable** — both pages sent `type` on create, but there was
  no column to hold it, so `POST /api/generations` dropped it and the GET never returned it. The
  Dashboard history therefore listed everything and the `/create-test` library listed nothing.
  Migration `004` adds `generations.type` (defaulting to `lesson_plan`, backfilling rows that
  have an access code to `test`), the insert stores it, and `GET /api/generations?type=` filters
  in the database — so each page asks for its own kind and no client-side filtering is left.

## Needs you

- **Rotate the Supabase database password.** It was committed in plaintext in `docker-compose.yml`
  and is in git history from commit `24b8e5a` onward, including current `origin/main`. The value
  is out of the tracked file now (`.env`, gitignored, with `.env.example` alongside) — but that
  does not remove it from history. Rotation in Supabase → Project Settings → Database is the only
  real fix, then update your local `.env`. The GitHub API returns 404 unauthenticated, so the repo
  is private or does not exist under that name; either way a committed credential should be
  treated as burned.

## Open

- **Real testimonials** — the landing still uses invented teachers. Replace the entries in
  `TESTIMONIALS` (`LandingPage.jsx`) with real quotes once teachers are using the product.
- **Contact address and socials** — `CONTACT_EMAIL` and `SOCIALS` now live in
  `src/siteConfig.js`, the only file to edit. The address is still the placeholder
  `hello@lessonplanner.kz` and both social URLs are empty (empty ones render nothing).
