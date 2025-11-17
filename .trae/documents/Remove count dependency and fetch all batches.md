## Problem
- The practice view still shows 1000 because the fetch logic depends on `totalCount` and runs concurrently with the count request. If `totalCount` is 1000 or not yet available when fetching, batching stops early.

## Plan
- Make batch fetching count-independent:
  - Topic questions: loop `.range(start, end)` in 1000-sized chunks until a batch returns less than 1000, then stop. Do not rely on `totalCount`.
  - Saved-only: page through `saved_questions` IDs in 1000-sized chunks until a batch returns less than 1000, then stop; then fetch `quiz_questions` in 1000-ID chunks.
- After fetching, set `totalCount` from `questions.length` to ensure the header displays the true total even if count APIs report 1000.
- Keep separate `fetchTotalCount()` for fast initial display, but no longer use it to bound fetching.
- Remove added inline comments to match repo style.

## Scope
- Update `src/components/PracticeQuestionView.tsx` only:
  - Refactor `loadQuestions()` batching to be count-independent.
  - Set `totalCount` to the fetched length after loading.
  - Keep existing UI and progress using `totalCount`.

## Verification
- Open a topic with >1000 questions and confirm the header shows the full count and all questions load beyond 1000. 