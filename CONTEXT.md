# Domain Glossary

## Teacher
A registered user with role `teacher`. Creates Lesson Plans and Tests, manages Classes, runs live Test sessions, and reads Reports. The primary user of the platform — students are consumers of what teachers create.

## Student
A registered user with role `student`. Joins Classes, takes Tests, and receives feedback through their teacher.

## Lesson Plan
An AI-generated document for a single lesson. Contains goals, timeline, equipment, key concepts, tasks, differentiation, assessment, and homework. Created by a Teacher and exported as DOCX or viewed in-app. Stored in the `generations` table with `type = 'lesson_plan'`.

## Test
An AI-generated set of questions on a topic and grade level. Created by a Teacher on the Create Test page. Can be activated for live play by issuing an Access Code. Stored in the `generations` table with `type = 'test'`. "Quiz" is a synonym — avoid it; prefer "Test" in all new code and UI.

## Access Code
A 4-digit code that activates a Test for live play. A Teacher generates it; Students enter it to join the session. Expires after 4 hours. Lives on the `generations` record (`access_code`, `code_expires_at`).

## Test Result
The record of one Student's attempt at a Test. Captures score, percentage, duration, and per-question answers. Stored in `quiz_results`. Multiple Test Results exist per Test (one per Student who participated).

## Report
An AI-generated summary produced after a Test session ends. Shows the class average score, a list of questions, and which students answered each correctly or not. Written in the Teacher's active language. Derived from the set of Test Results for a given Test.

## Class
A named group of Students belonging to one Teacher. Has a Join Code. Students apply to join; the Teacher approves them individually or all at once, and can remove them. A Test can be linked to a Class so its history is tracked.

## Join Code
A 6-character alphanumeric code used to apply to a Class. Distinct from an Access Code (which is 4 digits and temporary). Permanent — does not expire.

## Membership
The relationship between a Student and a Class. Has two states: `pending` (applied, awaiting teacher approval) and `approved` (active member).

## Lesson Summary
An AI-generated write-up of what happened in a lesson — topics covered, homework set. Produced by the Teacher after a session, intended to be pasted into Kundelik (the national gradebook). Not yet built; planned for a future phase.
