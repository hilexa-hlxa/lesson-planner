# Domain Glossary

## Teacher
A registered user with role `teacher`. Creates Lesson Plans and Tests, manages Classes, runs live Test sessions, and reads Reports. The primary user of the platform — students are consumers of what teachers create.

## Student
A registered user with role `student`. Joins Classes, takes Tests, sees their results immediately after finishing, and can review their Test history per Class.

## Student History
A Student's record of Tests taken within a Class. Shown as a list: test name, date, score. Each entry has a "See More" button that expands into a per-topic breakdown — which topics the student failed at. Built from their Test Results.

## Lesson Plan
An AI-generated document for a single lesson. Contains goals, timeline, equipment, key concepts, tasks, differentiation, assessment, and homework. Created by a Teacher and exported as DOCX or viewed in-app. Stored in the `generations` table with `type = 'lesson_plan'`.

## Test
An AI-generated set of questions on a topic and grade level. Created by a Teacher on the Create Test page. Can be activated for live play by issuing an Access Code. Stored in the `generations` table with `type = 'test'`. "Quiz" is a synonym — avoid it; prefer "Test" in all new code and UI.

## Access Code
A 4-digit code that activates a Test for live play. A Teacher generates it; Students enter it to join the session. Expires after 4 hours. Lives on the `generations` record (`access_code`, `code_expires_at`).

It doubles as the shared secret between Teacher and class: presenting a live Access Code is what authorises joining. Wrong codes are rate limited, correct ones never are — see ADR-0003.

## Generation Settings
Per-Teacher preferences for how content is generated: tone, level of detail, which sections a Lesson Plan should contain, and quiz difficulty and length. Edited on the Prompts page, stored in `users.prompt_config`, and substituted into the prompt at generation time.

## Test Attempt
One Student's run through a live Test, from entering the Access Code to finishing. Holds the position they have reached and the options they have chosen so far, so the server — not the browser — decides what is correct. Identified by a one-time token issued at join; the database stores only its hash. Stored in `quiz_attempts`. See ADR-0002.

An Attempt is in progress until it is submitted; a submitted Attempt becomes a Test Result. One finished Attempt per name per Access Code session.

## Test Result
The record of one Student's completed attempt at a Test. Captures score, percentage, duration, and per-question answers. Scored by the server from its own answer key — never from figures sent by the browser. Stored in `quiz_results`. Multiple Test Results exist per Test (one per Student who participated).

## Report
An AI-generated summary produced after a Test session ends. Shows the class average score, a list of questions, and which students answered each correctly or not. Written in the Teacher's active language. Derived from the set of Test Results for a given Test.

## Class
A named group of Students belonging to one Teacher. Has a Join Code. Students apply to join; the Teacher approves them individually or all at once, and can remove them. A Test can be linked to a Class so its history is tracked.

## Join Code
A 6-character alphanumeric code used to apply to a Class. Distinct from an Access Code (which is 4 digits and temporary). Permanent — does not expire.

## Membership
The relationship between a Student and a Class. Has two states: `pending` (applied, awaiting teacher approval) and `approved` (active member).

## Wordle Game
A classroom word-guessing game. Two modes:
- **Class mode** — Teacher sets a word (typed manually or AI-suggested based on lesson topic). Students join on their devices and guess letter by letter together in real time.
- **Solo mode** — Student plays alone at home. Word is drawn randomly from a static Word Bank. No teacher needed.

## Word Bank
A curated set of school-appropriate words stored in the database, used for Wordle solo mode. 10 words per language (Russian, Kazakh, English) — seeded once by AI, never regenerated. Language follows the student's active language setting.

## Game Session
A Teacher-hosted round of a classroom game, joined by an Access Code: a 4-digit code, a 4-hour TTL, and one active session per Teacher per game. Wordle Game, Hangman, Math Battle (duel mode), and Trivia Race are each backed by their own Game Session table (`wordle_sessions`, `hangman_sessions`, `math_battle_sessions`, `trivia_race_sessions`) rather than one shared table — see ADR-0004.

## Hangman
A classroom word-guessing game, structurally a Game Session identical to Wordle Game but tracked as its own concept: wrong letters progressively reveal a friendly robot instead of ending the round outright. Same Word Bank, same Class/Solo split as Wordle Game.

## Math Battle
A timed arithmetic game. Solo mode is a personal best against the clock, scored in the browser. Duel mode is a Game Session: the Teacher picks a grade, the server generates and holds the problem set, and Students race to answer — only a correct answer advances a Student past a problem.

## Memory Match
A flip-card pairing game: match a term to its definition from a Practice Subject. Solo only — no Game Session, no Teacher hosting; the score is a personal best.

## Word Sprint
A typing-speed game: retype a displayed sentence as fast and accurately as possible. Solo only, scored by words-per-minute and accuracy.

## Sort It Out
A categorisation game: assign each term from a Practice Subject to its correct category by tapping. Solo only; a "perfect" run has zero mistaken placements.

## Trivia Race
A Game Session built on an existing Test rather than on its own content: the Teacher picks one of their Tests, and Students who answer correctly move a token forward along a shared board. First to the end wins; a wrong answer doesn't end the round, it just doesn't move you.

## Spin & Answer
A Teacher-only tool, not a Student Game: a spinning wheel that randomly picks either a Student from a Class roster (to call on) or an entry from a free-typed list (e.g. topics). Picking a real Student lets the Teacher award them Coins on the spot.

## Practice Subject
One of a small, curated set (Biology, Chemistry, Math, History, Geography) used by Memory Match and Sort It Out, each with its own fixed bank of terms and categories. Distinct from the free-text `subject` a Teacher types when creating a Lesson Plan or Test — a Practice Subject is a fixed catalog entry, not arbitrary text. "Subject" alone is ambiguous between the two; say "Practice Subject" when this is the one meant.

## Daily Challenge
A short, five-question quiz that is the same for every Student on a given calendar day, chosen deterministically from a fixed bank by day-of-year rather than generated per request. Not a Test — there is no Access Code, no Test Result, and no per-question review; its only lasting effect is extending a Streak.

## Streak
The count of consecutive calendar days a Student has completed the Daily Challenge. Decided by the server against its own clock (`user_streaks.last_completed_date` compared with `CURRENT_DATE`), never by a date the client reports — otherwise setting a phone's clock forward would extend it for free.

## Achievement
A one-time milestone a user unlocks, each worth a fixed Coins reward, defined once per language in a single catalog (`ACHIEVEMENTS`) rather than duplicated at each call site. Always granted through one persisted path (`POST /api/achievements/grant`); an earlier client-only path credited Coins in memory without saving them; it no longer exists.

## Coins
A Student's spendable point balance (`users.coins`). Earned by unlocking an Achievement, or awarded directly by a Teacher through Spin & Answer. Not tied to a Test Result — only to Achievements and Teacher discretion.

## Lesson Summary
An AI-generated write-up of what happened in a single lesson. Contains: topic covered, homework set, and (when a Test was run) which students are struggling and at what topics. Generated in the Teacher's active language.

A Teacher triggers it by filling a short form (subject, topic, brief notes). If a Test session is attached, the AI also pulls in Test Results automatically. Output is text the Teacher copies and pastes into Kundelik.

Available in two places: on the Create Test page after a test session ends, and on the Tools/Hub page for lessons where no test was run. Direct Kundelik API integration is deferred to a future phase.
