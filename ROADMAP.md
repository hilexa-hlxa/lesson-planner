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
  mailto. Social links are declared in `SOCIALS` at the top of `Footer.jsx` and render only
  when a URL is filled in.
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

## Open

- **Real testimonials** — the landing still uses invented teachers. Replace the entries in
  `TESTIMONIALS` (`LandingPage.jsx`) with real quotes once teachers are using the product.
- **Contact address and socials** — `CONTACT_EMAIL` in `Footer.jsx` is set to
  `hello@lessonplanner.kz` and the `SOCIALS` URLs are empty. Fill both in with real values.
- **CreateTestPage copy** — the page is still a mix of Russian and English hardcoded strings
  (labels, table headers, the report modal). Its error messages are localised; the rest is not.
- **Report prompts** — `generateReport` hardcodes "Language: Russian (Strictly)" regardless
  of the interface language.
- **Answer reveal can still be scripted** — `/api/quiz/answer` keeps no per-student progress,
  so a determined student could request every question's answer before answering. Closing this
  needs a `quiz_attempts` table to track position; it raises the bar from "read the page source"
  to "write a script", which was the goal for a classroom setting.
- **No server-side rate limiting** — nothing throttles join attempts, so the 10 000-code space
  is brute-forceable. Worth a per-IP limit on `/api/quiz/join` and on the auth routes.
- **`cookie_secure` is `false`** — must be `true` in `config.local.php` before an HTTPS deploy.
