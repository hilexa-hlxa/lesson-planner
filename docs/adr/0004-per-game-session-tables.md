# ADR-0004: Each classroom game gets its own Game Session table

**Status:** Accepted
**Date:** 2026-08-26

## Decision

Hangman, Math Battle (duel mode), and Trivia Race each got their own `*_sessions` table (`hangman_sessions`, `math_battle_sessions`, `trivia_race_sessions`), copying the shape `wordle_sessions` already established: `teacher_id`, an `access_code` unique 4-digit column, an `expires_at` TTL, and a per-game payload column. We did not add a `game_type` discriminator column to one shared `game_sessions` table.

## Why not one shared table

A polymorphic `game_sessions` table would need a `payload` JSONB column shaped differently per game (a word for Hangman, a JSON array of problems for Math Battle, a `quiz_id` foreign key for Trivia Race), plus a `game_type` string to know which shape applies. Every query would need to filter on `game_type` anyway, so the "shared" table buys deduplication of four columns (`id`, `teacher_id`, `access_code`, `expires_at`) at the cost of losing real foreign keys and real column types on the payload.

CONTEXT.md already treats Wordle Game and Hangman as distinct domain concepts even though their mechanics are nearly identical — one table per game keeps that distinction visible in the schema, not just in the glossary. A future reader looking at `hangman_sessions` doesn't have to know that `game_type = 'hangman'` is a possible value of some other table to find where Hangman's data lives.

## Trade-off

Adding a fifth game session type in the future means a fifth migration and a fifth block of nearly-identical PHP (generate code, check uniqueness, insert, look up on join) rather than one shared code path. That repetition is accepted deliberately: the four existing copies are short enough (under 30 lines each) that extracting a shared helper would mostly move the duplication into parameter lists instead of removing it.

## When to revisit

If a game needs to be hosted across multiple concurrent sessions per Teacher, or session state needs a full state machine beyond "open until it expires," the per-table shape stops being simple boilerplate and starts being simple redundancy — that's the point to reconsider a shared table with a real supertype.
