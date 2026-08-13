# ADR-0003: Rate limits count failures, and the Access Code is checked first

**Status:** Accepted  
**Date:** 2026-08-12

## Decision

Rate limiting lives in the database (`rate_limits`, via `backend/src/RateLimiter.php`), counts **only failed attempts**, and on `/api/quiz/join` the code is validated *before* the limit is consulted.

Current limits:

| Endpoint | Limit | Keyed on |
|---|---|---|
| `/api/quiz/join` | 30 failures / 5 min, 120 / hour | IP |
| `/api/auth/login` | 8 failures / 15 min | account |
| `/api/auth/login` | 40 failures / 15 min | IP |
| `/api/auth/register` | 10 requests / hour | IP |
| `/api/generate/stream` | 60 requests / hour | account |

## Why in the database

Apache hands each request to whichever PHP worker is free, and workers share no memory. A counter in process memory would limit nothing.

## Why failures only, and why the code is checked first

A school reaches the internet through one IP. Thirty Students joining a Test at the bell is thirty requests from one address — indistinguishable, by volume alone, from an attack.

The first implementation guarded before the lookup. Testing showed exactly the failure that predicts: after 30 wrong codes, a Student with the **correct** code got a 429. One person guessing would lock out the class.

So the order is deliberate. A valid Access Code always joins, whatever the counter says. Only a wrong code increments it, and a successful join clears the burst counter so one classmate's typos don't accumulate against everyone else.

## Trade-off

An attacker who does guess a live code is not blocked on that request — but that is the case where they have already won, and the limits exist to make reaching it improbable: 120 failures per hour against a 10 000-code space, with codes living four hours.

The limiter **fails open**. If the `rate_limits` table is unreachable the request proceeds and the failure is logged. Availability during a database wobble matters more than the counter, and every other check still applies.

## When to revisit

If a per-IP limit is ever too coarse — a district behind one NAT, say — key the quiz-join limit on something narrower. Raising the numbers is not the fix; the shape of the key is.
