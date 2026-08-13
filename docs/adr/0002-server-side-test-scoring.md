# ADR-0002: The answer key and the score stay on the server

**Status:** Accepted  
**Date:** 2026-08-12

## Decision

A Student's browser never receives the correct answers, and never reports its own score.

- `POST /api/quiz/join` parses the Test markdown server-side (`backend/src/QuizParser.php`) and returns question and option text only.
- `POST /api/quiz/answer` reveals the correct option for **one** question, and only the question the Student has actually reached.
- `POST /api/quiz/submit` takes no answers and no score. It reads the choices already recorded against the attempt and scores them against the server's own key.

Progress lives in `quiz_attempts`, keyed by a one-time token issued at join. The database stores `sha256` of the token, never the token itself.

## Why

The original design sent `result_md` — the raw model output, including the `[x]` markers the prompt asks for — straight to the Student, and accepted `score` and `total` from the browser on submit. Both the answers and the grade were under the Student's control. Opening devtools was enough; no tooling required.

Scoring on the server is the only arrangement where the result means anything.

## Trade-off

Instant per-question feedback is the reason `/api/quiz/answer` exists at all. A quiz that only reveals results at the end would need no such endpoint, but it would be a worse classroom experience — the feedback loop while a question is fresh is the point.

Sequential enforcement (`answered_count`) is what stops that endpoint from becoming a way to read the whole key: asking for question 5 while on question 2 returns 409. Re-asking the *previous* question returns the same reveal without advancing, so a dropped connection can be retried safely.

One finished attempt per name per session, enforced by a partial unique index on `quiz_attempts`, stops answers being recovered by resubmitting.

## What this does not solve

Nothing stops a Student opening the quiz on a second device under a different name, or two Students sharing one code — inherent to a no-login quiz, and acceptable in a classroom where the Teacher can see the roster.

## When to revisit

If Tests are ever used for assessment that carries weight outside the classroom, this needs real per-student identity, not a name typed into a box.
