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

## Open

- **Real testimonials** — the landing still uses invented teachers. Replace the entries in
  `TESTIMONIALS` (`LandingPage.jsx`) with real quotes once teachers are using the product.
- **Contact address and socials** — `CONTACT_EMAIL` in `Footer.jsx` is set to
  `hello@lessonplanner.kz` and the `SOCIALS` URLs are empty. Fill both in with real values.
- **CreateTestPage copy** — the page is still a mix of Russian and English hardcoded strings
  (labels, table headers, the report modal). Its error messages are localised; the rest is not.
- **Report prompts** — `generateReport` hardcodes "Language: Russian (Strictly)" regardless
  of the interface language.
