# ADR-0001: Lesson Plans and Tests share one database table

**Status:** Accepted  
**Date:** 2026-07-24

## Decision

Lesson Plans and Tests are both stored in the `generations` table, distinguished by a `type` column (`lesson_plan` or `test`). They are not stored in separate tables.

## Why

Both are AI-generated documents produced by the same streaming pipeline (`/api/generate/stream`). At the time this was built they had identical storage needs: a prompt, a markdown result, a status, and ownership by a teacher. Splitting them into two tables would have duplicated the entire schema with no benefit.

## Trade-off

The table name `generations` is a technical term — it describes the act of generating, not what was created. This leaks implementation language into the domain. The domain speaks of Lesson Plans and Tests; the database speaks of generations.

To contain the leak: the frontend uses `api.lessonPlans.*` and `api.tests.*` — two named namespaces that both call `/api/generations` under the hood. Code reading the frontend never sees "generation"; code reading the database does.

## When to revisit

If Lesson Plans and Tests diverge significantly in structure (e.g., Tests gain question banks, scoring rubrics, or versioning that Lesson Plans don't need), split the table then. Not before.

## Implementation note (2026-08-12)

The `type` column this ADR describes did not exist until migration `004`. `POST /api/generations` accepted the field and dropped it, and the GET never returned it — so the discriminator was documented but never real. The Dashboard listed everything and the Create Test library listed nothing. The column, the insert and a `?type=` filter now exist, and the two `api.*` namespaces described above each ask for their own kind.
