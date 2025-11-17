## Problem
- Back requires multiple presses because the component pushes new history entries when navigating backward (using `pushState`), instead of popping to the previous entry.
- This inflates the history stack and makes both the UI Back and browser Back cumbersome.

## Plan
1. Use `window.history.back()` for Back actions:
   - In `PracticeLobby` header Back button, call `history.back()` regardless of the current subview; do not `pushState` when going backward.
   - For `PracticeQuestionView` Back (provided via `onBack` from `PracticeLobby`), call `history.back()` and let the `popstate` handler update local state.
2. Keep forward navigation pushing state:
   - Continue to use `pushState` when drilling down (select branch → subjects, select subject → topics, select topic → questions, open saved → saved).
3. Rely on the existing `popstate` listener to set `selectedBranch`, `selectedSubject`, `selectedTopic`, `showSavedQuestions` appropriately when entries are popped.

## Scope
- Update `src/components/PracticeLobby.tsx`:
  - Header Back button: replace conditional `setState + pushState` with `history.back()`.
  - `onBack` passed to `PracticeQuestionView`: replace set/reset + push with `history.back()`.
  - `onBack` for Saved Questions view: replace set/reset + push with `history.back()`.

## Verification
- Navigate: branches → subjects → topics → questions.
- Clicking the UI Back should return to topics with a single press, and browser Back should step exactly one level per press.
- Saved Questions Back behaves similarly.