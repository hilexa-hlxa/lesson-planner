---
  Roadmap
  
  Must-do (broken or missing)

  - Real data in mockups — mockup components (PlanVisual,
  TestVisual etc.) still show hardcoded Russian text. They
  should at minimum switch language with the lang prop.
  - Mobile layout — landing page hasn't been tested on small
  screens. The Before/After grid and features alternating
  layout likely break below md.
  - Auth error messages — alert("Auth Error") and
  alert("Select a role") are raw browser alerts. Needs inline
   form errors.
  - Footer content — likely placeholder or minimal. Should
  have links (privacy policy, contact, socials).

  Should-do (UX gaps)

  - Empty states — Hub, Classes, and history pages when a new
   user has no data yet. Currently probably just blank.
  - Loading states — AI generation streams, but other API
  calls (fetching classes, test history) probably show
  nothing while loading.
  - Profile page — exists at /profile but unknown how
  complete it is.
  - 404 page — unknown if one exists.

  Could-do (growth / polish)

  - SEO basics — <title>, meta description, og:image.
  Currently probably default Vite placeholder.
  - Onboarding flow — first-time user lands on Hub with no
  context. A one-time welcome card or guided first action
  would help.
  - Pricing page — even "free" deserves its own page with
  clear terms, especially for schools.
  - Real testimonials — replace the current placeholder names
   with actual teachers once you have users.

  ---